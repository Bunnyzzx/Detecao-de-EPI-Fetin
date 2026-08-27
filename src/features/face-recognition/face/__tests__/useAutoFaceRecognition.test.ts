import { renderHook, waitFor } from '@testing-library/react-native';
import type { CameraView } from 'expo-camera';
import type { RefObject } from 'react';

import type { MatchResult } from '../../gallery/matchEmbedding';
import { analyzePhoto, type PipelineResult } from '../facePipeline';
import { useAutoFaceRecognition } from '../useAutoFaceRecognition';

jest.mock('../faceDetector', () => ({
  FaceDetector: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../onnx/FaceNetSession', () => ({
  FaceNetSession: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../facePipeline', () => ({
  analyzePhoto: jest.fn(),
}));

const mockedAnalyzePhoto = analyzePhoto as jest.MockedFunction<typeof analyzePhoto>;

const emptyResult = (overrides: Partial<PipelineResult> = {}): PipelineResult => ({
  facesDetected: 0,
  imageWidth: 100,
  imageHeight: 100,
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
  ...overrides,
});

const matchResult = (passes: boolean, nome = 'Caio'): MatchResult => ({
  candidates: [{ nome, distance: passes ? 0.18 : 0.71 }],
  best: { nome, distance: passes ? 0.18 : 0.71 },
  second: null,
  ratio: null,
  passesDistance: passes,
  passesRatio: passes,
  passes,
});

/** Câmera falsa: só o método que o laço realmente chama. */
const fakeCameraRef = (takePictureAsync: jest.Mock) =>
  ({ current: { takePictureAsync } }) as unknown as RefObject<CameraView>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  mockedAnalyzePhoto.mockReset();
});

describe('carga do detector e do modelo', () => {
  it('carrega uma única vez, mesmo alternando o laço várias vezes', async () => {
    const { FaceDetector } = jest.requireMock('../faceDetector');
    const { FaceNetSession } = jest.requireMock('../../onnx/FaceNetSession');
    // Nunca resolve: o que este teste verifica é a carga do detector/modelo,
    // não o resultado de uma captura — uma captura pendente para sempre evita
    // que o laço reagende `setTimeout` repetidamente enquanto alternamos
    // `active` logo em seguida.
    const takePictureAsync = jest.fn().mockReturnValue(new Promise(() => {}));
    mockedAnalyzePhoto.mockResolvedValue(emptyResult());

    const { result, rerender, unmount } = await renderHook(
      ({ active }: { active: boolean }) =>
        useAutoFaceRecognition({ cameraRef: fakeCameraRef(takePictureAsync), active }),
      { initialProps: { active: false } },
    );

    await waitFor(() => expect(result.current.status).toBe('pronto'));

    await rerender({ active: true });
    await rerender({ active: false });
    await rerender({ active: true });

    expect(FaceDetector).toHaveBeenCalledTimes(1);
    expect(FaceNetSession).toHaveBeenCalledTimes(1);

    await unmount();
  });
});

describe('laço automático', () => {
  it('não captura nada antes de ser ativado', async () => {
    const takePictureAsync = jest.fn();
    const { result, unmount } = await renderHook(() =>
      useAutoFaceRecognition({ cameraRef: fakeCameraRef(takePictureAsync), active: false }),
    );

    await waitFor(() => expect(result.current.status).toBe('pronto'));
    await wait(20);

    expect(takePictureAsync).not.toHaveBeenCalled();

    await unmount();
  });

  it('nunca inicia uma nova captura antes da anterior terminar', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    let liberarAnalise: (value: PipelineResult) => void = () => {};
    mockedAnalyzePhoto.mockImplementation(
      () =>
        new Promise((resolve) => {
          liberarAnalise = resolve;
        }),
    );

    const { unmount } = await renderHook(() =>
      useAutoFaceRecognition({
        cameraRef: fakeCameraRef(takePictureAsync),
        active: true,
        intervalMs: 5,
      }),
    );

    await waitFor(() => expect(mockedAnalyzePhoto).toHaveBeenCalledTimes(1));

    // Bem mais que o intervalo: se houvesse sobreposição, uma segunda captura
    // já teria começado mesmo com a primeira análise ainda pendente.
    await wait(40);
    expect(takePictureAsync).toHaveBeenCalledTimes(1);

    liberarAnalise(emptyResult());

    await waitFor(() => expect(takePictureAsync).toHaveBeenCalledTimes(2));

    await unmount();
  });

  it('para completamente ao desmontar', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(emptyResult());

    const { unmount } = await renderHook(() =>
      useAutoFaceRecognition({
        cameraRef: fakeCameraRef(takePictureAsync),
        active: true,
        intervalMs: 5,
      }),
    );

    await waitFor(() => expect(takePictureAsync).toHaveBeenCalled());
    const chamadasAntes = takePictureAsync.mock.calls.length;

    await unmount();
    await wait(40);

    expect(takePictureAsync.mock.calls.length).toBe(chamadasAntes);
  });

  it('para ao desativar e retoma ao reativar, sem duplicar o laço', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(emptyResult());

    const { rerender, unmount } = await renderHook(
      ({ active }: { active: boolean }) =>
        useAutoFaceRecognition({
          cameraRef: fakeCameraRef(takePictureAsync),
          active,
          intervalMs: 5,
        }),
      { initialProps: { active: true } },
    );

    await waitFor(() => expect(takePictureAsync).toHaveBeenCalled());

    await rerender({ active: false });
    const chamadasPausado = takePictureAsync.mock.calls.length;
    await wait(30);
    expect(takePictureAsync.mock.calls.length).toBe(chamadasPausado);

    await rerender({ active: true });
    await waitFor(() =>
      expect(takePictureAsync.mock.calls.length).toBeGreaterThan(chamadasPausado),
    );

    await unmount();
  });
});

describe('resultados propagados', () => {
  const renderAtivo = (analise: PipelineResult) => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(analise);

    return renderHook(() =>
      useAutoFaceRecognition({
        cameraRef: fakeCameraRef(takePictureAsync),
        active: true,
        intervalMs: 5,
      }),
    );
  };

  it('zero rostos não vira erro', async () => {
    const { result, unmount } = await renderAtivo(emptyResult({ facesDetected: 0 }));

    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(result.current.result?.facesDetected).toBe(0);
    expect(result.current.result?.error).toBeNull();

    await unmount();
  });

  it('propaga funcionário identificado', async () => {
    const { result, unmount } = await renderAtivo(
      emptyResult({ facesDetected: 1, match: matchResult(true, 'Caio') }),
    );

    await waitFor(() => expect(result.current.result?.match?.passes).toBe(true));

    expect(result.current.result?.match?.best?.nome).toBe('Caio');

    await unmount();
  });

  it('propaga funcionário não identificado', async () => {
    const { result, unmount } = await renderAtivo(
      emptyResult({ facesDetected: 1, match: matchResult(false) }),
    );

    await waitFor(() => expect(result.current.result?.match).not.toBeNull());

    expect(result.current.result?.match?.passes).toBe(false);

    await unmount();
  });

  it('propaga falha técnica da captura como erro, distinto de não identificado', async () => {
    // `analyzePhoto` nunca rejeita — capta os próprios erros internamente e
    // os devolve em `result.error` (ver facePipeline.ts). A falha técnica
    // real que este laço precisa tratar é a câmera em si.
    //
    // Só a primeira chamada falha; da segunda em diante a captura fica
    // pendente para sempre, então o laço não continua tentando de novo a
    // cada 5 ms enquanto o teste ainda está lendo o resultado da primeira.
    const takePictureAsync = jest
      .fn()
      .mockRejectedValueOnce(new Error('Falha ao acessar a câmera.'))
      .mockReturnValue(new Promise(() => {}));

    const { result, unmount } = await renderHook(() =>
      useAutoFaceRecognition({
        cameraRef: fakeCameraRef(takePictureAsync),
        active: true,
        intervalMs: 5,
      }),
    );

    await waitFor(() => expect(result.current.result?.error).not.toBeNull());

    expect(result.current.result?.error).toContain('Falha ao acessar a câmera');
    expect(result.current.result?.match).toBeNull();
    expect(mockedAnalyzePhoto).not.toHaveBeenCalled();

    await unmount();
  });
});
