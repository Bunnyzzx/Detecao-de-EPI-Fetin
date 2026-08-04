import clsx from 'clsx';
import type { ReactElement } from 'react';

import type { DetectedEpi, EpiId } from '../types';

import styles from './HumanSilhouette.module.css';

export type ZoneState = 'idle' | 'scanning' | 'detected' | 'missing';

export interface HumanSilhouetteProps {
  /** Estado corrente de cada equipamento exigido. */
  items: DetectedEpi[];
  /** Equipamento sendo avaliado neste instante. */
  currentItem: EpiId | null;
  /** Quando falso, nada pulsa: a verificação não está em andamento. */
  scanning: boolean;
  /** Antes do fim da verificação, "não detectado" ainda é só "aguardando". */
  finished: boolean;
}

/**
 * Silhueta humana com uma zona por equipamento, como no visor do protótipo.
 * Cada zona muda de cor conforme o equipamento é avaliado, o que dá ao
 * operador uma leitura imediata de onde está o problema.
 */
export const HumanSilhouette = ({
  items,
  currentItem,
  scanning,
  finished,
}: HumanSilhouetteProps) => {
  const stateById = new Map<EpiId, ZoneState>();

  items.forEach((item) => {
    if (item.id === currentItem && scanning) {
      stateById.set(item.id, 'scanning');
      return;
    }
    if (item.detected) {
      stateById.set(item.id, 'detected');
      return;
    }
    stateById.set(item.id, finished ? 'missing' : 'idle');
  });

  const zoneClass = (id: EpiId): string => {
    const state = stateById.get(id);
    return clsx(
      styles.zone,
      state === 'scanning' && styles.zoneScanning,
      state === 'detected' && styles.zoneDetected,
      state === 'missing' && styles.zoneMissing,
    );
  };

  /** Renderiza a zona apenas quando o equipamento está entre os exigidos. */
  const zone = (id: EpiId, shape: ReactElement): ReactElement | null =>
    stateById.has(id) ? shape : null;

  return (
    <svg
      className={styles.silhouette}
      viewBox="0 0 200 420"
      role="img"
      aria-label="Silhueta indicando as áreas verificadas do corpo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={styles.body}>
        <circle cx="100" cy="52" r="26" />
        <line x1="100" y1="78" x2="100" y2="90" />
        <rect x="62" y="90" width="76" height="116" rx="24" />
        <line x1="66" y1="100" x2="36" y2="188" />
        <line x1="134" y1="100" x2="164" y2="188" />
        <circle cx="32" cy="200" r="11" />
        <circle cx="168" cy="200" r="11" />
        <line x1="84" y1="206" x2="78" y2="336" />
        <line x1="116" y1="206" x2="122" y2="336" />
        <rect x="56" y="336" width="44" height="22" rx="8" />
        <rect x="100" y="336" width="44" height="22" rx="8" />
      </g>

      {zone(
        'capacete',
        <ellipse cx="100" cy="40" rx="32" ry="21" className={zoneClass('capacete')} />,
      )}
      {zone(
        'auricular',
        <g className={zoneClass('auricular')}>
          <circle cx="71" cy="54" r="9" />
          <circle cx="129" cy="54" r="9" />
        </g>,
      )}
      {zone(
        'oculos',
        <rect x="76" y="45" width="48" height="13" rx="6" className={zoneClass('oculos')} />,
      )}
      {zone(
        'mascara',
        <rect x="81" y="61" width="38" height="15" rx="7" className={zoneClass('mascara')} />,
      )}
      {zone(
        'colete',
        <rect x="63" y="93" width="74" height="82" rx="20" className={zoneClass('colete')} />,
      )}
      {zone(
        'luvas',
        <g className={zoneClass('luvas')}>
          <circle cx="32" cy="200" r="15" />
          <circle cx="168" cy="200" r="15" />
        </g>,
      )}
      {zone(
        'botas',
        <g className={zoneClass('botas')}>
          <rect x="52" y="332" width="52" height="30" rx="10" />
          <rect x="96" y="332" width="52" height="30" rx="10" />
        </g>,
      )}
    </svg>
  );
};
