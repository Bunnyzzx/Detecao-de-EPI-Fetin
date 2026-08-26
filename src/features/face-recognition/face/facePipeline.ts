import { toByteArray } from 'base64-js';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as UPNG from 'upng-js';

import { matchAgainstGallery, type MatchResult } from '../gallery/matchEmbedding';
import { loadMockGallery } from '../gallery/mockGallery';
import { FACENET_IMAGE_SIZE, l2Norm, rgbaToChwTensor } from '../onnx/facenetPreprocess';
import type { FaceNetSession } from '../onnx/FaceNetSession';

import type { FaceDetector, DetectedFace } from './faceDetector';
import { pickLargestBox, toSquareBox, type Box } from './faceGeometry';

export interface PipelineTimings {
  detectMs: number;
  cropMs: number;
  decodeMs: number;
  tensorMs: number;
  inferenceMs: number;
  matchMs: number;
  totalMs: number;
}

export interface PipelineResult {
  facesDetected: number;
  imageWidth: number;
  imageHeight: number;
  rawBox: Box | null;
  cropBox: Box | null;
  headEulerAngleX: number | null;
  headEulerAngleY: number | null;
  headEulerAngleZ: number | null;
  trackingId: number | null;
  embeddingDim: number | null;
  embeddingNorm: number | null;
  match: MatchResult | null;
  timings: PipelineTimings | null;
  /** Recorte 160x160 em data URI, só para conferência visual na tela. */
  cropPreviewUri: string | null;
  error: string | null;
}

export class PipelineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PipelineError';
  }
}

const emptyResult = (): PipelineResult => ({
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
  error: null,
});

/**
 * Percorre foto → rosto → recorte → tensor → embedding → galeria.
 *
 * Cada etapa é cronometrada separadamente porque o objetivo desta fase é
 * medir, não otimizar. Nenhum limiar é ajustado aqui: a regra é aplicada tal
 * como está e o resultado bruto vai inteiro para a tela.
 */
export const analyzePhoto = async (input: {
  photoUri: string;
  photoWidth: number;
  photoHeight: number;
  detector: FaceDetector;
  session: FaceNetSession;
}): Promise<PipelineResult> => {
  const { photoUri, photoWidth, photoHeight, detector, session } = input;
  const result = emptyResult();
  result.imageWidth = photoWidth;
  result.imageHeight = photoHeight;

  const inicioTotal = Date.now();

  try {
    // 1. Detecção — sobre o arquivo salvo, o mesmo que será recortado.
    const t0 = Date.now();
    const faces: DetectedFace[] = await detector.detect(photoUri);
    const detectMs = Date.now() - t0;

    result.facesDetected = faces.length;

    // Nenhum rosto não é falha técnica: o detector rodou e respondeu. Fica
    // registrado em `facesDetected`, sem virar erro, para o diagnóstico
    // distinguir "não achou ninguém" de "quebrou".
    if (faces.length === 0) {
      result.timings = zeroTimings({ detectMs, totalMs: Date.now() - inicioTotal });
      return result;
    }

    const escolhido = pickLargestBox(faces);
    if (!escolhido) {
      throw new PipelineError('Nenhum rosto pôde ser escolhido.');
    }

    result.rawBox = escolhido.box;
    result.headEulerAngleX = escolhido.headEulerAngleX;
    result.headEulerAngleY = escolhido.headEulerAngleY;
    result.headEulerAngleZ = escolhido.headEulerAngleZ;
    result.trackingId = escolhido.trackingId;

    // 2. Quadratura e recorte. Sem margem, como no enrollment.
    const cropBox = toSquareBox(escolhido.box, photoWidth, photoHeight);
    result.cropBox = cropBox;

    const t1 = Date.now();
    const rendered = await ImageManipulator.manipulate(photoUri)
      .crop({
        originX: cropBox.x,
        originY: cropBox.y,
        width: cropBox.width,
        height: cropBox.height,
      })
      .resize({ width: FACENET_IMAGE_SIZE, height: FACENET_IMAGE_SIZE })
      .renderAsync();

    // PNG por ser sem perdas: artefato de JPEG perturbaria o embedding, e
    // esta etapa existe justamente para medir fidelidade.
    const saved = await rendered.saveAsync({ base64: true, format: SaveFormat.PNG });
    const cropMs = Date.now() - t1;

    if (saved.width !== FACENET_IMAGE_SIZE || saved.height !== FACENET_IMAGE_SIZE) {
      throw new PipelineError(
        `Recorte saiu ${saved.width}x${saved.height}, esperado ${FACENET_IMAGE_SIZE}x${FACENET_IMAGE_SIZE}.`,
      );
    }
    if (!saved.base64) {
      throw new PipelineError('O recorte não devolveu dados em base64.');
    }

    result.cropPreviewUri = `data:image/png;base64,${saved.base64}`;

    // 3. Decodificação até pixels RGBA reais.
    const t2 = Date.now();
    const png = UPNG.decode(toByteArray(saved.base64).buffer as ArrayBuffer);
    const frames = UPNG.toRGBA8(png);
    const primeiro = frames[0];
    if (!primeiro) {
      throw new PipelineError('O PNG decodificado não trouxe nenhum quadro.');
    }
    const rgba = new Uint8Array(primeiro);
    const decodeMs = Date.now() - t2;

    if (png.width !== FACENET_IMAGE_SIZE || png.height !== FACENET_IMAGE_SIZE) {
      throw new PipelineError(`PNG decodificado em ${png.width}x${png.height}.`);
    }

    // 4. Tensor CHW padronizado.
    const t3 = Date.now();
    const tensor = rgbaToChwTensor(rgba, FACENET_IMAGE_SIZE);
    const tensorMs = Date.now() - t3;

    // 5. Inferência.
    const { embedding, inferenceMs } = await session.embed(tensor);
    result.embeddingDim = embedding.length;
    result.embeddingNorm = l2Norm(embedding);

    // 6. Comparação com a galeria.
    const t5 = Date.now();
    result.match = matchAgainstGallery(embedding, loadMockGallery());
    const matchMs = Date.now() - t5;

    result.timings = {
      detectMs,
      cropMs,
      decodeMs,
      tensorMs,
      inferenceMs,
      matchMs,
      totalMs: Date.now() - inicioTotal,
    };
  } catch (caught) {
    result.error = caught instanceof Error ? caught.message : String(caught);
  }

  return result;
};

const zeroTimings = (parcial: Partial<PipelineTimings>): PipelineTimings => ({
  detectMs: 0,
  cropMs: 0,
  decodeMs: 0,
  tensorMs: 0,
  inferenceMs: 0,
  matchMs: 0,
  totalMs: 0,
  ...parcial,
});
