import type { DetectedEpi, EpiDetectionResult, EpiId } from '@/features/epi-detection/types';
import type { RecognizedEmployee } from '@/features/face-recognition/types';

/** Estados possíveis de uma sessão de verificação no terminal. */
export type SessionState =
  | 'idle'
  | 'opening'
  | 'face_scanning'
  | 'face_recognized'
  | 'face_unknown'
  | 'epi_detecting'
  | 'completed'
  | 'error'
  | 'cancelled';

/**
 * Resultado final da sessão: quem foi reconhecido e o que foi detectado.
 * É o que o backend registrará quando a integração existir.
 */
export interface VerificationOutcome {
  id: string;
  /** Nulo quando ninguém foi reconhecido — a tentativa é registrada mesmo assim. */
  employee: RecognizedEmployee | null;
  faceConfidence: number | null;
  detection: EpiDetectionResult;
  verifiedAt: string;
}

/**
 * Eventos emitidos durante a sessão. O serviço simulado e o futuro cliente do
 * dispositivo embarcado emitem exatamente este vocabulário.
 */
export type SessionEvent =
  | { type: 'OPENED' }
  | { type: 'FACE_SCANNING' }
  | { type: 'FACE_RECOGNIZED'; employee: RecognizedEmployee; confidence: number }
  | { type: 'FACE_UNKNOWN'; confidence: number }
  | { type: 'EPI_STARTED' }
  | { type: 'EPI_PROGRESS'; progress: number; items: DetectedEpi[]; currentItem: EpiId | null }
  | { type: 'COMPLETED'; outcome: VerificationOutcome };

/** Eventos internos da máquina, que não vêm do serviço. */
export type SessionControlEvent =
  | { type: 'START'; requiredItems: EpiId[] }
  | { type: 'FAILED'; error: unknown }
  | { type: 'CANCELLED' }
  | { type: 'RESET' };

export type AnySessionEvent = SessionEvent | SessionControlEvent;

export interface SessionSnapshot {
  state: SessionState;
  employee: RecognizedEmployee | null;
  faceConfidence: number | null;
  /** Progresso da detecção de EPIs, entre 0 e 1. */
  progress: number;
  items: DetectedEpi[];
  currentItem: EpiId | null;
  outcome: VerificationOutcome | null;
  error: unknown;
}

export interface VerificationSessionInput {
  requiredItems: EpiId[];
  signal?: AbortSignal;
}

export type SessionEventListener = (event: SessionEvent) => void;

/**
 * Contrato da sessão de verificação.
 *
 * Uma única chamada conduz reconhecimento facial e detecção de EPIs, emitindo
 * progresso pelo caminho. Trocar o mock pelo cliente do embarcado não exige
 * alteração em nenhuma tela.
 */
export interface VerificationSessionService {
  run(input: VerificationSessionInput, onEvent: SessionEventListener): Promise<VerificationOutcome>;
}
