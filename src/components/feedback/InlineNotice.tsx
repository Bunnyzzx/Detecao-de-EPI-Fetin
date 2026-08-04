import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import styles from './InlineNotice.module.css';

export type InlineNoticeTone = 'neutral' | 'info' | 'warning';

export interface InlineNoticeProps {
  message: string;
  icon: LucideIcon;
  tone?: InlineNoticeTone;
  className?: string;
}

/** Aviso discreto em linha, para ressalvas e observações permanentes. */
export const InlineNotice = ({
  message,
  icon: Icon,
  tone = 'neutral',
  className,
}: InlineNoticeProps) => (
  <p className={clsx(styles.notice, styles[tone], className)}>
    <Icon size={18} className={styles.icon} aria-hidden="true" />
    <span>{message}</span>
  </p>
);
