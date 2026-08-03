/**
 * Limiares de decisão da verificação. Centralizados para que o ajuste do
 * critério não exija alterar telas nem serviços.
 */
export const DETECTION_THRESHOLDS = {
  /** Abaixo disso, uma detecção é considerada pouco confiável. */
  lowConfidence: 0.7,
  /** Confiança mínima para que um item detectado conte como conforme. */
  acceptedConfidence: 0.6,
} as const;

/** Chaves de armazenamento local. Prefixadas para evitar colisões. */
export const STORAGE_KEYS = {
  history: '@epi-fetin/detection-history',
  requiredEpis: '@epi-fetin/required-epis',
  users: '@epi-fetin/users',
  adminSession: '@epi-fetin/admin-session',
} as const;

/** Limite de itens guardados no histórico local. */
export const HISTORY_LIMIT = 50;
