import { useCallback } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { normalizeError } from '@/services/errors';

import { detectionHistoryRepository } from '../services/DetectionHistoryRepository';
import type { EpiDetectionResult } from '../types';

export interface UseDetectionHistoryResult {
  items: EpiDetectionResult[];
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

const loadHistory = () => detectionHistoryRepository.getAll();

export const useDetectionHistory = (): UseDetectionHistoryResult => {
  const {
    data: items,
    setData,
    loading,
    error,
    setError,
    reload,
  } = useAsyncResource<EpiDetectionResult[]>(loadHistory, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await detectionHistoryRepository.remove(id);
        setData((current) => current.filter((item) => item.id !== id));
      } catch (caught) {
        setError(normalizeError(caught, 'storage'));
      }
    },
    [setData, setError],
  );

  const clear = useCallback(async () => {
    try {
      await detectionHistoryRepository.clear();
      setData([]);
    } catch (caught) {
      setError(normalizeError(caught, 'storage'));
    }
  }, [setData, setError]);

  return { items, loading, error, reload, remove, clear };
};
