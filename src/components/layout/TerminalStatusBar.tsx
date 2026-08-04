import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';

import { APP_MESSAGES } from '@/constants/messages';
import { useClock } from '@/hooks/useClock';
import { formatClock } from '@/utils';

import styles from './TerminalStatusBar.module.css';

export interface TerminalStatusBarProps {
  onDark?: boolean;
  connected?: boolean;
}

/**
 * Faixa superior do protótipo com identificação do terminal, estado de conexão,
 * hora e data. Em telas estreitas a data é omitida para não truncar o texto.
 */
export const TerminalStatusBar = ({ onDark = false, connected = true }: TerminalStatusBarProps) => {
  const now = useClock();

  return (
    <header className={clsx(styles.bar, onDark && styles.onDark)}>
      <div className={styles.identity}>
        <ShieldCheck size={16} className={styles.brandIcon} aria-hidden="true" />
        <span className={styles.terminalLabel}>{APP_MESSAGES.system.terminalLabel}</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.connection}>
          <span className={styles.dot} aria-hidden="true" />
          {connected ? APP_MESSAGES.system.connected : APP_MESSAGES.system.disconnected}
        </span>
        <time className={styles.clock} dateTime={now.toISOString()}>
          {formatClock(now)}
        </time>
        <span className={styles.date}>
          {now.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </header>
  );
};
