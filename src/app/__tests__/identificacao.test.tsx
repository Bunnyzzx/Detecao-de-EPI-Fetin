import { waitFor } from '@testing-library/react-native';

import { APP_MESSAGES } from '@/constants/messages';
import { setFaceRecognitionService } from '@/features/face-recognition/services/faceRecognitionServiceFactory';
import { MockFaceRecognitionService } from '@/features/face-recognition/services/MockFaceRecognitionService';
import type { FaceRecognitionResult } from '@/features/face-recognition/types';
import { pressAndSettle, renderScreen } from '@/test-utils/renderScreen';

import IdentificationScreen from '../identificacao';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

const EMPLOYEE_NAME = 'Caio de Castro Yarouhas';

/** Reconhecimento determinístico: sempre o mesmo desfecho, sem espera. */
const givenFaceOutcome = (forcedOutcome: 'recognized' | 'unknown') => {
  setFaceRecognitionService(
    new MockFaceRecognitionService({ random: () => 0, durationMs: 0, forcedOutcome }),
  );
};

/**
 * Serviço cujo término é decidido pelo teste, para inspecionar a janela em que
 * a identificação está em andamento.
 */
const givenControlledFace = () => {
  const calls = jest.fn();
  let finish: (result: FaceRecognitionResult) => void = () => {};

  setFaceRecognitionService({
    recognize: () => {
      calls();
      return new Promise<FaceRecognitionResult>((resolve) => {
        finish = resolve;
      });
    },
  });

  return {
    calls,
    finishUnknown: () => finish({ status: 'unknown', confidence: 0.1 }),
  };
};

beforeEach(() => {
  mockReplace.mockClear();
});

afterEach(() => {
  setFaceRecognitionService(null);
});

/** Leva a tela até o estado de funcionário não identificado. */
const renderUnknown = async () => {
  givenFaceOutcome('unknown');
  const view = await renderScreen(<IdentificationScreen />);

  await pressAndSettle(view.getByText(APP_MESSAGES.face.startButton));
  await waitFor(() => expect(view.queryByText(APP_MESSAGES.face.unknownTitle)).toBeTruthy());

  return view;
};

describe('identificação facial — estado inicial', () => {
  it('mostra a instrução de posicionamento antes de começar', async () => {
    givenFaceOutcome('recognized');
    const { getByText } = await renderScreen(<IdentificationScreen />);

    expect(getByText(APP_MESSAGES.face.instruction)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.startButton)).toBeTruthy();
  });

  it('não inicia o reconhecimento sozinho', async () => {
    givenFaceOutcome('recognized');
    const { queryByText } = await renderScreen(<IdentificationScreen />);

    expect(queryByText(APP_MESSAGES.face.scanning)).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('avança para a preparação quando o funcionário é reconhecido', async () => {
    givenFaceOutcome('recognized');
    const { getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/preparacao'));
  });

  it('esconde a ação enquanto identifica', async () => {
    const controlled = givenControlledFace();
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    await waitFor(() => expect(queryByText(APP_MESSAGES.face.scanning)).toBeTruthy());
    expect(getByText(APP_MESSAGES.face.scanningHint)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();
    expect(queryByText(APP_MESSAGES.face.retryButton)).toBeNull();
    expect(controlled.calls).toHaveBeenCalledTimes(1);
  });
});

describe('identificação facial — funcionário não identificado', () => {
  it('explica que não foi possível identificar', async () => {
    const { getByText } = await renderUnknown();

    expect(getByText(APP_MESSAGES.face.unknownTitle)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.unknownDescription)).toBeTruthy();
  });

  it('lista as possíveis causas sem afirmar uma delas', async () => {
    const { getByText } = await renderUnknown();

    expect(getByText(APP_MESSAGES.face.unknownChecksTitle)).toBeTruthy();
    for (const check of APP_MESSAGES.face.unknownChecks) {
      expect(getByText(check)).toBeTruthy();
    }
    expect(getByText(APP_MESSAGES.face.unknownRetryHint)).toBeTruthy();
  });

  it('mantém o visor da câmera visível', async () => {
    const { getByTestId } = await renderUnknown();

    expect(getByTestId('camera-viewport')).toBeTruthy();
  });

  it('mantém o guia facial visível', async () => {
    const { getByTestId } = await renderUnknown();

    expect(getByTestId('face-guide')).toBeTruthy();
  });

  it('oferece tentar novamente e, em segundo plano, voltar ao início', async () => {
    const { getByText } = await renderUnknown();

    expect(getByText(APP_MESSAGES.face.retryButton)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.backHomeButton)).toBeTruthy();
  });

  it('não navega para lugar nenhum ao não identificar', async () => {
    await renderUnknown();

    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('identificação facial — tentar novamente', () => {
  it('dispara uma nova identificação', async () => {
    const { getByText } = await renderUnknown();

    const controlled = givenControlledFace();
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    expect(controlled.calls).toHaveBeenCalledTimes(1);
  });

  it('volta ao estado de identificação em andamento', async () => {
    const { getByText, queryByText } = await renderUnknown();

    givenControlledFace();
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    await waitFor(() => expect(queryByText(APP_MESSAGES.face.scanning)).toBeTruthy());
    expect(getByText(APP_MESSAGES.face.scanningHint)).toBeTruthy();
    expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeNull();
  });

  it('não volta para o início nem inicia a verificação de EPI', async () => {
    const { getByText } = await renderUnknown();

    givenFaceOutcome('unknown');
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    expect(mockReplace).not.toHaveBeenCalledWith('/');
    expect(mockReplace).not.toHaveBeenCalledWith('/verificacao');
    expect(mockReplace).not.toHaveBeenCalledWith('/resultado');
  });

  it('avança para a preparação quando a nova tentativa reconhece', async () => {
    const { getByText } = await renderUnknown();

    givenFaceOutcome('recognized');
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/preparacao'));
  });

  it('permanece na identificação quando a nova tentativa também falha', async () => {
    const { getByText, queryByText } = await renderUnknown();

    givenFaceOutcome('unknown');
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    await waitFor(() => expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeTruthy());
    expect(getByText(APP_MESSAGES.face.retryButton)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('permite tentativas consecutivas, sem limite artificial', async () => {
    const { getByText, queryByText } = await renderUnknown();

    givenFaceOutcome('unknown');
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));
      await waitFor(() => expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeTruthy());
    }

    // Depois de várias falhas a quinta tentativa ainda funciona normalmente.
    givenFaceOutcome('recognized');
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/preparacao'));
  });

  it('duplo toque não cria duas identificações simultâneas', async () => {
    const { getByText } = await renderUnknown();

    const controlled = givenControlledFace();
    const retry = getByText(APP_MESSAGES.face.retryButton);

    // Dois toques antes de a primeira tentativa terminar.
    await pressAndSettle(retry);
    await pressAndSettle(retry);

    expect(controlled.calls).toHaveBeenCalledTimes(1);

    controlled.finishUnknown();
    await waitFor(() => expect(getByText(APP_MESSAGES.face.retryButton)).toBeTruthy());
  });
});

describe('identificação facial — voltar ao início', () => {
  it('retorna para a rota inicial', async () => {
    const { getByText } = await renderUnknown();

    await pressAndSettle(getByText(APP_MESSAGES.face.backHomeButton));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });

  it('limpa a sessão, deixando o terminal pronto para o próximo', async () => {
    const { getByText, queryByText } = await renderUnknown();

    await pressAndSettle(getByText(APP_MESSAGES.face.backHomeButton));

    // Volta ao estado inicial: sem orientação de falha e com a ação de início.
    await waitFor(() => expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeNull());
    expect(getByText(APP_MESSAGES.face.startButton)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.instruction)).toBeTruthy();
    expect(queryByText(EMPLOYEE_NAME)).toBeNull();
  });
});
