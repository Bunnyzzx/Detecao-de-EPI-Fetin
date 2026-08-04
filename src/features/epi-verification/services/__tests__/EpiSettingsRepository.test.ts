import { describe, expect, it } from 'vitest';

import { DEFAULT_REQUIRED_EPI_IDS } from '@/constants/epiCatalog';
import { STORAGE_KEYS } from '@/constants/verification';

import { epiSettingsRepository } from '../EpiSettingsRepository';

describe('epiSettingsRepository', () => {
  it('devolve todos os equipamentos por padrão', () => {
    expect(epiSettingsRepository.getRequiredEpis()).toEqual([...DEFAULT_REQUIRED_EPI_IDS]);
  });

  it('persiste e recupera a seleção', () => {
    epiSettingsRepository.setRequiredEpis(['capacete', 'botas']);

    expect(epiSettingsRepository.getRequiredEpis()).toEqual(['capacete', 'botas']);
  });

  it('descarta identificadores desconhecidos', () => {
    localStorage.setItem(STORAGE_KEYS.requiredEpis, JSON.stringify(['capacete', 'paraquedas']));

    expect(epiSettingsRepository.getRequiredEpis()).toEqual(['capacete']);
  });

  it('volta ao padrão quando a lista salva fica vazia', () => {
    localStorage.setItem(STORAGE_KEYS.requiredEpis, JSON.stringify([]));

    expect(epiSettingsRepository.getRequiredEpis()).toEqual([...DEFAULT_REQUIRED_EPI_IDS]);
  });
});
