import clsx from 'clsx';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'dark';
export type ButtonSize = 'medium' | 'large';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  /** Conteúdo extra à direita do rótulo, como uma contagem regressiva. */
  trailing?: ReactNode;
}

export const Button = ({
  label,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  trailing,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) => {
  const isBlocked = Boolean(disabled) || loading;
  const iconSize = size === 'large' ? 22 : 18;

  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        size === 'large' && styles.large,
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={isBlocked}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <LoaderCircle size={iconSize} className={styles.spinner} aria-hidden="true" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={iconSize} aria-hidden="true" />
      )}
      <span>{label}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={iconSize} aria-hidden="true" />}
      {trailing}
    </button>
  );
};
