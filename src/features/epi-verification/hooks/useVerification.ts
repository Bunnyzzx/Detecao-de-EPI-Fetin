import { useCallback, useRef, useState } from 'react';

import { isCancellation, normalizeError } from '@/services/errors';

import { getEpiVerificationService } from '../services/epiVerificationServiceFactory';
import { verificationHistoryRepository } from '../services/VerificationHistoryRepository';
import type { DetectedEpi, EpiId, VerificationResult } from '../types';
import { toDetectedEpi } from '../utils';

export type VerificationState = 'idle' | 'running' | 'success' | 'error' | 'cancelled';

export interface UseVerificationResult {
  state: VerificationState;
  /** Progresso entre 0 e 1. */
  progress: number;
  /** Estado corrente de cada equipamento exigido. */
  items: DetectedEpi[];
  /** Equipamento sendo avaliado neste instante. */
  currentItem: EpiId | null;
  error: unknown;
  start: () => Promise<VerificationResult | null>;
  cancel: () => void;
}

const buildInitialItems = (requiredEpis: EpiId[]): DetectedEpi[] =>
  requiredEpis.map((id) => toDetectedEpi({ id, detected: false, confidence: 0 }));

/**
 * Conduz uma verificação do início ao fim: dispara o serviço, acompanha o
 * progresso, salva o resultado no histórico e trata cancelamento e erro.
 *
 * Cada chamada a `start` cancela a execução anterior e assume o lugar dela.
 * A execução superada não escreve mais estado — é o que mantém o hook correto
 * sob a montagem dupla do StrictMode e em qualquer remontagem da tela.
 */
export const useVerification = (requiredEpis: EpiId[]): UseVerificationResult => {
  const [state, setState] = useState<VerificationState>('idle');
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState<DetectedEpi[]>(() => buildInitialItems(requiredEpis));
  const [currentItem, setCurrentItem] = useState<EpiId | null>(null);
  const [error, setError] = useState<unknown>(null);

  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const start = useCallback(async (): Promise<VerificationResult | null> => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    /** Verdadeiro enquanto esta execução ainda for a vigente. */
    const isCurrent = () => controllerRef.current === controller && !controller.signal.aborted;

    setState('running');
    setProgress(0);
    setItems(buildInitialItems(requiredEpis));
    setCurrentItem(requiredEpis[0] ?? null);
    setError(null);

    try {
      const verification = await getEpiVerificationService().verify(
        { requiredItems: requiredEpis, signal: controller.signal },
        (update) => {
          if (!isCurrent()) {
            return;
          }
          setProgress(update.progress);
          setItems(update.items);
          setCurrentItem(update.currentItem);
        },
      );

      if (!isCurrent()) {
        return null;
      }

      setState('success');

      // Falha ao persistir não invalida a verificação já concluída.
      try {
        verificationHistoryRepository.save(verification);
      } catch {
        // O histórico é auxiliar; o resultado continua exibível.
      }

      return verification;
    } catch (caught) {
      // Se outra execução assumiu, esta não deve mais mexer na tela.
      if (controllerRef.current !== controller) {
        return null;
      }

      if (isCancellation(caught)) {
        setState('cancelled');
        return null;
      }

      setError(normalizeError(caught));
      setState('error');
      return null;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, [requiredEpis]);

  return { state, progress, items, currentItem, error, start, cancel };
};
