import { getEpiById } from '@/constants/epiCatalog';
import { AppError } from '@/services/errors';
import { clampUnit, delay } from '@/utils';

import { VERIFICATION_SCENARIOS, type VerificationScenario } from '../mocks/verificationScenarios';
import type {
  DetectedEpi,
  EpiId,
  EpiVerificationService,
  VerificationInput,
  VerificationProgressListener,
  VerificationResult,
} from '../types';
import { buildVerificationResult, toDetectedEpi, type RawDetection } from '../utils';

export interface MockEpiVerificationServiceOptions {
  /** Fonte de aleatoriedade injetável — os testes passam um valor fixo. */
  random?: () => number;
  /** Tempo gasto avaliando cada equipamento. */
  stepDurationMs?: number;
  /** Força um cenário específico, útil para demonstrações e testes. */
  forcedScenario?: string;
}

const DEFAULT_STEP_DURATION_MS = 650;

/**
 * Implementação simulada da verificação de EPIs.
 *
 * Avalia um equipamento por vez, emitindo progresso a cada passo — é isso que
 * faz o terminal parecer uma inspeção real acontecendo. Nenhum componente de
 * interface inventa resultados: tudo nasce aqui, no mesmo formato que a IA
 * de detecção usará.
 */
export class MockEpiVerificationService implements EpiVerificationService {
  private readonly random: () => number;
  private readonly stepDurationMs: number;
  private readonly forcedScenario: string | undefined;

  constructor(options: MockEpiVerificationServiceOptions = {}) {
    this.random = options.random ?? Math.random;
    this.stepDurationMs = options.stepDurationMs ?? DEFAULT_STEP_DURATION_MS;
    this.forcedScenario = options.forcedScenario;
  }

  async verify(
    input: VerificationInput,
    onProgress?: VerificationProgressListener,
  ): Promise<VerificationResult> {
    const { requiredItems, signal } = input;

    if (requiredItems.length === 0) {
      throw new AppError(
        'no_active_epis',
        'Nenhum equipamento está ativo para verificação. Ajuste a configuração no painel administrativo.',
      );
    }

    const startedAt = Date.now();
    const scenario = this.pickScenario();
    const detections: RawDetection[] = [];

    // Estado inicial: todos aguardando avaliação.
    const pending: DetectedEpi[] = requiredItems.map((epiId) =>
      toDetectedEpi({ id: epiId, detected: false, confidence: 0 }),
    );

    onProgress?.({ progress: 0, items: [...pending], currentItem: requiredItems[0] ?? null });

    for (const [index, epiId] of requiredItems.entries()) {
      await delay(this.stepDurationMs, signal);

      const detection = this.buildDetection(epiId, scenario);
      detections.push(detection);
      pending[index] = toDetectedEpi(detection);

      onProgress?.({
        progress: (index + 1) / requiredItems.length,
        items: [...pending],
        currentItem: requiredItems[index + 1] ?? null,
      });
    }

    return buildVerificationResult({
      requiredItems,
      detections,
      engine: 'mock',
      durationMs: Date.now() - startedAt,
    });
  }

  private buildDetection(epiId: EpiId, scenario: VerificationScenario): RawDetection {
    const baseline = getEpiById(epiId)?.baselineConfidence ?? 0.9;
    const jitter = (this.random() - 0.5) * 0.08;

    if (scenario.undetected.includes(epiId)) {
      return { id: epiId, detected: false, confidence: clampUnit(baseline * 0.35 + jitter) };
    }

    return {
      id: epiId,
      detected: true,
      confidence: clampUnit(baseline * scenario.confidenceFactor + jitter),
    };
  }

  private pickScenario(): VerificationScenario {
    if (this.forcedScenario) {
      const forced = VERIFICATION_SCENARIOS.find((item) => item.name === this.forcedScenario);
      if (forced) {
        return forced;
      }
    }

    const totalWeight = VERIFICATION_SCENARIOS.reduce((total, item) => total + item.weight, 0);
    let cursor = this.random() * totalWeight;

    for (const scenario of VERIFICATION_SCENARIOS) {
      cursor -= scenario.weight;
      if (cursor <= 0) {
        return scenario;
      }
    }

    return VERIFICATION_SCENARIOS[0] as VerificationScenario;
  }
}
