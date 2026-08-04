import { APP_MESSAGES } from '@/constants/messages';

import { AppError, isAppError, type AppErrorCode } from './AppError';

const FALLBACK_MESSAGE = APP_MESSAGES.states.genericErrorDescription;

/** Converte qualquer valor lançado em um `AppError` com código conhecido. */
export const normalizeError = (
  error: unknown,
  fallbackCode: AppErrorCode = 'unknown',
): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new AppError('cancelled', error.message || FALLBACK_MESSAGE, error);
    }
    if (error.name === 'TimeoutError') {
      return new AppError('timeout', error.message || FALLBACK_MESSAGE, error);
    }
    if (/failed to fetch|network/i.test(error.message)) {
      return new AppError('network', error.message, error);
    }
    return new AppError(fallbackCode, error.message || FALLBACK_MESSAGE, error);
  }

  return new AppError(fallbackCode, FALLBACK_MESSAGE, error);
};

export interface ErrorPresentation {
  title: string;
  description: string;
  /** Verdadeiro quando a causa é conectividade, para escolher outro ícone. */
  isConnectivity: boolean;
}

/** Título e descrição prontos para exibição, derivados do código do erro. */
export const describeError = (error: unknown): ErrorPresentation => {
  const appError = normalizeError(error);

  switch (appError.code) {
    case 'network':
    case 'timeout':
      return {
        title: APP_MESSAGES.states.offlineTitle,
        description: APP_MESSAGES.states.offlineDescription,
        isConnectivity: true,
      };
    case 'cancelled':
      return {
        title: APP_MESSAGES.scan.cancelled,
        description: APP_MESSAGES.scan.cancelledDescription,
        isConnectivity: false,
      };
    case 'no_active_epis':
      return {
        title: APP_MESSAGES.home.noEquipmentTitle,
        description: APP_MESSAGES.home.noEquipmentDescription,
        isConnectivity: false,
      };
    default:
      return {
        title: APP_MESSAGES.states.genericErrorTitle,
        description: APP_MESSAGES.states.genericErrorDescription,
        isConnectivity: false,
      };
  }
};
