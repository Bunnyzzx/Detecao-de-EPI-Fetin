import { useCallback, useState } from 'react';

import { normalizeError } from '@/services/errors';

import { verificationHistoryRepository } from '../services/VerificationHistoryRepository';
import type { VerificationResult } from '../types';

export interface UseVerificationHistoryResult {
  items: VerificationResult[];
  error: unknown;
  reload: () => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useVerificationHistory = (): UseVerificationHistoryResult => {
  const [items, setItems] = useState<VerificationResult[]>(() =>
    verificationHistoryRepository.getAll(),
  );
  const [error, setError] = useState<unknown>(null);

  const run = useCallback((action: () => void) => {
    try {
      action();
      setItems(verificationHistoryRepository.getAll());
    } catch (caught) {
      setError(normalizeError(caught, 'storage'));
    }
  }, []);

  const reload = useCallback(() => run(() => {}), [run]);
  const remove = useCallback(
    (id: string) => run(() => verificationHistoryRepository.remove(id)),
    [run],
  );
  const clear = useCallback(() => run(() => verificationHistoryRepository.clear()), [run]);

  return { items, error, reload, remove, clear };
};
