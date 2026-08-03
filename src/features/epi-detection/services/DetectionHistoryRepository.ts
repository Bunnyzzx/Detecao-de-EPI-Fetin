import { HISTORY_LIMIT, STORAGE_KEYS } from '@/constants/detection';
import { storageClient } from '@/services/storage/storageClient';

import type { EpiDetectionResult } from '../types';

export interface DetectionHistoryRepository {
  getAll(): Promise<EpiDetectionResult[]>;
  getById(id: string): Promise<EpiDetectionResult | null>;
  save(result: EpiDetectionResult): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

const isDetectionResult = (value: unknown): value is EpiDetectionResult => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<EpiDetectionResult>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.imageUri === 'string' &&
    typeof candidate.analyzedAt === 'string' &&
    Array.isArray(candidate.detectedItems) &&
    Array.isArray(candidate.missingItems)
  );
};

/**
 * Histórico local das análises. Guarda no máximo `HISTORY_LIMIT` registros,
 * do mais recente para o mais antigo.
 */
export const detectionHistoryRepository: DetectionHistoryRepository = {
  async getAll() {
    const stored = await storageClient.readJson<unknown>(STORAGE_KEYS.history);
    if (!Array.isArray(stored)) {
      return [];
    }
    return stored.filter(isDetectionResult);
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find((item) => item.id === id) ?? null;
  },

  async save(result) {
    const all = await this.getAll();
    const withoutDuplicate = all.filter((item) => item.id !== result.id);
    const updated = [result, ...withoutDuplicate].slice(0, HISTORY_LIMIT);
    await storageClient.writeJson(STORAGE_KEYS.history, updated);
  },

  async remove(id) {
    const all = await this.getAll();
    await storageClient.writeJson(
      STORAGE_KEYS.history,
      all.filter((item) => item.id !== id),
    );
  },

  async clear() {
    await storageClient.remove(STORAGE_KEYS.history);
  },
};
