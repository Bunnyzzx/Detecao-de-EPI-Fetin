import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { ErrorState, StateView } from '@/components/feedback';
import { TerminalShell } from '@/components/layout';
import { Button, ProgressBar } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiChecklist, ScanViewport } from '@/features/epi-verification/components';
import { useRequiredEpis, useVerification } from '@/features/epi-verification/hooks';

import styles from './ScanPage.module.css';

export const ScanPage = () => {
  const navigate = useNavigate();
  const { requiredEpis } = useRequiredEpis();
  const { state, progress, items, currentItem, error, start, cancel } =
    useVerification(requiredEpis);

  const runVerification = useCallback(async () => {
    const result = await start();
    if (result) {
      navigate(`/resultado/${result.id}`, { replace: true });
    }
  }, [navigate, start]);

  // A verificação começa sozinha ao entrar na tela, como no protótipo, e é
  // interrompida se a pessoa sair antes do fim.
  useEffect(() => {
    if (requiredEpis.length === 0) {
      return;
    }

    void runVerification();
    return cancel;
  }, [cancel, requiredEpis.length, runVerification]);

  const goHome = useCallback(() => {
    cancel();
    navigate('/', { replace: true });
  }, [cancel, navigate]);

  const retry = useCallback(() => {
    void runVerification();
  }, [runVerification]);

  const isRunning = state === 'running';
  const finished = state === 'success' || state === 'error';
  const allDetected = items.length > 0 && items.every((item) => item.detected);

  return (
    <TerminalShell step="verification" onDark>
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.topBar}>
            <Button
              label={APP_MESSAGES.scan.back}
              icon={ChevronLeft}
              variant="dark"
              onClick={goHome}
            />

            <div className={styles.progressWrapper}>
              <ProgressBar value={progress} tone="scanner" onDark label={APP_MESSAGES.scan.title} />
              <span className={styles.progressValue}>{Math.round(progress * 100)}%</span>
            </div>
          </div>

          {state === 'error' ? (
            <div className={styles.centered}>
              <ErrorState error={error} onRetry={retry} onDark />
            </div>
          ) : state === 'cancelled' ? (
            <div className={styles.centered}>
              <StateView
                icon={RefreshCw}
                title={APP_MESSAGES.scan.cancelled}
                description={APP_MESSAGES.scan.cancelledDescription}
                tone="warning"
                onDark
                actions={[
                  { label: APP_MESSAGES.scan.retryButton, onClick: retry, icon: RefreshCw },
                  {
                    label: APP_MESSAGES.result.backHomeButton,
                    onClick: goHome,
                    variant: 'secondary',
                  },
                ]}
              />
            </div>
          ) : (
            <ScanViewport
              items={items}
              currentItem={currentItem}
              scanning={isRunning}
              finished={finished}
              allDetected={allDetected && finished}
            />
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <p className={styles.sidebarTitle}>{APP_MESSAGES.scan.checklistTitle}</p>
          </div>
          <div className={styles.sidebarBody}>
            <EpiChecklist items={items} currentItem={currentItem} finished={finished} onDark />
          </div>
        </aside>
      </div>
    </TerminalShell>
  );
};
