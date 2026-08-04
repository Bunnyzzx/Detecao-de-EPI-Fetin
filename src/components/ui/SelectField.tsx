import clsx from 'clsx';
import { useId, type Ref, type SelectHTMLAttributes } from 'react';

import styles from './SelectField.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  errorMessage?: string;
  ref?: Ref<HTMLSelectElement>;
}

export const SelectField = ({
  label,
  options,
  errorMessage,
  className,
  ref,
  ...rest
}: SelectFieldProps) => {
  const generatedId = useId();
  const selectId = rest.id ?? generatedId;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(errorMessage);

  return (
    <div className={clsx(styles.field, className)}>
      <label className={styles.label} htmlFor={selectId}>
        {label}
      </label>

      <select
        {...rest}
        id={selectId}
        ref={ref}
        className={clsx(styles.select, hasError && styles.hasError)}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hasError && (
        <span id={errorId} role="alert" className={styles.error}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};
