/**
 * Limiares de decisão da verificação. Centralizados para que o ajuste do
 * critério não exija alterar telas nem serviços.
 */
export const VERIFICATION_THRESHOLDS = {
  /** Abaixo disso, o conjunto é considerado pouco confiável. */
  lowConfidence: 0.7,
  /** Confiança mínima para que um item detectado conte como conforme. */
  acceptedConfidence: 0.6,
} as const;

/** Chaves de armazenamento local. Prefixadas para evitar colisões. */
export const STORAGE_KEYS = {
  history: '@epi-fetin/verification-history',
  requiredEpis: '@epi-fetin/required-epis',
  users: '@epi-fetin/users',
} as const;

/** Limite de verificações guardadas no histórico local. */
export const HISTORY_LIMIT = 200;
