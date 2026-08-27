import { waitFor } from '@testing-library/react-native';

import { APP_MESSAGES } from '@/constants/messages';
import type { PipelineResult } from '@/features/face-recognition/face/facePipeline';
import {
  useAutoFaceRecognition,
  type UseAutoFaceRecognitionResult,
} from '@/features/face-recognition/face/useAutoFaceRecognition';
import type { MatchResult } from '@/features/face-recognition/gallery/matchEmbedding';
import { pressAndSettle, renderScreen } from '@/test-utils/renderScreen';

import IdentificationScreen from '../identificacao';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

/**
 * O laço automático real (câmera, ML Kit, FaceNet) não roda no Jest — nem
 * poderia, sem um tablet. O que esta tela precisa garantir é a *reação* ao
 * que o laço devolve, então o hook é dublado aqui; o laço em si (uma análise
 * por vez, parada no unmount, sem duplicar) é responsabilidade de
 * `useAutoFaceRecognition.test.ts`.
 */
jest.mock('@/features/face-recognition/face/useAutoFaceRecognition');

const mockedHook = useAutoFaceRecognition as jest.MockedFunction<typeof useAutoFaceRecognition>;

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

const matchResult = (passes: boolean, nome = 'Caio'): MatchResult => ({
  candidates: [{ nome, distance: passes ? 0.18 : 0.71 }],
  best: { nome, distance: passes ? 0.18 : 0.71 },
  second: null,
  ratio: null,
  passesDistance: passes,
  passesRatio: passes,
  passes,
});

/**
 * Faz o hook reagir à mesma prop `active` que a tela passa: enquanto a tela
 * não pediu para rodar, o laço nunca teria um resultado; a partir do momento
 * em que pede, simula o resultado já disponível (o "quando" de cada rodada é
 * testado no hook, não aqui).
 */
const stubHook = (whenActive: Partial<UseAutoFaceRecognitionResult>) => {
  mockedHook.mockImplementation(({ active }) =>
    active
      ? { status: 'analisando', setupError: null, result: null, ...whenActive }
      : { status: 'pronto', setupError: null, result: null },
  );
};

beforeEach(() => {
  mockReplace.mockClear();
  mockedHook.mockReset();
  stubHook({});
});

describe('identificação facial — estado inicial', () => {
  it('mostra a instrução de posicionamento antes de começar', async () => {
    const { getByText } = await renderScreen(<IdentificationScreen />);

    expect(getByText(APP_MESSAGES.face.instruction)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.startButton)).toBeTruthy();
  });

  it('não inicia o reconhecimento sozinho', async () => {
    await renderScreen(<IdentificationScreen />);

    expect(mockedHook).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
  });

  it('inicia o laço automático real ao tocar em "Iniciar Reconhecimento"', async () => {
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(mockedHook).toHaveBeenLastCalledWith(expect.objectContaining({ active: true }));
    // Sem botão de captura manual: uma vez iniciado, o laço roda sozinho.
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();
  });

  it('nunca navega sozinha para outra tela, mesmo quando alguém é identificado', async () => {
    stubHook({ result: { ...emptyResult(), facesDetected: 1, match: matchResult(true) } });
    const { getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('desabilita o início enquanto o detector e o modelo carregam', async () => {
    mockedHook.mockReturnValue({ status: 'preparando', setupError: null, result: null });
    const { getByLabelText } = await renderScreen(<IdentificationScreen />);

    expect(getByLabelText(APP_MESSAGES.face.startButton).props.accessibilityState?.disabled).toBe(
      true,
    );
  });
});

describe('identificação facial — analisando', () => {
  it('mostra que está identificando enquanto nenhum resultado chegou', async () => {
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.scanning)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.scanningHint)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();
  });

  it('trata zero rostos como estado normal, não como erro', async () => {
    stubHook({ result: emptyResult() });
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.noFaceTitle)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.errorTitle)).toBeNull();
    expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeNull();
  });
});

describe('identificação facial — funcionário identificado', () => {
  it('mostra o nome de quem foi identificado', async () => {
    stubHook({ result: { ...emptyResult(), facesDetected: 1, match: matchResult(true, 'Caio') } });
    const { getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.identifiedTitle)).toBeTruthy();
    expect(getByText('Caio')).toBeTruthy();
  });

  it('continua rodando: sem botão de avançar', async () => {
    stubHook({ result: { ...emptyResult(), facesDetected: 1, match: matchResult(true, 'Caio') } });
    const { queryByText, getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(queryByText(APP_MESSAGES.preparation.startButton)).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('identificação facial — funcionário não identificado', () => {
  const renderNotIdentified = async () => {
    stubHook({ result: { ...emptyResult(), facesDetected: 1, match: matchResult(false) } });
    const view = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));

    return view;
  };

  it('explica que não foi possível identificar', async () => {
    const { getByText } = await renderNotIdentified();

    expect(getByText(APP_MESSAGES.face.unknownTitle)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.unknownDescription)).toBeTruthy();
  });

  it('lista as possíveis causas sem afirmar uma delas', async () => {
    const { getByText } = await renderNotIdentified();

    expect(getByText(APP_MESSAGES.face.unknownChecksTitle)).toBeTruthy();
    for (const check of APP_MESSAGES.face.unknownChecks) {
      expect(getByText(check)).toBeTruthy();
    }
  });

  it('mantém o visor da câmera visível', async () => {
    const { getByTestId } = await renderNotIdentified();

    expect(getByTestId('camera-viewport')).toBeTruthy();
  });

  it('não navega para lugar nenhum', async () => {
    await renderNotIdentified();

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('continua tentando sozinha: sem botão de tentar novamente', async () => {
    const { queryByText } = await renderNotIdentified();

    expect(queryByText(APP_MESSAGES.face.retryButton)).toBeNull();
  });

  it('oferece voltar ao início', async () => {
    const { getByText } = await renderNotIdentified();

    await pressAndSettle(getByText(APP_MESSAGES.face.backHomeButton));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });
});

describe('identificação facial — erro técnico', () => {
  it('distingue falha técnica de funcionário não identificado', async () => {
    stubHook({ result: { ...emptyResult(), error: 'Falha ao decodificar o recorte.' } });
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.errorTitle)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeNull();
    expect(queryByText(APP_MESSAGES.face.noFaceTitle)).toBeNull();
  });

  it('também aparece quando o detector/modelo falham ao carregar', async () => {
    mockedHook.mockReturnValue({ status: 'erro', setupError: 'ONNX indisponível', result: null });
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    expect(getByText(APP_MESSAGES.face.errorTitle)).toBeTruthy();
    // Nada a tentar enquanto o carregamento não funcionar.
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();
  });
});

describe('identificação facial — voltar ao início', () => {
  it('retorna para a rota inicial a partir do cabeçalho', async () => {
    const { getByLabelText } = await renderScreen(<IdentificationScreen />);

    // ScreenHeader expõe a ação de voltar por acessibilidade, disponível em
    // qualquer estado — inclusive durante o reconhecimento automático.
    const backButton = getByLabelText(/voltar/i);
    await pressAndSettle(backButton);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });
});
