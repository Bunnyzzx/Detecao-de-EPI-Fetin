import type { EpiId } from '../types';

/**
 * Cenários usados pelo serviço simulado. Cada um representa uma situação real
 * de inspeção e permite exercitar os três status sem a IA de detecção.
 */
export interface VerificationScenario {
  name: string;
  /** Peso relativo no sorteio (quanto maior, mais frequente). */
  weight: number;
  /** Equipamentos que o cenário deixa de reconhecer. */
  undetected: readonly EpiId[];
  /** Multiplicador aplicado à confiança-base do catálogo. */
  confidenceFactor: number;
}

/**
 * Os pesos refletem a realidade de um terminal de entrada: a maioria das
 * pessoas chega com todos os equipamentos. Com esta distribuição, cerca de
 * 60% das verificações liberam o acesso, 20% pedem atenção e 20% reprovam —
 * o suficiente para demonstrar os três resultados sem passar a impressão de
 * que o sistema reprova todo mundo.
 */
export const VERIFICATION_SCENARIOS: readonly VerificationScenario[] = [
  {
    name: 'conformidade-total',
    weight: 12,
    undetected: [],
    confidenceFactor: 1,
  },
  {
    name: 'falta-oculos',
    weight: 3,
    undetected: ['oculos'],
    confidenceFactor: 0.96,
  },
  {
    name: 'falta-luvas-e-mascara',
    weight: 2,
    undetected: ['luvas', 'mascara'],
    confidenceFactor: 0.94,
  },
  {
    name: 'confianca-baixa',
    weight: 1,
    undetected: [],
    confidenceFactor: 0.7,
  },
  {
    name: 'sem-capacete-e-colete',
    weight: 1,
    undetected: ['capacete', 'colete'],
    confidenceFactor: 0.92,
  },
  {
    name: 'nada-reconhecido',
    weight: 1,
    undetected: ['capacete', 'colete', 'oculos', 'botas', 'auricular', 'mascara', 'luvas'],
    confidenceFactor: 0.4,
  },
] as const;
