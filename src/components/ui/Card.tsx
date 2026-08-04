import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Card.module.css';

export type CardVariant = 'elevated' | 'outlined' | 'muted' | 'dark';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padded?: boolean;
}

export const Card = ({
  children,
  variant = 'elevated',
  padded = true,
  className,
  ...rest
}: CardProps) => (
  <div className={clsx(styles.card, styles[variant], !padded && styles.flush, className)} {...rest}>
    {children}
  </div>
);
