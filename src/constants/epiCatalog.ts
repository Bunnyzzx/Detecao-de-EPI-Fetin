import { Footprints, Glasses, HardHat, Headphones, Shield, Shirt, Wind } from 'lucide-react';

import type { EpiCatalogItem, EpiId } from '@/features/epi-verification/types';

/**
 * Catálogo fiel ao protótipo: mesmos identificadores, rótulos, descrições e
 * confianças-base exibidas no site original.
 */
export const EPI_CATALOG: readonly EpiCatalogItem[] = [
  {
    id: 'capacete',
    label: 'Capacete',
    description: 'Proteção da cabeça',
    icon: HardHat,
    baselineConfidence: 0.97,
  },
  {
    id: 'colete',
    label: 'Colete',
    description: 'Proteção do tronco',
    icon: Shirt,
    baselineConfidence: 0.94,
  },
  {
    id: 'oculos',
    label: 'Óculos',
    description: 'Proteção ocular',
    icon: Glasses,
    baselineConfidence: 0.93,
  },
  {
    id: 'botas',
    label: 'Botas',
    description: 'Proteção dos pés',
    icon: Footprints,
    baselineConfidence: 0.91,
  },
  {
    id: 'auricular',
    label: 'Protetor Auricular',
    description: 'Proteção auditiva',
    icon: Headphones,
    baselineConfidence: 0.95,
  },
  {
    id: 'mascara',
    label: 'Máscara',
    description: 'Proteção respiratória',
    icon: Wind,
    baselineConfidence: 0.96,
  },
  {
    id: 'luvas',
    label: 'Luvas',
    description: 'Proteção das mãos',
    icon: Shield,
    baselineConfidence: 0.9,
  },
] as const;

const catalogById = new Map<EpiId, EpiCatalogItem>(EPI_CATALOG.map((item) => [item.id, item]));

export const getEpiById = (id: EpiId): EpiCatalogItem | undefined => catalogById.get(id);

/** Configuração inicial: todos os sete equipamentos são exigidos, como no site. */
export const DEFAULT_REQUIRED_EPI_IDS: readonly EpiId[] = EPI_CATALOG.map((item) => item.id);
