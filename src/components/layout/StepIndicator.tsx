import clsx from 'clsx';
import { Check } from 'lucide-react';
import { Fragment } from 'react';

import { APP_MESSAGES } from '@/constants/messages';

import styles from './StepIndicator.module.css';

export type FlowStep = 'start' | 'verification' | 'access';

const STEPS: { key: FlowStep; label: string }[] = [
  { key: 'start', label: APP_MESSAGES.steps.start },
  { key: 'verification', label: APP_MESSAGES.steps.verification },
  { key: 'access', label: APP_MESSAGES.steps.access },
];

export interface StepIndicatorProps {
  currentStep: FlowStep;
  onDark?: boolean;
}

/** Rodapé "1 Início · 2 Verificação · 3 Acesso" do protótipo. */
export const StepIndicator = ({ currentStep, onDark = false }: StepIndicatorProps) => {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep);

  return (
    <nav
      className={clsx(styles.steps, onDark && styles.onDark)}
      aria-label={`Etapa ${currentIndex + 1} de ${STEPS.length}`}
    >
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <Fragment key={step.key}>
            <span
              className={clsx(styles.step, isActive && styles.active)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={clsx(
                  styles.marker,
                  isActive && styles.activeMarker,
                  isDone && styles.doneMarker,
                )}
              >
                {isDone ? <Check size={12} aria-hidden="true" /> : index + 1}
              </span>
              {step.label}
            </span>

            {index < STEPS.length - 1 && (
              <span
                className={clsx(styles.connector, isDone && styles.doneConnector)}
                aria-hidden="true"
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
};
