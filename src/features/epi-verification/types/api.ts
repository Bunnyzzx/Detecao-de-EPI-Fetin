/**
 * Contrato esperado da futura API da IA de detecção.
 * Fica separado do domínio para que uma mudança no formato da resposta afete
 * apenas o mapeador (`utils/mapVerificationResponse.ts`).
 */
export interface ApiDetectionItemDto {
  /** Identificador do equipamento, ex.: "capacete". */
  id: string;
  detected: boolean;
  /** Aceita 0–1 ou 0–100; o mapeador normaliza. */
  confidence: number;
}

export type ApiSessionState = 'running' | 'completed' | 'failed';

/** Resposta do endpoint que abre uma sessão de verificação. */
export interface ApiStartSessionDto {
  sessionId: string;
}

/** Resposta do endpoint consultado enquanto a verificação acontece. */
export interface ApiSessionStatusDto {
  state: ApiSessionState;
  /** Progresso entre 0 e 1, ou entre 0 e 100. */
  progress?: number;
  items?: ApiDetectionItemDto[];
  durationMs?: number;
  verifiedAt?: string;
  message?: string;
}
