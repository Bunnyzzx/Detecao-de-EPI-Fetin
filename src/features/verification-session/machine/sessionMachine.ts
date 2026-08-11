import type { EpiId } from '@/features/epi-detection/types';
import { toDetectedEpi } from '@/features/epi-detection/utils/buildDetectionResult';

import type { AnySessionEvent, SessionSnapshot, SessionState } from '../types';

/** Estados a partir dos quais a sessão ainda pode ser interrompida. */
const CANCELLABLE: readonly SessionState[] = [
  'opening',
  'face_scanning',
  'face_recognized',
  'face_unknown',
  'epi_detecting',
];

export const createInitialSnapshot = (): SessionSnapshot => ({
  state: 'idle',
  employee: null,
  faceConfidence: null,
  progress: 0,
  items: [],
  currentItem: null,
  outcome: null,
  error: null,
});

/** Lista inicial de equipamentos, todos aguardando avaliação. */
const buildPendingItems = (requiredItems: EpiId[]) =>
  requiredItems.map((id) => toDetectedEpi({ id, detected: false, confidence: 0 }));

/**
 * Máquina de estados da sessão de verificação.
 *
 * É uma função pura: não depende de React, de rede nem de temporizador, o que
 * permite testar todas as transições isoladamente. As telas apenas leem o
 * snapshot resultante.
 */
export const sessionReducer = (
  snapshot: SessionSnapshot,
  event: AnySessionEvent,
): SessionSnapshot => {
  switch (event.type) {
    case 'START':
      return {
        ...createInitialSnapshot(),
        state: 'opening',
        items: buildPendingItems(event.requiredItems),
        currentItem: event.requiredItems[0] ?? null,
      };

    case 'OPENED':
      return snapshot.state === 'opening' ? { ...snapshot, state: 'face_scanning' } : snapshot;

    case 'FACE_SCANNING':
      return { ...snapshot, state: 'face_scanning' };

    case 'FACE_RECOGNIZED':
      return {
        ...snapshot,
        state: 'face_recognized',
        employee: event.employee,
        faceConfidence: event.confidence,
      };

    case 'FACE_UNKNOWN':
      return {
        ...snapshot,
        state: 'face_unknown',
        employee: null,
        faceConfidence: event.confidence,
      };

    case 'EPI_STARTED':
      return { ...snapshot, state: 'epi_detecting' };

    case 'EPI_PROGRESS':
      return {
        ...snapshot,
        state: 'epi_detecting',
        progress: event.progress,
        items: event.items,
        currentItem: event.currentItem,
      };

    case 'COMPLETED':
      return {
        ...snapshot,
        state: 'completed',
        progress: 1,
        currentItem: null,
        outcome: event.outcome,
        items: [...event.outcome.detection.detectedItems, ...event.outcome.detection.missingItems],
      };

    case 'FAILED':
      return { ...snapshot, state: 'error', error: event.error };

    case 'CANCELLED':
      // Só interrompe o que ainda está em andamento; sessões terminadas ficam.
      return CANCELLABLE.includes(snapshot.state) ? { ...snapshot, state: 'cancelled' } : snapshot;

    case 'RESET':
      return createInitialSnapshot();

    default:
      return snapshot;
  }
};

/** Verdadeiro enquanto a sessão está em execução. */
export const isSessionRunning = (state: SessionState): boolean => CANCELLABLE.includes(state);
