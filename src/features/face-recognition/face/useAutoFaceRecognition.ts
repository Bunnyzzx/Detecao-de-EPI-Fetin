import type { CameraView } from 'expo-camera';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import { FaceNetSession } from '../onnx/FaceNetSession';

import { FaceDetector } from './faceDetector';
import { analyzePhoto, type PipelineResult } from './facePipeline';

export type AutoFaceRecognitionStatus = 'preparando' | 'pronto' | 'analisando' | 'erro';

export interface UseAutoFaceRecognitionOptions {
  cameraRef: RefObject<CameraView | null>;
}

export interface UseAutoFaceRecognitionResult {
  status: AutoFaceRecognitionStatus;
  setupError: string | null;
  result: PipelineResult | null;
  /**
   * Dispara uma única tentativa de reconhecimento: uma captura, uma análise,
   * um resultado. Não faz nada se o detector/modelo ainda não carregaram ou
   * se já existe uma tentativa em andamento.
   */
  recognize: () => void;
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
 * Controlador de uma tentativa de reconhecimento facial.
 *
 * Não reimplementa nada do pipeline: só orquestra uma chamada a
 * `analyzePhoto`, mantendo detector e sessão do FaceNet vivos entre
 * tentativas (recriá-los a cada vez pagaria de novo o quase 1 s de carga do
 * FaceNet). Cada chamada a `recognize()` é uma tentativa isolada — quem
 * decide se e quando tentar de novo é o chamador, não este hook.
 */
export const useAutoFaceRecognition = ({
  cameraRef,
}: UseAutoFaceRecognitionOptions): UseAutoFaceRecognitionResult => {
  const [setupState, setSetupState] = useState<'preparando' | 'pronto' | 'erro'>('preparando');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const detectorRef = useRef<FaceDetector | null>(null);
  const sessionRef = useRef<FaceNetSession | null>(null);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  /**
   * Detector e modelo carregam uma única vez e ficam vivos enquanto este
   * hook existir.
   */
  useEffect(() => {
    mountedRef.current = true;
    const detector = new FaceDetector();
    const session = new FaceNetSession();
    detectorRef.current = detector;
    sessionRef.current = session;

    void (async () => {
      try {
        await detector.initialize();
        await session.load();
        if (!mountedRef.current) return;
        setSetupState('pronto');
      } catch (caught) {
        if (!mountedRef.current) return;
        setSetupError(caught instanceof Error ? caught.message : String(caught));
        setSetupState('erro');
      }
    })();

    return () => {
      mountedRef.current = false;
      void session.release();
    };
  }, []);

  const recognize = useCallback(() => {
    if (runningRef.current || setupState !== 'pronto') {
      return;
    }
    const camera = cameraRef.current;
    const detector = detectorRef.current;
    const session = sessionRef.current;
    if (!camera || !detector || !session) {
      return;
    }

    runningRef.current = true;
    setIsRunning(true);

    void (async () => {
      try {
        const foto = await camera.takePictureAsync({ skipProcessing: true, quality: 1 });
        if (!mountedRef.current) return;
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
        if (mountedRef.current) {
          setResult(analisado);
        }
      } catch (caught) {
        if (mountedRef.current) {
          setResult(emptyPipelineResult(caught instanceof Error ? caught.message : String(caught)));
        }
      } finally {
        runningRef.current = false;
        if (mountedRef.current) {
          setIsRunning(false);
        }
      }
    })();
  }, [cameraRef, setupState]);

  const status: AutoFaceRecognitionStatus =
    setupState === 'erro'
      ? 'erro'
      : setupState === 'preparando'
        ? 'preparando'
        : isRunning
          ? 'analisando'
          : 'pronto';

  return { status, setupError, result, recognize };
};
