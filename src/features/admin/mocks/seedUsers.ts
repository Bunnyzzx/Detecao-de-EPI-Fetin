import type { AdminUser } from '../types';

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

/**
 * Operadores de exemplo, os mesmos exibidos no protótipo. Servem apenas para
 * popular a lista na primeira execução; tudo é editável e local ao aparelho.
 */
export const SEED_USERS: readonly AdminUser[] = [
  {
    id: 'seed-carlos-silva',
    name: 'Carlos Silva',
    email: 'carlos@empresa.com',
    role: 'Operador',
    area: 'Produção',
    status: 'active',
    lastAccessAt: hoursAgo(3),
  },
  {
    id: 'seed-ana-ferreira',
    name: 'Ana Ferreira',
    email: 'ana@empresa.com',
    role: 'Operador',
    area: 'Montagem',
    status: 'active',
    lastAccessAt: hoursAgo(5),
  },
  {
    id: 'seed-roberto-lima',
    name: 'Roberto Lima',
    email: 'roberto@empresa.com',
    role: 'Supervisor',
    area: 'Qualidade',
    status: 'active',
    lastAccessAt: hoursAgo(26),
  },
  {
    id: 'seed-juliana-costa',
    name: 'Juliana Costa',
    email: 'juliana@empresa.com',
    role: 'Operador',
    area: 'Logística',
    status: 'inactive',
    lastAccessAt: hoursAgo(38),
  },
  {
    id: 'seed-marcos-souza',
    name: 'Marcos Souza',
    email: 'marcos@empresa.com',
    role: 'Técnico',
    area: 'Manutenção',
    status: 'active',
    lastAccessAt: null,
  },
] as const;
