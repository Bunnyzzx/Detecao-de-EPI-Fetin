import clsx from 'clsx';
import type { ReactNode } from 'react';

import { StepIndicator, type FlowStep } from './StepIndicator';
import { TerminalStatusBar } from './TerminalStatusBar';
import styles from './TerminalShell.module.css';

export interface TerminalShellProps {
  children: ReactNode;
  /** Omitir esconde o rodapé de etapas (usado no painel administrativo). */
  step?: FlowStep;
  onDark?: boolean;
  showStatusBar?: boolean;
}

/**
 * Moldura fixa do terminal: faixa de status no topo, conteúdo rolável no meio
 * e indicador de etapas embaixo. Mantém a altura da janela sem rolagem geral.
 */
export const TerminalShell = ({
  children,
  step,
  onDark = false,
  showStatusBar = true,
}: TerminalShellProps) => (
  <div className={clsx(styles.shell, onDark && styles.onDark)}>
    {showStatusBar && <TerminalStatusBar onDark={onDark} />}
    <main className={styles.body}>{children}</main>
    {step && <StepIndicator currentStep={step} onDark={onDark} />}
  </div>
);
