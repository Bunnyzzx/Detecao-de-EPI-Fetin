import { VERIFICATION_THRESHOLDS } from '@/constants/verification';

import type { DetectedEpi, VerificationStatus } from '../types';

export interface VerificationStatusInput {
  detectedItems: DetectedEpi[];
  missingItems: DetectedEpi[];
  requiredCount: number;
  overallConfidence: number;
}

/**
 * Regra de decisão da verificação:
 *
 * - `rejected`  — nada foi reconhecido, ou há mais de um equipamento ausente,
 *                 ou há ausência em uma configuração com menos de 3 exigidos;
 * - `warning`   — tudo presente porém com confiança baixa, ou exatamente um
 *                 equipamento ausente entre três ou mais exigidos;
 * - `approved`  — nenhum equipamento ausente e confiança acima do limiar.
 *
 * A regra é intencionalmente conservadora: na dúvida, exige revisão humana.
 */
export const resolveVerificationStatus = ({
  detectedItems,
  missingItems,
  requiredCount,
  overallConfidence,
}: VerificationStatusInput): VerificationStatus => {
  if (requiredCount === 0 || detectedItems.length === 0) {
    return 'rejected';
  }

  if (missingItems.length === 0) {
    return overallConfidence < VERIFICATION_THRESHOLDS.lowConfidence ? 'warning' : 'approved';
  }

  if (missingItems.length === 1 && requiredCount >= 3) {
    return 'warning';
  }

  return 'rejected';
};

export const hasLowConfidence = (result: {
  detectedItems: DetectedEpi[];
  overallConfidence: number;
}): boolean =>
  result.detectedItems.length > 0 &&
  result.overallConfidence < VERIFICATION_THRESHOLDS.lowConfidence;
