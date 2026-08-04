import { FlaskConical, HardHat, ScanLine, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';

import { EmptyState, InlineNotice } from '@/components/feedback';
import { TerminalShell } from '@/components/layout';
import { Badge, Button } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiGrid } from '@/features/epi-verification/components';
import { useRequiredEpis } from '@/features/epi-verification/hooks';
import { isApiConfigured } from '@/services/env';

import styles from './HomePage.module.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const { requiredEpis } = useRequiredEpis();
  const hasActiveEpis = requiredEpis.length > 0;

  return (
    <TerminalShell step="start">
      <div className={styles.layout}>
        <section className={styles.hero}>
          <span
            className={`${styles.heroDecoration} ${styles.heroDecorationBottom}`}
            aria-hidden="true"
          />
          <span
            className={`${styles.heroDecoration} ${styles.heroDecorationTop}`}
            aria-hidden="true"
          />

          <div className={styles.heroTopRow}>
            <Badge label={APP_MESSAGES.home.restrictedBadge} tone="onDark" withDot uppercase />
            <Button
              label={APP_MESSAGES.home.adminButton}
              icon={ShieldCheck}
              variant="dark"
              onClick={() => navigate('/admin')}
            />
          </div>

          <span className={styles.emblem}>
            <HardHat size={52} aria-hidden="true" />
          </span>

          <h1 className={styles.heroTitle}>{APP_MESSAGES.home.title}</h1>
          <p className={styles.heroSubtitle}>{APP_MESSAGES.home.subtitle}</p>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelInner}>
            <div>
              <h2 className={styles.readyTitle}>{APP_MESSAGES.home.readyTitle}</h2>
              <p className={styles.readyDescription}>{APP_MESSAGES.home.readyDescription}</p>
            </div>

            <EpiGrid activeIds={requiredEpis} />

            {hasActiveEpis ? (
              <div className={styles.actions}>
                <Button
                  label={APP_MESSAGES.home.startButton}
                  icon={ScanLine}
                  size="large"
                  fullWidth
                  onClick={() => navigate('/verificacao')}
                />
                <p className={styles.startHint}>{APP_MESSAGES.home.startHint}</p>

                {!isApiConfigured() && (
                  <InlineNotice
                    message={APP_MESSAGES.home.simulationNotice}
                    icon={FlaskConical}
                    tone="warning"
                  />
                )}
              </div>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title={APP_MESSAGES.home.noEquipmentTitle}
                description={APP_MESSAGES.home.noEquipmentDescription}
                action={{
                  label: APP_MESSAGES.home.adminButton,
                  onClick: () => navigate('/admin'),
                  icon: ShieldCheck,
                }}
                compact
              />
            )}
          </div>
        </section>
      </div>
    </TerminalShell>
  );
};
