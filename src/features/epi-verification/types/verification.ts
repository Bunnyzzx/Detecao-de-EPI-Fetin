import type { EpiId } from './epi';

export type VerificationStatus = 'approved' | 'warning' | 'rejected';

/** Implementação que produziu o resultado — útil para depuração e para a UI. */
export type VerificationEngine = 'mock' | 'api';

export interface DetectedEpi {
  id: EpiId;
  label: string;
  description: string;
  /** Confiança normalizada entre 0 e 1. */
  confidence: number;
  detected: boolean;
}

export interface VerificationResult {
  id: string;
  status: VerificationStatus;
  detectedItems: DetectedEpi[];
  missingItems: DetectedEpi[];
  /** Equipamentos exigidos no momento da verificação (configuráveis no admin). */
  requiredItems: EpiId[];
  /** Média das confianças dos itens detectados, entre 0 e 1. */
  overallConfidence: number;
  /** Data/hora em ISO 8601. */
  verifiedAt: string;
  durationMs: number;
  engine: VerificationEngine;
}

/**
 * Estado parcial emitido durante a verificação. É o que alimenta a barra de
 * progresso e a lista lateral, que confirma um equipamento de cada vez.
 */
export interface VerificationProgress {
  /** Progresso entre 0 e 1. */
  progress: number;
  /** Estado corrente de cada equipamento exigido. */
  items: DetectedEpi[];
  /** Equipamento avaliado neste passo, quando houver. */
  currentItem: EpiId | null;
}

export interface VerificationInput {
  requiredItems: EpiId[];
  /** Permite abortar a verificação se a pessoa sair do terminal. */
  signal?: AbortSignal;
}

export type VerificationProgressListener = (progress: VerificationProgress) => void;

/**
 * Contrato da verificação. A implementação simulada e a futura integração com
 * a IA de detecção respeitam exatamente esta assinatura.
 */
export interface EpiVerificationService {
  verify(
    input: VerificationInput,
    onProgress?: VerificationProgressListener,
  ): Promise<VerificationResult>;
}
