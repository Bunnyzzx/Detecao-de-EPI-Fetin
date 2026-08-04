import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'approved' | 'warning' | 'rejected' | 'onDark';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: LucideIcon;
  /** Ponto colorido antes do texto, como nos selos do protótipo. */
  withDot?: boolean;
  uppercase?: boolean;
  className?: string;
}

export const Badge = ({
  label,
  tone = 'info',
  icon: Icon,
  withDot = false,
  uppercase = false,
  className,
}: BadgeProps) => (
  <span className={clsx(styles.badge, styles[tone], uppercase && styles.uppercase, className)}>
    {withDot && <span className={styles.dot} aria-hidden="true" />}
    {Icon && <Icon size={14} aria-hidden="true" />}
    {label}
  </span>
);
