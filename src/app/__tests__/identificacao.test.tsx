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

const useFaceOutcome = (forcedOutcome: 'recognized' | 'unknown') => {
  setFaceRecognitionService(
    new MockFaceRecognitionService({ random: () => 0.5, durationMs: 0, forcedOutcome }),
  );
};

beforeEach(() => {
  mockReplace.mockClear();
});

afterEach(() => {
  setFaceRecognitionService(null);
});

describe('tela de identificação facial', () => {
  it('mostra a instrução de posicionamento antes de começar', async () => {
    useFaceOutcome('recognized');
    const { getByText } = await renderScreen(<IdentificationScreen />);

    expect(getByText(APP_MESSAGES.face.instruction)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.startButton)).toBeTruthy();
  });

  it('não inicia o reconhecimento sozinho', async () => {
    useFaceOutcome('recognized');
    const { queryByText } = await renderScreen(<IdentificationScreen />);

    expect(queryByText(APP_MESSAGES.face.scanning)).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('avança para a preparação quando o funcionário é reconhecido', async () => {
    useFaceOutcome('recognized');
    const { getByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/preparacao'));
  });

  it('esconde a ação enquanto identifica, impedindo sessão duplicada', async () => {
    // Serviço que só termina quando o teste mandar: a janela de "identificando"
    // fica aberta o tempo necessário para inspecionar a tela.
    let finishRecognition = () => {};
    const recognizeCalls = jest.fn();

    setFaceRecognitionService({
      recognize: () => {
        recognizeCalls();
        return new Promise<FaceRecognitionResult>((resolve) => {
          finishRecognition = () => resolve({ status: 'unknown' as const, confidence: 0.1 });
        });
      },
    });

    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    await waitFor(() => expect(queryByText(APP_MESSAGES.face.scanning)).toBeTruthy());
    expect(queryByText(APP_MESSAGES.face.startButton)).toBeNull();
    expect(queryByText(APP_MESSAGES.face.retryButton)).toBeNull();
    expect(recognizeCalls).toHaveBeenCalledTimes(1);

    finishRecognition();
    await waitFor(() => expect(queryByText(APP_MESSAGES.face.retryButton)).toBeTruthy());
  });

  it('oferece recuperação quando ninguém é reconhecido', async () => {
    useFaceOutcome('unknown');
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));

    await waitFor(() => expect(queryByText(APP_MESSAGES.face.unknownTitle)).toBeTruthy());
    expect(getByText(APP_MESSAGES.face.unknownDescription)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.retryButton)).toBeTruthy();
    expect(getByText(APP_MESSAGES.face.backHomeButton)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalledWith('/preparacao');
  });

  it('permite tentar novamente após não reconhecer', async () => {
    useFaceOutcome('unknown');
    const { getByText, queryByText } = await renderScreen(<IdentificationScreen />);

    await pressAndSettle(getByText(APP_MESSAGES.face.startButton));
    await waitFor(() => expect(queryByText(APP_MESSAGES.face.retryButton)).toBeTruthy());

    useFaceOutcome('recognized');
    await pressAndSettle(getByText(APP_MESSAGES.face.retryButton));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/preparacao'));
  });
});
