import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

import { Button, type ButtonVariant } from '@/components/ui';

import styles from './StateView.module.css';

export type StateTone = 'neutral' | 'info' | 'warning' | 'danger';

export interface StateAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
}

export interface StateViewProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: StateTone;
  /** Ajusta o contraste do texto quando o estado aparece sobre fundo escuro. */
  onDark?: boolean;
  actions?: StateAction[];
  compact?: boolean;
  className?: string;
}

/**
 * Bloco visual único para estados vazios, de erro e de indisponibilidade —
 * evita repetir a mesma composição em cada tela.
 */
export const StateView = ({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  onDark = false,
  actions = [],
  compact = false,
  className,
}: StateViewProps) => (
  <div
    className={clsx(
      styles.state,
      styles[tone],
      compact && styles.compact,
      onDark && styles.onDark,
      className,
    )}
  >
    <div className={styles.iconWrapper}>
      <Icon size={compact ? 26 : 34} aria-hidden="true" />
    </div>

    <div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
    </div>

    {actions.length > 0 && (
      <div className={styles.actions}>
        {actions.map((action) => (
          <Button
            key={action.label}
            label={action.label}
            onClick={action.onClick}
            variant={action.variant ?? 'primary'}
            {...(action.icon ? { icon: action.icon } : {})}
          />
        ))}
      </div>
    )}
  </div>
);
