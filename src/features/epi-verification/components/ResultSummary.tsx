import { Badge, Card, ProgressBar } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { formatAccessMoment, formatConfidence, formatDuration } from '@/utils';

import type { VerificationResult } from '../types';
import { getStatusPresentation } from '../utils';

import styles from './ResultSummary.module.css';

export interface ResultSummaryProps {
  result: VerificationResult;
}

/** Resumo do resultado: contagem, confiança e horário do acesso. */
export const ResultSummary = ({ result }: ResultSummaryProps) => {
  const presentation = getStatusPresentation(result.status);
  const verifiedCount = result.detectedItems.length;
  const missingCount = result.missingItems.length;
  const requiredCount = result.requiredItems.length;

  return (
    <Card className={styles.summary}>
      <div>
        <Badge
          label={`${verifiedCount}/${requiredCount} ${APP_MESSAGES.result.verifiedSuffix}`}
          tone={presentation.modifier}
          withDot
          uppercase
        />
      </div>

      <h2 className={styles.title}>{presentation.cardTitle}</h2>

      <div>
        <div className={styles.confidenceHeader}>
          <span>{APP_MESSAGES.result.confidenceLabel}</span>
          <span>{formatConfidence(result.overallConfidence)}</span>
        </div>
        <ProgressBar
          value={result.overallConfidence}
          tone={presentation.modifier}
          label={APP_MESSAGES.result.confidenceLabel}
        />
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <p className={`${styles.metricValue} ${styles.detectedValue}`}>{verifiedCount}</p>
          <p className={styles.metricLabel}>
            {verifiedCount === 1
              ? APP_MESSAGES.admin.detectedCountLabelSingular
              : APP_MESSAGES.admin.detectedCountLabel}
          </p>
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.metric}>
          <p className={`${styles.metricValue} ${styles.missingValue}`}>{missingCount}</p>
          <p className={styles.metricLabel}>
            {missingCount === 1
              ? APP_MESSAGES.admin.missingCountLabelSingular
              : APP_MESSAGES.admin.missingCountLabel}
          </p>
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.metric}>
          <p className={`${styles.metricValue} ${styles.durationValue}`}>
            {formatDuration(result.durationMs)}
          </p>
          <p className={styles.metricLabel}>verificação</p>
        </div>
      </div>

      <div className={styles.footer}>
        <div>
          <p className={styles.footerLabel}>{APP_MESSAGES.result.accessTimeLabel}</p>
          <p className={styles.footerValue}>{formatAccessMoment(result.verifiedAt)}</p>
        </div>
        <Badge label={presentation.accessBadge} tone={presentation.modifier} />
      </div>
    </Card>
  );
};
