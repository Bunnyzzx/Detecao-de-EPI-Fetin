import { delay } from '@/utils';

import type { AdminCredentials } from '../types';

/**
 * Autenticação simulada, equivalente à do protótipo (admin/admin), exibida na
 * própria tela como dica de demonstração.
 *
 * Não há credenciais sensíveis aqui: quando existir um backend, este arquivo é
 * o único ponto a substituir por uma chamada real ao serviço de autenticação.
 */
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin';

export const adminAuthService = {
  async signIn({ username, password }: AdminCredentials): Promise<boolean> {
    await delay(600);
    return username.trim().toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD;
  },
};
