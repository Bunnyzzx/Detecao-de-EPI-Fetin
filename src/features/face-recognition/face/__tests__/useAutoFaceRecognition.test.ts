import { act, renderHook, waitFor } from '@testing-library/react-native';
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

/** Câmera falsa: só o método que o hook realmente chama. */
const fakeCameraRef = (takePictureAsync: jest.Mock) =>
  ({ current: { takePictureAsync } }) as unknown as RefObject<CameraView>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  mockedAnalyzePhoto.mockReset();
});

describe('antes de qualquer tentativa', () => {
  it('não captura nada até recognize() ser chamado', async () => {
    const takePictureAsync = jest.fn();
    const { result, unmount } = await renderHook(() =>
      useAutoFaceRecognition({ cameraRef: fakeCameraRef(takePictureAsync) }),
    );

    await waitFor(() => expect(result.current.status).toBe('pronto'));
    await wait(20);

    expect(takePictureAsync).not.toHaveBeenCalled();
    expect(result.current.result).toBeNull();

    await unmount();
  });
});

describe('uma tentativa', () => {
  const renderPronto = async (takePictureAsync: jest.Mock) => {
    const hook = await renderHook(() =>
      useAutoFaceRecognition({ cameraRef: fakeCameraRef(takePictureAsync) }),
    );
    await waitFor(() => expect(hook.result.current.status).toBe('pronto'));
    return hook;
  };

  it('recognize() executa exatamente UMA captura e análise', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(emptyResult({ facesDetected: 0 }));

    const { result, unmount } = await renderPronto(takePictureAsync);

    await act(() => result.current.recognize());

    await waitFor(() => expect(result.current.result).not.toBeNull());

    expect(takePictureAsync).toHaveBeenCalledTimes(1);
    expect(mockedAnalyzePhoto).toHaveBeenCalledTimes(1);

    await unmount();
  });

  it('após identificado, não faz nova captura sozinho', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(
      emptyResult({ facesDetected: 1, match: matchResult(true, 'Caio') }),
    );

    const { result, unmount } = await renderPronto(takePictureAsync);
    await act(() => result.current.recognize());
    await waitFor(() => expect(result.current.result?.match?.passes).toBe(true));

    await wait(30);
    expect(takePictureAsync).toHaveBeenCalledTimes(1);

    await unmount();
  });

  it('após não identificado, não faz nova captura sozinho', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(
      emptyResult({ facesDetected: 1, match: matchResult(false) }),
    );

    const { result, unmount } = await renderPronto(takePictureAsync);
    await act(() => result.current.recognize());
    await waitFor(() => expect(result.current.result?.match).not.toBeNull());

    await wait(30);
    expect(takePictureAsync).toHaveBeenCalledTimes(1);

    await unmount();
  });

  it('após zero rostos, não faz nova captura sozinho', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(emptyResult({ facesDetected: 0 }));

    const { result, unmount } = await renderPronto(takePictureAsync);
    await act(() => result.current.recognize());
    await waitFor(() => expect(result.current.result).not.toBeNull());

    await wait(30);
    expect(takePictureAsync).toHaveBeenCalledTimes(1);
    expect(result.current.result?.error).toBeNull();

    await unmount();
  });

  it('erro técnico não gera retry automático', async () => {
    // `analyzePhoto` nunca rejeita — capta os próprios erros internamente e os
    // devolve em `result.error` (ver facePipeline.ts). A falha técnica real
    // que este hook precisa tratar é a câmera em si.
    const takePictureAsync = jest.fn().mockRejectedValue(new Error('Falha ao acessar a câmera.'));

    const { result, unmount } = await renderPronto(takePictureAsync);
    await act(() => result.current.recognize());
    await waitFor(() => expect(result.current.result?.error).not.toBeNull());

    expect(result.current.result?.error).toContain('Falha ao acessar a câmera');
    expect(mockedAnalyzePhoto).not.toHaveBeenCalled();

    await wait(30);
    expect(takePictureAsync).toHaveBeenCalledTimes(1);

    await unmount();
  });

  it('bloqueia uma segunda chamada enquanto a primeira está em andamento', async () => {
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

    const { result, unmount } = await renderPronto(takePictureAsync);

    await act(() => {
      result.current.recognize();
      // Simula toques repetidos antes da primeira tentativa terminar.
      result.current.recognize();
      result.current.recognize();
    });

    await waitFor(() => expect(result.current.status).toBe('analisando'));
    expect(takePictureAsync).toHaveBeenCalledTimes(1);

    liberarAnalise(emptyResult());
    await waitFor(() => expect(result.current.status).toBe('pronto'));
    expect(takePictureAsync).toHaveBeenCalledTimes(1);

    await unmount();
  });

  it('"tentar novamente" (nova chamada explícita) executa mais uma tentativa', async () => {
    const takePictureAsync = jest
      .fn()
      .mockResolvedValue({ uri: 'file://foto.jpg', width: 100, height: 100 });
    mockedAnalyzePhoto.mockResolvedValue(emptyResult({ facesDetected: 0 }));

    const { result, unmount } = await renderPronto(takePictureAsync);

    await act(() => result.current.recognize());
    await waitFor(() => expect(result.current.result).not.toBeNull());
    expect(takePictureAsync).toHaveBeenCalledTimes(1);

    await act(() => result.current.recognize());
    await waitFor(() => expect(takePictureAsync).toHaveBeenCalledTimes(2));

    await unmount();
  });
});

describe('ciclo de vida', () => {
  it('não atualiza estado nem lança depois do unmount', async () => {
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

    const { result, unmount } = await renderHook(() =>
      useAutoFaceRecognition({ cameraRef: fakeCameraRef(takePictureAsync) }),
    );
    await waitFor(() => expect(result.current.status).toBe('pronto'));

    await act(() => result.current.recognize());
    await waitFor(() => expect(takePictureAsync).toHaveBeenCalled());

    await unmount();

    // A análise só termina depois do unmount: não deve lançar nem atualizar
    // estado de um componente que não existe mais.
    expect(() => liberarAnalise(emptyResult())).not.toThrow();
    await wait(20);
  });
});
