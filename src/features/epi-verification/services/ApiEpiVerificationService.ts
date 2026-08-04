import { AppError } from '@/services/errors';
import { requestJson } from '@/services/http/httpClient';
import { delay } from '@/utils';

import type {
  ApiSessionStatusDto,
  ApiStartSessionDto,
  EpiVerificationService,
  VerificationInput,
  VerificationProgressListener,
  VerificationResult,
} from '../types';
import { mapDetectionItems, mapProgress, mapVerificationResponse, toDetectedEpi } from '../utils';

export interface ApiEpiVerificationServiceOptions {
  baseUrl: string;
  timeoutMs?: number;
  /** Intervalo entre consultas ao estado da sessão. */
  pollIntervalMs?: number;
  /** Tempo máximo de uma verificação antes de desistir. */
  maxDurationMs?: number;
  sessionsPath?: string;
}

const DEFAULT_SESSIONS_PATH = '/verifications';
const DEFAULT_POLL_INTERVAL_MS = 600;
const DEFAULT_MAX_DURATION_MS = 60000;

/**
 * Integração com a IA de detecção.
 *
 * Ainda não há endpoint publicado: a URL vem de `VITE_EPI_API_URL` e, enquanto
 * ela estiver vazia, a fábrica devolve o serviço simulado.
 *
 * O fluxo assumido é o mais comum para inferência em vídeo ao vivo:
 * abre-se uma sessão de verificação, consulta-se o estado dela periodicamente
 * (o que alimenta a barra de progresso) e, ao concluir, o resultado é mapeado
 * para o domínio. Se o backend definir outro contrato — WebSocket, SSE ou envio
 * de frames —, basta ajustar este arquivo e o mapeador; nenhuma tela muda.
 */
export class ApiEpiVerificationService implements EpiVerificationService {
  private readonly baseUrl: string;
  private readonly timeoutMs: number | undefined;
  private readonly pollIntervalMs: number;
  private readonly maxDurationMs: number;
  private readonly sessionsPath: string;

  constructor({
    baseUrl,
    timeoutMs,
    pollIntervalMs,
    maxDurationMs,
    sessionsPath,
  }: ApiEpiVerificationServiceOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
    this.pollIntervalMs = pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    this.maxDurationMs = maxDurationMs ?? DEFAULT_MAX_DURATION_MS;
    this.sessionsPath = sessionsPath ?? DEFAULT_SESSIONS_PATH;
  }

  async verify(
    input: VerificationInput,
    onProgress?: VerificationProgressListener,
  ): Promise<VerificationResult> {
    const { requiredItems, signal } = input;

    if (requiredItems.length === 0) {
      throw new AppError('no_active_epis', 'Nenhum equipamento está ativo para verificação.');
    }

    const startedAt = Date.now();
    const requestOptions = {
      ...(this.timeoutMs ? { timeoutMs: this.timeoutMs } : {}),
      ...(signal ? { signal } : {}),
    };

    const session = await requestJson<ApiStartSessionDto>(`${this.baseUrl}${this.sessionsPath}`, {
      method: 'POST',
      body: { requiredItems },
      ...requestOptions,
    });

    if (typeof session?.sessionId !== 'string') {
      throw new AppError('invalid_response', 'A API não devolveu um identificador de sessão.');
    }

    const statusUrl = `${this.baseUrl}${this.sessionsPath}/${encodeURIComponent(session.sessionId)}`;

    for (;;) {
      const status = await requestJson<ApiSessionStatusDto>(statusUrl, requestOptions);

      onProgress?.({
        progress: mapProgress(status.progress),
        items: mapDetectionItems(status.items).map(toDetectedEpi),
        currentItem: null,
      });

      if (status.state !== 'running') {
        return mapVerificationResponse(status, requiredItems, Date.now() - startedAt);
      }

      if (Date.now() - startedAt > this.maxDurationMs) {
        throw new AppError('timeout', 'A verificação excedeu o tempo máximo.');
      }

      await delay(this.pollIntervalMs, signal);
    }
  }
}
