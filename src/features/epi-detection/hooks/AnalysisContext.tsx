import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { normalizeError } from '@/services/errors';

import { getEpiDetectionService } from '../services/epiDetectionServiceFactory';
import type { EpiDetectionResult, EpiId } from '../types';

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';

interface AnalysisContextValue {
  lastResult: EpiDetectionResult | null;
  status: AnalysisStatus;
  error: unknown;
  analyze: (requiredItems: EpiId[]) => Promise<EpiDetectionResult | null>;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

/**
 * Guarda o resultado da análise em memória, para que a tela de resultado o leia
 * sem depender de persistência.
 */
export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [lastResult, setLastResult] = useState<EpiDetectionResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  /** Trava contra envios duplicados da mesma análise. */
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    setLastResult(null);
    setStatus('idle');
    setError(null);
  }, []);

  const analyze = useCallback(
    async (requiredItems: EpiId[]): Promise<EpiDetectionResult | null> => {
      if (inFlightRef.current) {
        return null;
      }

      inFlightRef.current = true;
      setStatus('analyzing');
      setError(null);

      try {
        const result = await getEpiDetectionService().analyzeImage({ requiredItems });
        setLastResult(result);
        setStatus('success');
        return result;
      } catch (caught) {
        setError(normalizeError(caught));
        setStatus('error');
        return null;
      } finally {
        inFlightRef.current = false;
      }
    },
    [],
  );

  const value = useMemo<AnalysisContextValue>(
    () => ({ lastResult, status, error, analyze, reset }),
    [lastResult, status, error, analyze, reset],
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
};

export const useAnalysis = (): AnalysisContextValue => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis precisa estar dentro de AnalysisProvider.');
  }
  return context;
};
