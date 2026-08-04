import { env } from '@/services/env';

import type { EpiVerificationService } from '../types';

import { ApiEpiVerificationService } from './ApiEpiVerificationService';
import { MockEpiVerificationService } from './MockEpiVerificationService';

let cachedService: EpiVerificationService | null = null;

/**
 * Único ponto do sistema que decide qual implementação usar.
 * Basta preencher `VITE_EPI_API_URL` para migrar do simulado para a IA real,
 * sem tocar em telas, hooks ou componentes.
 */
export const getEpiVerificationService = (): EpiVerificationService => {
  if (!cachedService) {
    cachedService = env.epiApiUrl
      ? new ApiEpiVerificationService({
          baseUrl: env.epiApiUrl,
          timeoutMs: env.epiApiTimeoutMs,
        })
      : new MockEpiVerificationService();
  }

  return cachedService;
};
