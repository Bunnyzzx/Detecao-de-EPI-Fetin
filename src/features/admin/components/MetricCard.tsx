import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui';

import styles from './MetricCard.module.css';

export type MetricTone = 'primary' | 'approved' | 'accent';

export interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: MetricTone;
}

export const MetricCard = ({ label, value, icon: Icon, tone = 'primary' }: MetricCardProps) => (
  <Card variant="outlined" className={clsx(styles.card, styles[tone])}>
    <span className={styles.iconWrapper}>
      <Icon size={20} aria-hidden="true" />
    </span>
    <p className={styles.value}>{value}</p>
    <p className={styles.label}>{label}</p>
  </Card>
);
