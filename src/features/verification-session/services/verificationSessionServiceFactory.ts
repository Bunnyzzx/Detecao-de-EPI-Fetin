import type { VerificationSessionService } from '../types';

import { MockVerificationSessionService } from './MockVerificationSessionService';

let cachedService: VerificationSessionService | null = null;

/**
 * Único ponto do aplicativo que decide qual implementação da sessão usar.
 *
 * Quando o cliente do dispositivo embarcado existir, ele entra aqui — nenhuma
 * tela, hook ou componente precisa mudar.
 */
export const getVerificationSessionService = (): VerificationSessionService => {
  if (!cachedService) {
    cachedService = new MockVerificationSessionService();
  }
  return cachedService;
};

/** Permite substituir a implementação em testes. */
export const setVerificationSessionService = (service: VerificationSessionService | null): void => {
  cachedService = service;
};
