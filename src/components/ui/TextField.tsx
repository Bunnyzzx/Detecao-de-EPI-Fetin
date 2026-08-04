import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { useId, type InputHTMLAttributes, type Ref } from 'react';

import styles from './TextField.module.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  icon?: LucideIcon;
  ref?: Ref<HTMLInputElement>;
  /** Esconde o rótulo visualmente, mantendo-o para leitores de tela. */
  hideLabel?: boolean;
}

export const TextField = ({
  label,
  errorMessage,
  icon: Icon,
  hideLabel = false,
  className,
  ref,
  ...rest
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = rest.id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(errorMessage);

  return (
    <div className={clsx(styles.field, className)}>
      <label className={clsx(styles.label, hideLabel && 'visually-hidden')} htmlFor={inputId}>
        {label}
      </label>

      <div className={clsx(styles.control, hasError && styles.hasError)}>
        {Icon && <Icon size={18} className={styles.icon} aria-hidden="true" />}
        <input
          {...rest}
          id={inputId}
          ref={ref}
          className={styles.input}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />
      </div>

      {hasError && (
        <span id={errorId} role="alert" className={styles.error}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};
