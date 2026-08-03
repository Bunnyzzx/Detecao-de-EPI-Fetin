import type { EpiId } from '../types';

/**
 * Cenários usados pelo serviço simulado. Cada um representa uma situação real
 * de inspeção e permite exercitar os três status possíveis sem uma API.
 */
export interface DetectionScenario {
  name: string;
  /** Peso relativo no sorteio (quanto maior, mais frequente). */
  weight: number;
  /** Equipamentos que o cenário deixa de reconhecer. */
  undetected: readonly EpiId[];
  /** Multiplicador aplicado à confiança-base do catálogo. */
  confidenceFactor: number;
}

export const DETECTION_SCENARIOS: readonly DetectionScenario[] = [
  {
    name: 'conformidade-total',
    weight: 4,
    undetected: [],
    confidenceFactor: 1,
  },
  {
    name: 'confianca-baixa',
    weight: 2,
    undetected: [],
    confidenceFactor: 0.7,
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
    name: 'sem-capacete-e-colete',
    weight: 2,
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
