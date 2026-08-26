import type { Box } from './faceGeometry';

export interface DetectedFace {
  box: Box;
  /** Ângulos de cabeça reportados pelo ML Kit; só exibidos, nunca aplicados. */
  headEulerAngleY: number | null;
  headEulerAngleZ: number | null;
}

export class FaceDetectorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FaceDetectorError';
  }
}

interface MlkitRect {
  origin: { x: number; y: number };
  size: { x: number; y: number };
}

/**
 * Envoltório do ML Kit.
 *
 * Existe para que o resto do código não conheça o formato do detector: o ML
 * Kit devolve `{ origin, size }`, e daqui para dentro tudo trabalha com
 * `{ x, y, width, height }`. Trocar de detector depois muda só este arquivo.
 */
export class FaceDetector {
  private detector: {
    status: string;
    initialize: (options?: { performanceMode: string }) => Promise<void>;
    detectFaces: (uri: string) => Promise<
      | {
          faces: {
            frame: MlkitRect;
            headEulerAngleY?: number | null;
            headEulerAngleZ?: number | null;
          }[];
          success: boolean;
          error: string | null;
        }
      | undefined
    >;
  } | null = null;

  initMs: number | null = null;

  get ready(): boolean {
    return this.detector?.status === 'ready';
  }

  get status(): string {
    return this.detector?.status ?? 'não inicializado';
  }

  async initialize(): Promise<void> {
    const { RNMLKitFaceDetector } = await import('@infinitered/react-native-mlkit-face-detection');

    // `true` adia a inicialização para medi-la explicitamente.
    const detector = new RNMLKitFaceDetector({ performanceMode: 'accurate' }, true);
    this.detector = detector as unknown as typeof this.detector;

    const iniciou = Date.now();
    await detector.initialize({ performanceMode: 'accurate' });
    this.initMs = Date.now() - iniciou;

    // `initialize` engole exceções e sinaliza pelo status, então é ele que
    // decide se deu certo.
    if (detector.status !== 'ready') {
      throw new FaceDetectorError(`Detector terminou em "${detector.status}".`);
    }
  }

  async detect(imageUri: string): Promise<DetectedFace[]> {
    if (!this.detector) {
      throw new FaceDetectorError('O detector não foi inicializado.');
    }

    const resultado = await this.detector.detectFaces(imageUri);
    if (!resultado) {
      throw new FaceDetectorError('A detecção não devolveu resultado.');
    }
    if (!resultado.success) {
      throw new FaceDetectorError(resultado.error ?? 'Falha desconhecida na detecção.');
    }

    return resultado.faces.map((face) => ({
      box: {
        x: face.frame.origin.x,
        y: face.frame.origin.y,
        width: face.frame.size.x,
        height: face.frame.size.y,
      },
      headEulerAngleY: face.headEulerAngleY ?? null,
      headEulerAngleZ: face.headEulerAngleZ ?? null,
    }));
  }
}
