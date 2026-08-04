import { DEFAULT_REQUIRED_EPI_IDS } from '@/constants/epiCatalog';
import { STORAGE_KEYS } from '@/constants/verification';
import { storageClient } from '@/services/storage/storageClient';

import { isEpiId, type EpiId } from '../types';

export interface EpiSettingsRepository {
  getRequiredEpis(): EpiId[];
  setRequiredEpis(ids: EpiId[]): void;
}

/**
 * Configuração de quais equipamentos são exigidos — equivale à tela
 * "EPIs Ativos" do painel administrativo do protótipo.
 */
export const epiSettingsRepository: EpiSettingsRepository = {
  getRequiredEpis() {
    const stored = storageClient.readJson<unknown>(STORAGE_KEYS.requiredEpis);

    if (!Array.isArray(stored)) {
      return [...DEFAULT_REQUIRED_EPI_IDS];
    }

    const valid = stored.filter((item): item is EpiId => typeof item === 'string' && isEpiId(item));
    return valid.length > 0 ? valid : [...DEFAULT_REQUIRED_EPI_IDS];
  },

  setRequiredEpis(ids) {
    storageClient.writeJson(STORAGE_KEYS.requiredEpis, ids);
  },
};
