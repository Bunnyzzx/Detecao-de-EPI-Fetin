import {
  buildScenarioDetection,
  pickScenario,
  type DetectionScenario,
} from '@/features/epi-detection/mocks/detectionScenarios';
import type { DetectedEpi, EpiId } from '@/features/epi-detection/types';
import {
  buildDetectionResult,
  toDetectedEpi,
  type RawDetection,
} from '@/features/epi-detection/utils/buildDetectionResult';
import { MockFaceRecognitionService } from '@/features/face-recognition/services/MockFaceRecognitionService';
import type { FaceRecognitionService } from '@/features/face-recognition/types';
import { AppError } from '@/services/errors';
import { createId, delay } from '@/utils';

import type {
  SessionEventListener,
  VerificationOutcome,
  VerificationSessionInput,
  VerificationSessionService,
} from '../types';

export interface MockVerificationSessionServiceOptions {
  /** Fonte de aleatoriedade injetável — os testes passam um valor fixo. */
  random?: () => number;
  /** Tempo simulado de abertura da sessão. */
  openingMs?: number;
  /** Tempo gasto avaliando cada equipamento. */
  stepMs?: number;
  /** Força um cenário de EPI específico, para demonstração e testes. */
  forcedScenario?: string;
  /** Permite injetar outro reconhecimento facial (real ou forçado). */
  faceRecognition?: FaceRecognitionService;
}

const DEFAULT_OPENING_MS = 500;
const DEFAULT_STEP_MS = 550;

/**
 * Sessão de verificação simulada.
 *
 * Conduz a sequência completa — abertura, reconhecimento facial e detecção de
 * EPIs um a um — emitindo os mesmos eventos que o dispositivo embarcado
 * emitirá. É isso que permite trocar este mock pelo cliente real sem tocar em
 * nenhuma tela.
 */
export class MockVerificationSessionService implements VerificationSessionService {
  private readonly random: () => number;
  private readonly openingMs: number;
  private readonly stepMs: number;
  private readonly forcedScenario: string | undefined;
  private readonly faceRecognition: FaceRecognitionService;

  constructor(options: MockVerificationSessionServiceOptions = {}) {
    this.random = options.random ?? Math.random;
    this.openingMs = options.openingMs ?? DEFAULT_OPENING_MS;
    this.stepMs = options.stepMs ?? DEFAULT_STEP_MS;
    this.forcedScenario = options.forcedScenario;
    this.faceRecognition =
      options.faceRecognition ?? new MockFaceRecognitionService({ random: this.random });
  }

  async run(
    input: VerificationSessionInput,
    onEvent: SessionEventListener,
  ): Promise<VerificationOutcome> {
    const { requiredItems, signal } = input;

    if (requiredItems.length === 0) {
      throw new AppError(
        'invalid_response',
        'Nenhum equipamento está ativo para verificação. Ajuste a configuração no painel administrativo.',
      );
    }

    const startedAt = Date.now();

    onEvent({ type: 'OPENED' });
    await delay(this.openingMs, signal);

    onEvent({ type: 'FACE_SCANNING' });
    const face = await this.faceRecognition.recognize(signal ? { signal } : {});

    if (face.status === 'recognized') {
      onEvent({ type: 'FACE_RECOGNIZED', employee: face.employee, confidence: face.confidence });
    } else {
      onEvent({ type: 'FACE_UNKNOWN', confidence: face.confidence });
    }

    onEvent({ type: 'EPI_STARTED' });

    const scenario = pickScenario(this.random, this.forcedScenario);
    const detections = await this.detectStepByStep(requiredItems, scenario, onEvent, signal);

    const outcome: VerificationOutcome = {
      id: createId(),
      employee: face.status === 'recognized' ? face.employee : null,
      faceConfidence: face.confidence,
      detection: buildDetectionResult({
        requiredItems,
        detections,
        engine: 'mock',
        processingTimeMs: Date.now() - startedAt,
      }),
      verifiedAt: new Date().toISOString(),
    };

    onEvent({ type: 'COMPLETED', outcome });

    return outcome;
  }

  /** Avalia um equipamento por vez, emitindo progresso a cada passo. */
  private async detectStepByStep(
    requiredItems: EpiId[],
    scenario: DetectionScenario,
    onEvent: SessionEventListener,
    signal: AbortSignal | undefined,
  ): Promise<RawDetection[]> {
    const detections: RawDetection[] = [];
    const items: DetectedEpi[] = requiredItems.map((id) =>
      toDetectedEpi({ id, detected: false, confidence: 0 }),
    );

    onEvent({
      type: 'EPI_PROGRESS',
      progress: 0,
      items: [...items],
      currentItem: requiredItems[0] ?? null,
    });

    for (const [index, epiId] of requiredItems.entries()) {
      await delay(this.stepMs, signal);

      const detection = buildScenarioDetection(epiId, scenario, this.random);
      detections.push(detection);
      items[index] = toDetectedEpi(detection);

      onEvent({
        type: 'EPI_PROGRESS',
        progress: (index + 1) / requiredItems.length,
        items: [...items],
        currentItem: requiredItems[index + 1] ?? null,
      });
    }

    return detections;
  }
}
