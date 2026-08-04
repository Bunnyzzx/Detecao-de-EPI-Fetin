import { HISTORY_LIMIT, STORAGE_KEYS } from '@/constants/verification';
import { storageClient } from '@/services/storage/storageClient';

import type { VerificationResult } from '../types';

export interface VerificationHistoryRepository {
  getAll(): VerificationResult[];
  getById(id: string): VerificationResult | null;
  save(result: VerificationResult): void;
  remove(id: string): void;
  clear(): void;
}

const isVerificationResult = (value: unknown): value is VerificationResult => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<VerificationResult>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.verifiedAt === 'string' &&
    Array.isArray(candidate.detectedItems) &&
    Array.isArray(candidate.missingItems)
  );
};

/**
 * Histórico local das verificações do terminal. Guarda no máximo
 * `HISTORY_LIMIT` registros, do mais recente para o mais antigo.
 */
export const verificationHistoryRepository: VerificationHistoryRepository = {
  getAll() {
    const stored = storageClient.readJson<unknown>(STORAGE_KEYS.history);
    return Array.isArray(stored) ? stored.filter(isVerificationResult) : [];
  },

  getById(id) {
    return this.getAll().find((item) => item.id === id) ?? null;
  },

  save(result) {
    const withoutDuplicate = this.getAll().filter((item) => item.id !== result.id);
    storageClient.writeJson(
      STORAGE_KEYS.history,
      [result, ...withoutDuplicate].slice(0, HISTORY_LIMIT),
    );
  },

  remove(id) {
    storageClient.writeJson(
      STORAGE_KEYS.history,
      this.getAll().filter((item) => item.id !== id),
    );
  },

  clear() {
    storageClient.remove(STORAGE_KEYS.history);
  },
};
