import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { AppError, normalizeError } from '@/services/errors';

import { detectionHistoryRepository } from '../services/DetectionHistoryRepository';
import { getEpiDetectionService } from '../services/epiDetectionServiceFactory';
import type { DetectionSource, EpiDetectionResult, EpiId } from '../types';

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';

export interface PendingImage {
  uri: string;
  source: DetectionSource;
}

interface AnalysisContextValue {
  pendingImage: PendingImage | null;
  lastResult: EpiDetectionResult | null;
  status: AnalysisStatus;
  error: unknown;
  setPendingImage: (image: PendingImage) => void;
  clearPendingImage: () => void;
  analyze: (requiredItems: EpiId[]) => Promise<EpiDetectionResult | null>;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

/**
 * Guarda a imagem em análise e o último resultado, permitindo que câmera,
 * pré-visualização e resultado compartilhem estado sem passar dados pesados
 * pelos parâmetros de rota.
 */
export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [pendingImage, setPendingImageState] = useState<PendingImage | null>(null);
  const [lastResult, setLastResult] = useState<EpiDetectionResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  /** Trava contra envios duplicados da mesma análise. */
  const inFlightRef = useRef(false);

  const setPendingImage = useCallback((image: PendingImage) => {
    setPendingImageState(image);
    setStatus('idle');
    setError(null);
  }, []);

  const clearPendingImage = useCallback(() => {
    setPendingImageState(null);
    setStatus('idle');
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setPendingImageState(null);
    setLastResult(null);
    setStatus('idle');
    setError(null);
  }, []);

  const analyze = useCallback(
    async (requiredItems: EpiId[]): Promise<EpiDetectionResult | null> => {
      if (inFlightRef.current) {
        return null;
      }

      if (!pendingImage) {
        const missingImageError = new AppError(
          'invalid_image',
          'Nenhuma imagem disponível para análise.',
        );
        setError(missingImageError);
        setStatus('error');
        return null;
      }

      inFlightRef.current = true;
      setStatus('analyzing');
      setError(null);

      try {
        const result = await getEpiDetectionService().analyzeImage({
          imageUri: pendingImage.uri,
          requiredItems,
          source: pendingImage.source,
        });

        setLastResult(result);
        setStatus('success');

        // Falha ao persistir não invalida a análise já concluída.
        try {
          await detectionHistoryRepository.save(result);
        } catch {
          // O histórico é um recurso auxiliar; o resultado continua exibível.
        }

        return result;
      } catch (caught) {
        setError(normalizeError(caught));
        setStatus('error');
        return null;
      } finally {
        inFlightRef.current = false;
      }
    },
    [pendingImage],
  );

  const value = useMemo<AnalysisContextValue>(
    () => ({
      pendingImage,
      lastResult,
      status,
      error,
      setPendingImage,
      clearPendingImage,
      analyze,
      reset,
    }),
    [pendingImage, lastResult, status, error, setPendingImage, clearPendingImage, analyze, reset],
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
