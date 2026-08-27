import { act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { APP_MESSAGES } from '@/constants/messages';
import type { PipelineResult } from '@/features/face-recognition/face/facePipeline';
import type { AutoFaceRecognitionStatus } from '@/features/face-recognition/face/useAutoFaceRecognition';
import type { MatchResult } from '@/features/face-recognition/gallery/matchEmbedding';
import { useVerificationSession } from '@/features/verification-session/hooks/VerificationSessionContext';
import { pressAndSettle, renderScreen } from '@/test-utils/renderScreen';

import IdentificationScreen from '../identificacao';
import PreparationScreen from '../preparacao';

/** Sonda de teste: expõe o `id` real gravado na sessão, que nenhuma tela mostra. */
const SessionEmployeeIdProbe = () => {
  const { snapshot } = useVerificationSession();
  return <Text>{snapshot.employee?.id ?? 'nenhum'}</Text>;
};

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

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

const matchResult = (passes: boolean, nome = 'Caio', id = 42): MatchResult => ({
  candidates: [{ id, nome, distance: passes ? 0.18 : 0.71 }],
  best: { id, nome, distance: passes ? 0.18 : 0.71 },
  second: null,
  ratio: null,
  passesDistance: passes,
  passesRatio: passes,
  passes,
});

const identifiedResult = (nome = 'Caio', id = 42): PipelineResult => ({
  ...emptyResult(),
  facesDetected: 1,
  match: matchResult(true, nome, id),
});

const notIdentifiedResult = (): PipelineResult => ({
  ...emptyResult(),
  facesDetected: 1,
  match: matchResult(false),
});

/**
 * O laço real (câmera, ML Kit, FaceNet) não roda no Jest. O que esta tela
 * precisa garantir é a *reação* a uma tentativa — uma captura, um resultado,
 * parado —, então o hook é dublado por um substituto minimalista que ainda
 * assim usa `useState` real, para se comportar como o hook de verdade do
 * ponto de vista de quem chama `recognize()`. O laço em si (concorrência,
 * cleanup) é responsabilidade de `useAutoFaceRecognition.test.ts`.
 */
let mockScenario: {
  initialStatus: AutoFaceRecognitionStatus;
  initialSetupError: string | null;
  onRecognize: () => Promise<PipelineResult>;
};

jest.mock('@/features/face-recognition/face/useAutoFaceRecognition', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useCallback, useState } = require('react');

  return {
    useAutoFaceRecognition: () => {
      const [state, setState] = useState(() => ({
        status: mockScenario.initialStatus,
        setupError: mockScenario.initialSetupError,
        result: null,
      }));

      const recognize = useCallback(() => {
        setState((prev: { status: string }) =>
          prev.status === 'analisando' ? prev : { ...prev, status: 'analisando' },
        );
        void mockScenario
          .onRecognize()
          .then((result) => setState({ status: 'pronto', setupError: null, result }));
      }, []);

      return { ...state, recognize };
    },
  };
});

const recognizeCallCount = jest.fn();
const withRecognizeCount =
  (impl: () => Promise<PipelineResult>) => (): Promise<PipelineResult> => {
    recognizeCallCount();
    return impl();
  };

beforeEach(() => {
  mockReplace.mockClear();
  recognizeCallCount.mockClear();
  mockScenario = {
    initialStatus: 'pronto',
    initialSetupError: null,
    onRecognize: withRecognizeCount(async () => emptyResult()),
  };
});

describe('identificação facial — estado inicial', () => {
  it('mostra a instrução de posicionamento antes de começar', async () => {
    const { getByText } = await renderScreen(<IdentificationScreen />);

    expect(getByText(APP_MESSAGES.face.instruction)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.startButton)).toBeTruthy();
  });

  it('não inicia o reconhecimento sozinho', async () => {
    await renderScreen(<IdentificationScreen />);

    expect(recognizeCallCount).not.toHaveBeenCalled();
  });

  it('ao tocar em "Iniciar Reconhecimento" faz exatamente UMA tentativa', async () => {
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(recognizeCallCount).toHaveBeenCalledTimes(1);
    // Sem botão de captura manual: a foto em si é automática.
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();
  });

  it('desabilita o início enquanto o detector e o modelo carregam', async () => {
    mockScenario.initialStatus = 'preparando';
    const { getByLabelText } = await renderScreen(<IdentificationScreen />);

    expect(getByLabelText(APP_MESSAGES.face.startButton).props.accessibilityState?.disabled).toBe(
      true,
    );
  });
});

describe('identificação facial — resultado permanece parado', () => {
  it('mostra "identificando" enquanto a tentativa está em andamento', async () => {
    let liberar: () => void = () => {};
    mockScenario.onRecognize = withRecognizeCount(
      () => new Promise((resolve) => (liberar = () => resolve(emptyResult()))),
    );
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.scanning)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();

    liberar();
  });

  it('trata zero rostos como estado normal e para — sem nova captura sozinha', async () => {
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.noFaceTitle)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.errorTitle)).toBeNull();
    expect(recognizeCallCount).toHaveBeenCalledTimes(1);

    // Passado algum tempo, continua parado no mesmo resultado.
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(recognizeCallCount).toHaveBeenCalledTimes(1);
  });

  it('identificado permanece visível e mostra o nome', async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => identifiedResult('Caio'));
    const { getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.identifiedTitle)).toBeTruthy();
    expect(getByText('Caio')).toBeTruthy();
  });

  it('não identificado para no resultado, sem nova captura sozinha', async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => notIdentifiedResult());
    const { getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.unknownTitle)).toBeTruthy();

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(recognizeCallCount).toHaveBeenCalledTimes(1);
  });
});

describe('identificação facial — tentar novamente', () => {
  const renderNotIdentified = async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => notIdentifiedResult());
    const view = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));

    return view;
  };

  it('oferece tentar novamente e voltar ao início', async () => {
    const { getByText } = await renderNotIdentified();

    expect(getByText(APP_MESSAGES.face.retryButton)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.backHomeButton)).toBeTruthy();
  });

  it('"tentar novamente" dispara exatamente mais UMA tentativa', async () => {
    const { getByText } = await renderNotIdentified();
    expect(recognizeCallCount).toHaveBeenCalledTimes(1);

    mockScenario.onRecognize = withRecognizeCount(async () => identifiedResult('Caio'));
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    // Uma da tentativa inicial (renderNotIdentified) + uma do "tentar novamente".
    expect(recognizeCallCount).toHaveBeenCalledTimes(2);
    expect(getByText(APP_MESSAGES.face.identifiedTitle)).toBeTruthy();
  });

  it('mostra no máximo 3 orientações curtas, sem texto longo', async () => {
    const { getByText } = await renderNotIdentified();

    expect(getByText(APP_MESSAGES.face.unknownShortHint)).toBeTruthy();
    expect(APP_MESSAGES.face.unknownShortChecks.length).toBeLessThanOrEqual(3);
    for (const check of APP_MESSAGES.face.unknownShortChecks) {
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

  it('sem rosto também oferece tentar novamente', async () => {
    const { getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.noFaceTitle)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.retryButton)).toBeTruthy();
  });
});

describe('identificação facial — erro técnico', () => {
  it('distingue falha técnica de funcionário não identificado', async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => ({
      ...emptyResult(),
      error: 'Falha ao decodificar o recorte.',
    }));
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    expect(getByText(APP_MESSAGES.face.errorTitle)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeNull();
    expect(queryByText(APP_MESSAGES.face.noFaceTitle)).toBeNull();
  });

  it('não tenta de novo sozinho após erro técnico', async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => ({
      ...emptyResult(),
      error: 'Falha ao decodificar o recorte.',
    }));
    const { getByText } = await renderScreen(<IdentificationScreen />);
    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(recognizeCallCount).toHaveBeenCalledTimes(1);
  });

  it('também aparece quando o detector/modelo falham ao carregar', async () => {
    mockScenario.initialStatus = 'erro';
    mockScenario.initialSetupError = 'ONNX indisponível';
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    expect(getByText(APP_MESSAGES.face.errorTitle)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();
  });
});

describe('identificação facial — voltar ao início', () => {
  it('retorna para a rota inicial a partir do cabeçalho', async () => {
    const { getByLabelText } = await renderScreen(<IdentificationScreen />);

    const backButton = getByLabelText(/voltar/i);
    await pressAndSettle(backButton);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });
});

describe('identificação facial — ponte para a sessão', () => {
  it('identificação real popula a sessão com id/nome; preparação funciona só com isso', async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => identifiedResult('Caio'));
    const view = await renderScreen(
      <>
        <IdentificationScreen />
        <PreparationScreen />
      </>,
    );

    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));

    // A preparação (rota real seguinte) já reflete quem foi identificado,
    // usando só o dado que o pipeline real tem — nome —, sem matrícula/setor
    // inventados.
    expect(view.getAllByText('Caio').length).toBeGreaterThan(0);
    expect(
      view.queryByText(new RegExp(`^${APP_MESSAGES.face.registrationLabel}:`)),
    ).toBeNull();
    expect(view.queryByText(new RegExp(`^${APP_MESSAGES.face.sectorLabel}:`))).toBeNull();
  });

  it('registra o id real da galeria na sessão — não o nome como identificador', async () => {
    // `id: 7` é claramente diferente do nome "Caio": se o código regredisse
    // para `id: best.nome`, a sonda mostraria "Caio", não "7".
    mockScenario.onRecognize = withRecognizeCount(async () => identifiedResult('Caio', 7));
    const view = await renderScreen(
      <>
        <IdentificationScreen />
        <SessionEmployeeIdProbe />
      </>,
    );

    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));

    expect(view.getByText('7')).toBeTruthy();
    expect(view.queryByText('nenhum')).toBeNull();
  });

  it('não identificado não registra ninguém na sessão', async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => notIdentifiedResult());
    const view = await renderScreen(
      <>
        <IdentificationScreen />
        <PreparationScreen />
      </>,
    );

    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));

    expect(view.getByText(APP_MESSAGES.preparation.missingEmployeeTitle)).toBeTruthy();
  });

  it('sem rosto não registra ninguém na sessão', async () => {
    const view = await renderScreen(
      <>
        <IdentificationScreen />
        <PreparationScreen />
      </>,
    );

    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));

    expect(view.getByText(APP_MESSAGES.preparation.missingEmployeeTitle)).toBeTruthy();
  });
});

describe('identificação facial — avanço automático após sucesso', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderIdentified = async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => identifiedResult('Caio'));
    const view = await renderScreen(<IdentificationScreen />);
    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));
    return view;
  };

  it('não navega imediatamente após identificar', async () => {
    await renderIdentified();

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('oferece cancelar mesmo já identificado', async () => {
    const { getByText } = await renderIdentified();

    expect(getByText(APP_MESSAGES.face.backHomeButton)).toBeTruthy();
  });

  it('navega para /preparacao depois de ~5 segundos', async () => {
    await renderIdentified();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockReplace).toHaveBeenCalledWith('/preparacao');
  });

  it('não dispara nova análise durante a espera do avanço', async () => {
    await renderIdentified();
    expect(recognizeCallCount).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(recognizeCallCount).toHaveBeenCalledTimes(1);
  });

  it('cancelar antes do timer impede a navegação automática', async () => {
    const { getByText, unmount } = await renderIdentified();

    await pressAndSettle(getByText(APP_MESSAGES.face.backHomeButton));
    // A navegação real desmontaria esta tela; o teste simula isso, já que o
    // router mockado não troca de tela sozinho.
    await unmount();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockReplace).not.toHaveBeenCalledWith('/preparacao');
  });

  it('cancelar durante o sucesso também reseta a sessão', async () => {
    mockScenario.onRecognize = withRecognizeCount(async () => identifiedResult('Caio'));
    const view = await renderScreen(
      <>
        <IdentificationScreen />
        <PreparationScreen />
      </>,
    );
    await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));

    await pressAndSettle(view.getByText(APP_MESSAGES.face.backHomeButton));

    expect(view.getByText(APP_MESSAGES.preparation.missingEmployeeTitle)).toBeTruthy();
  });

  it('desmontar antes do timer também impede a navegação automática', async () => {
    const { unmount } = await renderIdentified();

    await unmount();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockReplace).not.toHaveBeenCalledWith('/preparacao');
  });
});
