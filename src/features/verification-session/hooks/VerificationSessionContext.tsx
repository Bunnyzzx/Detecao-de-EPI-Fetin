import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import type { EpiId } from '@/features/epi-detection/types';
import { isCancellation, normalizeError } from '@/services/errors';

import { createInitialSnapshot, sessionReducer } from '../machine/sessionMachine';
import { getVerificationSessionService } from '../services/verificationSessionServiceFactory';
import type { SessionSnapshot, VerificationOutcome } from '../types';

interface VerificationSessionContextValue {
  snapshot: SessionSnapshot;
  /** Inicia uma sessão; devolve o resultado ou `null` se falhar/cancelar. */
  start: (requiredItems: EpiId[]) => Promise<VerificationOutcome | null>;
  cancel: () => void;
  /** Limpa pessoa reconhecida, progresso e resultado. */
  reset: () => void;
}

const VerificationSessionContext = createContext<VerificationSessionContextValue | null>(null);

/**
 * Mantém a sessão viva entre a tela de verificação e a de resultado, sem
 * depender de persistência nem de parâmetros de rota.
 */
export const VerificationSessionProvider = ({ children }: { children: ReactNode }) => {
  const [snapshot, dispatch] = useReducer(sessionReducer, undefined, createInitialSnapshot);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    dispatch({ type: 'CANCELLED' });
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  const start = useCallback(async (requiredItems: EpiId[]): Promise<VerificationOutcome | null> => {
    // Uma nova sessão cancela e assume o lugar da anterior.
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    /** Verdadeiro enquanto esta execução ainda for a vigente. */
    const isCurrent = () => controllerRef.current === controller && !controller.signal.aborted;

    dispatch({ type: 'START', requiredItems });

    try {
      const outcome = await getVerificationSessionService().run(
        { requiredItems, signal: controller.signal },
        (event) => {
          if (isCurrent()) {
            dispatch(event);
          }
        },
      );

      return isCurrent() ? outcome : null;
    } catch (caught) {
      if (controllerRef.current !== controller) {
        return null;
      }
      if (isCancellation(caught)) {
        dispatch({ type: 'CANCELLED' });
        return null;
      }
      dispatch({ type: 'FAILED', error: normalizeError(caught) });
      return null;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, []);

  const value = useMemo<VerificationSessionContextValue>(
    () => ({ snapshot, start, cancel, reset }),
    [snapshot, start, cancel, reset],
  );

  return (
    <VerificationSessionContext.Provider value={value}>
      {children}
    </VerificationSessionContext.Provider>
  );
};

export const useVerificationSession = (): VerificationSessionContextValue => {
  const context = useContext(VerificationSessionContext);
  if (!context) {
    throw new Error('useVerificationSession precisa estar dentro de VerificationSessionProvider.');
  }
  return context;
};
