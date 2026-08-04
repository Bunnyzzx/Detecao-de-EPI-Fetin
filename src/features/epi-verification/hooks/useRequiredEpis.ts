import { useCallback, useState } from 'react';

import { EPI_CATALOG } from '@/constants/epiCatalog';
import { normalizeError } from '@/services/errors';

import { epiSettingsRepository } from '../services/EpiSettingsRepository';
import type { EpiId } from '../types';

export interface UseRequiredEpisResult {
  requiredEpis: EpiId[];
  error: unknown;
  toggleEpi: (id: EpiId) => void;
}

/** Ordena a seleção segundo o catálogo, para a lista nunca embaralhar. */
const sortByCatalog = (ids: EpiId[]): EpiId[] =>
  EPI_CATALOG.filter((item) => ids.includes(item.id)).map((item) => item.id);

/**
 * Lê e grava a lista de equipamentos exigidos, sempre via repositório.
 * A leitura é síncrona (localStorage), então o estado já nasce correto.
 */
export const useRequiredEpis = (): UseRequiredEpisResult => {
  const [requiredEpis, setRequiredEpis] = useState<EpiId[]>(() =>
    epiSettingsRepository.getRequiredEpis(),
  );
  const [error, setError] = useState<unknown>(null);

  const toggleEpi = useCallback((id: EpiId) => {
    setRequiredEpis((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : sortByCatalog([...current, id]);

      // Pelo menos um equipamento precisa continuar ativo.
      if (next.length === 0) {
        return current;
      }

      try {
        epiSettingsRepository.setRequiredEpis(next);
      } catch (caught) {
        setError(normalizeError(caught, 'storage'));
        return current;
      }

      return next;
    });
  }, []);

  return { requiredEpis, error, toggleEpi };
};
