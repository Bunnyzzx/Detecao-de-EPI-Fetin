import type { CameraView } from 'expo-camera';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { FaceNetSession } from '../onnx/FaceNetSession';

import { FaceDetector } from './faceDetector';
import { analyzePhoto, type PipelineResult } from './facePipeline';

/**
 * Intervalo entre análises automáticas.
 *
 * Conservador e ainda não calibrado com dados reais de campo: o objetivo
 * inicial é "tempo real o suficiente" sem sobrecarregar o tablet, não uma
 * taxa otimizada.
 */
export const AUTO_RECOGNITION_INTERVAL_MS = 1000;

export type AutoFaceRecognitionStatus = 'preparando' | 'pronto' | 'analisando' | 'erro';

export interface UseAutoFaceRecognitionOptions {
  cameraRef: RefObject<CameraView | null>;
  /** Verdadeiro enquanto o laço de reconhecimento deve estar rodando. */
  active: boolean;
  /** Sobrescreve o intervalo padrão — usado pelos testes para não esperar segundos reais. */
  intervalMs?: number;
}

export interface UseAutoFaceRecognitionResult {
  status: AutoFaceRecognitionStatus;
  setupError: string | null;
  result: PipelineResult | null;
}

const emptyPipelineResult = (error: string): PipelineResult => ({
  facesDetected: 0,
  imageWidth: 0,
  imageHeight: 0,
  rawBox: null,
  cropBox: null,
  headEulerAngleX: null,
  headEulerAngleY: null,
  headEulerAngleZ: null,
  trackingId: null,
  embeddingDim: null,
  embeddingNorm: null,
  match: null,
  timings: null,
  cropPreviewUri: null,
  error,
});

/**
 * Controlador do reconhecimento facial automático.
 *
 * Não reimplementa nada do pipeline: apenas agenda chamadas repetidas a
 * `analyzePhoto`, mantendo detector e sessão do FaceNet vivos entre elas. A
 * próxima captura só é agendada depois que a anterior termina (sucesso ou
 * erro) — por construção nunca existem duas análises em voo ao mesmo tempo.
 */
export const useAutoFaceRecognition = ({
  cameraRef,
  active,
  intervalMs = AUTO_RECOGNITION_INTERVAL_MS,
}: UseAutoFaceRecognitionOptions): UseAutoFaceRecognitionResult => {
  const [setupState, setSetupState] = useState<'preparando' | 'pronto' | 'erro'>('preparando');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const detectorRef = useRef<FaceDetector | null>(null);
  const sessionRef = useRef<FaceNetSession | null>(null);

  /**
   * Detector e modelo carregam uma única vez e ficam vivos enquanto este
   * hook existir — recriá-los a cada análise pagaria de novo o quase 1 s de
   * carga do FaceNet a cada tentativa.
   */
  useEffect(() => {
    let ativo = true;
    const detector = new FaceDetector();
    const session = new FaceNetSession();
    detectorRef.current = detector;
    sessionRef.current = session;

    void (async () => {
      try {
        await detector.initialize();
        await session.load();
        if (!ativo) return;
        setSetupState('pronto');
      } catch (caught) {
        if (!ativo) return;
        setSetupError(caught instanceof Error ? caught.message : String(caught));
        setSetupState('erro');
      }
    })();

    return () => {
      ativo = false;
      void session.release();
    };
  }, []);

  useEffect(() => {
    if (!active || setupState !== 'pronto') {
      return;
    }

    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelado) {
        return;
      }
      const camera = cameraRef.current;
      const detector = detectorRef.current;
      const session = sessionRef.current;

      if (!camera || !detector || !session) {
        // Câmera momentaneamente indisponível (ex.: permissão em transição):
        // tenta de novo no próximo ciclo em vez de travar o laço.
        timer = setTimeout(tick, intervalMs);
        return;
      }

      try {
        const foto = await camera.takePictureAsync({ skipProcessing: true, quality: 1 });
        if (cancelado) return;
        if (!foto?.uri) {
          throw new Error('A câmera não devolveu imagem.');
        }

        const analisado = await analyzePhoto({
          photoUri: foto.uri,
          photoWidth: foto.width,
          photoHeight: foto.height,
          detector,
          session,
        });
        if (!cancelado) {
          setResult(analisado);
        }
      } catch (caught) {
        if (!cancelado) {
          setResult(emptyPipelineResult(caught instanceof Error ? caught.message : String(caught)));
        }
      } finally {
        if (!cancelado) {
          timer = setTimeout(tick, intervalMs);
        }
      }
    };

    void tick();

    return () => {
      cancelado = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [active, setupState, cameraRef, intervalMs]);

  const status: AutoFaceRecognitionStatus =
    setupState === 'erro'
      ? 'erro'
      : setupState === 'preparando'
        ? 'preparando'
        : active
          ? 'analisando'
          : 'pronto';

  return { status, setupError, result };
};
