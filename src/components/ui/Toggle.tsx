import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Interruptor com a aparência do protótipo, acessível como `switch`. */
export const Toggle = ({ checked, onChange, label, disabled = false }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className={styles.toggle}
    onClick={() => onChange(!checked)}
  >
    <span className={styles.thumb} />
  </button>
);
