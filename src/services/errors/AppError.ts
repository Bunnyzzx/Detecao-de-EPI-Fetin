export type AppErrorCode =
  | 'network'
  | 'timeout'
  | 'invalid_image'
  | 'invalid_response'
  | 'permission_denied'
  | 'device_unsupported'
  | 'storage'
  | 'unknown';

/**
 * Erro de aplicação com código estável. As telas escolhem o estado visual a
 * partir do código, sem precisar interpretar mensagens de bibliotecas.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  override readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
