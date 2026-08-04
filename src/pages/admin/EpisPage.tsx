import clsx from 'clsx';

import { Card, Toggle } from '@/components/ui';
import { EPI_CATALOG } from '@/constants/epiCatalog';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiGrid } from '@/features/epi-verification/components';
import { useRequiredEpis } from '@/features/epi-verification/hooks';

import adminStyles from './adminPage.module.css';
import styles from './EpisPage.module.css';

export const EpisPage = () => {
  const { requiredEpis, toggleEpi } = useRequiredEpis();
  const isLastActive = requiredEpis.length === 1;

  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.header}>
        <div>
          <h1 className={adminStyles.title}>{APP_MESSAGES.admin.episTitle}</h1>
          <p className={adminStyles.subtitle}>{APP_MESSAGES.admin.episSubtitle}</p>
        </div>
      </header>

      <Card>
        <h2 className={adminStyles.cardTitle}>{APP_MESSAGES.admin.episAvailable}</h2>
        <p className={adminStyles.cardSubtitle}>{APP_MESSAGES.admin.episLiveConfig}</p>

        <ul className={styles.list}>
          {EPI_CATALOG.map((item) => {
            const isActive = requiredEpis.includes(item.id);
            const Icon = item.icon;

            return (
              <li key={item.id} className={clsx(styles.row, !isActive && styles.inactive)}>
                <span className={styles.iconWrapper}>
                  <Icon size={20} aria-hidden="true" />
                </span>

                <div className={styles.texts}>
                  <p className={styles.label}>{item.label}</p>
                  <p className={styles.description}>{item.description}</p>
                </div>

                <Toggle
                  checked={isActive}
                  onChange={() => toggleEpi(item.id)}
                  label={`${item.label}: ${isActive ? 'ativo' : 'inativo'}`}
                  disabled={isActive && isLastActive}
                />
              </li>
            );
          })}
        </ul>

        {isLastActive && <p className={styles.warning}>{APP_MESSAGES.admin.episMinimumWarning}</p>}
      </Card>

      <Card>
        <h2 className={adminStyles.cardTitle}>{APP_MESSAGES.admin.episPreview}</h2>
        <p className={adminStyles.cardSubtitle}>{APP_MESSAGES.home.readyDescription}</p>
        <EpiGrid activeIds={requiredEpis} />
      </Card>
    </div>
  );
};
