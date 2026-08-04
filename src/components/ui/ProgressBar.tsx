import clsx from 'clsx';

import { clampUnit, formatConfidence } from '@/utils';

import styles from './ProgressBar.module.css';

export type ProgressTone = 'primary' | 'scanner' | 'approved' | 'warning' | 'rejected';

export interface ProgressBarProps {
  /** Valor entre 0 e 1. */
  value: number;
  tone?: ProgressTone;
  height?: number;
  onDark?: boolean;
  label: string;
  className?: string;
}

export const ProgressBar = ({
  value,
  tone = 'primary',
  height = 8,
  onDark = false,
  label,
  className,
}: ProgressBarProps) => {
  const normalized = clampUnit(value);
  const percent = Math.round(normalized * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={formatConfidence(normalized)}
      className={clsx(styles.track, onDark && styles.onDark, className)}
      style={{ height }}
    >
      <div className={clsx(styles.fill, styles[tone])} style={{ width: `${percent}%` }} />
    </div>
  );
};
