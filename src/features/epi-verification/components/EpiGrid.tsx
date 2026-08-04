import clsx from 'clsx';

import { EPI_CATALOG } from '@/constants/epiCatalog';
import { APP_MESSAGES } from '@/constants/messages';

import type { EpiId } from '../types';

import styles from './EpiGrid.module.css';

export interface EpiGridProps {
  activeIds: readonly EpiId[];
  className?: string;
}

/** Grade "N equipamentos ativos para verificação" da tela inicial. */
export const EpiGrid = ({ activeIds, className }: EpiGridProps) => {
  const activeCount = activeIds.length;
  const countLabel =
    activeCount === 1
      ? APP_MESSAGES.home.equipmentCountSuffixSingular
      : APP_MESSAGES.home.equipmentCountSuffix;

  return (
    <section className={clsx(styles.wrapper, className)} aria-label="Equipamentos verificados">
      <p className={styles.count}>{`${activeCount} ${countLabel}`}</p>

      <ul className={styles.grid}>
        {EPI_CATALOG.map((item) => {
          const isActive = activeIds.includes(item.id);
          const Icon = item.icon;

          return (
            <li key={item.id} className={clsx(styles.item, !isActive && styles.inactive)}>
              <span className={styles.iconWrapper}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.description}>{item.description}</span>
              <span className="visually-hidden">{isActive ? 'Ativo' : 'Inativo'}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
