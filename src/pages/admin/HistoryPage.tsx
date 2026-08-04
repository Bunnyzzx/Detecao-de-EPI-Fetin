import clsx from 'clsx';
import { ExternalLink, History, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { EmptyState } from '@/components/feedback';
import { Button, Card } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useVerificationHistory } from '@/features/epi-verification/hooks';
import { getStatusPresentation } from '@/features/epi-verification/utils';
import { formatConfidence, formatDateTime, pluralize } from '@/utils';

import adminStyles from './adminPage.module.css';
import styles from './HistoryPage.module.css';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const { items, remove, clear } = useVerificationHistory();

  const confirmClear = useCallback(() => {
    if (window.confirm(APP_MESSAGES.admin.historyClearConfirm)) {
      clear();
    }
  }, [clear]);

  const confirmRemove = useCallback(
    (id: string) => {
      if (window.confirm(APP_MESSAGES.admin.historyRemoveConfirm)) {
        remove(id);
      }
    },
    [remove],
  );

  return (
    <div className={adminStyles.page}>
      <header className={adminStyles.header}>
        <div>
          <h1 className={adminStyles.title}>{APP_MESSAGES.admin.historyTitle}</h1>
          <p className={adminStyles.subtitle}>{APP_MESSAGES.admin.historySubtitle}</p>
        </div>

        {items.length > 0 && (
          <Button
            label={APP_MESSAGES.admin.historyClearButton}
            icon={Trash2}
            variant="secondary"
            onClick={confirmClear}
          />
        )}
      </header>

      {items.length === 0 ? (
        <Card variant="outlined">
          <EmptyState
            icon={History}
            title={APP_MESSAGES.admin.historyEmptyTitle}
            description={APP_MESSAGES.admin.historyEmptyDescription}
            compact
          />
        </Card>
      ) : (
        <ul className={styles.list}>
          {items.map((result) => {
            const presentation = getStatusPresentation(result.status);
            const StatusIcon = presentation.icon;

            return (
              <li key={result.id} className={clsx(styles.item, styles[presentation.modifier])}>
                <span className={styles.statusIcon}>
                  <StatusIcon size={22} aria-hidden="true" />
                </span>

                <div className={styles.details}>
                  <div className={styles.titleRow}>
                    <span className={styles.status}>{presentation.shortLabel}</span>
                    <span className={styles.moment}>{formatDateTime(result.verifiedAt)}</span>
                  </div>

                  <p className={styles.counts}>
                    {`${pluralize(
                      result.detectedItems.length,
                      APP_MESSAGES.admin.detectedCountLabelSingular,
                      APP_MESSAGES.admin.detectedCountLabel,
                    )} · ${pluralize(
                      result.missingItems.length,
                      APP_MESSAGES.admin.missingCountLabelSingular,
                      APP_MESSAGES.admin.missingCountLabel,
                    )}`}
                  </p>

                  <p className={styles.confidence}>
                    {`${APP_MESSAGES.result.confidenceLabel}: ${formatConfidence(result.overallConfidence)}`}
                  </p>
                </div>

                <div className={styles.actions}>
                  <Button
                    label={APP_MESSAGES.admin.viewDetails}
                    icon={ExternalLink}
                    variant="secondary"
                    onClick={() => navigate(`/resultado/${result.id}`)}
                  />
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`${APP_MESSAGES.common.remove} verificação de ${formatDateTime(result.verifiedAt)}`}
                    onClick={() => confirmRemove(result.id)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
