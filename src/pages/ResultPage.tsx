import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Info,
  ScanLine,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { InlineNotice, StateView } from '@/components/feedback';
import { TerminalShell } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiChecklist, ResultSummary } from '@/features/epi-verification/components';
import { verificationHistoryRepository } from '@/features/epi-verification/services';
import { getStatusPresentation, hasLowConfidence } from '@/features/epi-verification/utils';
import { useCountdown } from '@/hooks/useCountdown';
import { env } from '@/services/env';

import styles from './ResultPage.module.css';

export const ResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // O resultado vem do histórico, então a tela sobrevive a um recarregamento.
  const result = useMemo(() => (id ? verificationHistoryRepository.getById(id) : null), [id]);

  const goHome = useCallback(() => navigate('/', { replace: true }), [navigate]);
  const startNew = useCallback(() => navigate('/verificacao', { replace: true }), [navigate]);

  const remainingSeconds = useCountdown({
    seconds: env.terminalResetSeconds,
    active: Boolean(result),
    onFinish: goHome,
  });

  if (!result) {
    return (
      <TerminalShell step="access">
        <div className={styles.centered}>
          <StateView
            icon={AlertCircle}
            title={APP_MESSAGES.result.missingResultTitle}
            description={APP_MESSAGES.result.missingResultDescription}
            tone="warning"
            actions={[
              {
                label: APP_MESSAGES.result.newVerificationButton,
                onClick: startNew,
                icon: ScanLine,
              },
              {
                label: APP_MESSAGES.result.backHomeButton,
                onClick: goHome,
                variant: 'secondary',
              },
            ]}
          />
        </div>
      </TerminalShell>
    );
  }

  const presentation = getStatusPresentation(result.status);
  const HeroIcon = presentation.icon;
  const hasNoDetection = result.detectedItems.length === 0;
  const isLowConfidence = hasLowConfidence(result);

  return (
    <TerminalShell step="access">
      <div className={styles.layout}>
        <section className={`${styles.hero} ${styles[presentation.modifier]}`}>
          <span
            className={`${styles.heroDecoration} ${styles.heroDecorationBottom}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.heroDecoration} ${styles.heroDecorationTop}`}
            aria-hidden="true"
          />

          <span className={styles.heroIcon}>
            <HeroIcon size={72} strokeWidth={1.5} aria-hidden="true" />
          </span>

          <h1 className={styles.heroTitle}>{presentation.headline}</h1>
          <p className={styles.heroSubtitle}>{presentation.subtitle}</p>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelInner}>
            <ResultSummary result={result} />

            {hasNoDetection && (
              <Card variant="outlined">
                <StateView
                  icon={ShieldAlert}
                  title={APP_MESSAGES.result.noDetectionTitle}
                  description={APP_MESSAGES.result.noDetectionDescription}
                  tone="danger"
                  compact
                />
              </Card>
            )}

            {isLowConfidence && (
              <Card variant="outlined">
                <StateView
                  icon={AlertCircle}
                  title={APP_MESSAGES.result.lowConfidenceTitle}
                  description={APP_MESSAGES.result.lowConfidenceDescription}
                  tone="warning"
                  compact
                />
              </Card>
            )}

            {result.detectedItems.length > 0 && (
              <div>
                <h2 className={styles.sectionTitle}>
                  <CheckCircle2 size={18} color="var(--color-approved)" aria-hidden="true" />
                  {`${APP_MESSAGES.result.detectedSectionTitle} (${result.detectedItems.length})`}
                </h2>
                <EpiChecklist items={result.detectedItems} />
              </div>
            )}

            {result.missingItems.length > 0 && (
              <div>
                <h2 className={styles.sectionTitle}>
                  <XCircle size={18} color="var(--color-rejected)" aria-hidden="true" />
                  {`${APP_MESSAGES.result.missingSectionTitle} (${result.missingItems.length})`}
                </h2>
                <EpiChecklist items={result.missingItems} />
              </div>
            )}

            <InlineNotice message={APP_MESSAGES.result.disclaimer} icon={Info} />

            <div className={styles.actions}>
              {result.status === 'approved' && (
                <Button
                  label={APP_MESSAGES.result.continueButton}
                  icon={ArrowRight}
                  iconPosition="right"
                  variant="success"
                  size="large"
                  fullWidth
                  onClick={goHome}
                />
              )}

              <Button
                label={APP_MESSAGES.result.newVerificationButton}
                icon={ScanLine}
                variant={result.status === 'approved' ? 'secondary' : 'primary'}
                size={result.status === 'approved' ? 'medium' : 'large'}
                fullWidth
                onClick={startNew}
              />

              <Button
                label={APP_MESSAGES.result.backHomeButton}
                variant="ghost"
                fullWidth
                onClick={goHome}
              />

              <p className={styles.countdown} aria-live="off">
                {`${APP_MESSAGES.result.autoResetPrefix} ${remainingSeconds}${APP_MESSAGES.result.autoResetSuffix}`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </TerminalShell>
  );
};
