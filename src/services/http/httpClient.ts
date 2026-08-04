import { AppError, normalizeError } from '@/services/errors';

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 20000;

/**
 * Cliente HTTP mínimo com timeout, cancelamento e erros normalizados.
 * Não guarda credenciais: URLs e chaves vêm de variáveis de ambiente.
 */
export const requestJson = async <TResponse>(
  url: string,
  {
    method = 'GET',
    body,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
  }: HttpRequestOptions = {},
): Promise<TResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();

  signal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        'invalid_response',
        `A requisição falhou com o status ${response.status}.`,
      );
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    // Um abort externo é cancelamento; um abort do timeout é timeout.
    if (signal?.aborted) {
      throw new AppError('cancelled', 'Verificação cancelada.', error);
    }
    throw normalizeError(error, 'network');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }
};
