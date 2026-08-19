import { act, fireEvent, render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import type { TestInstance } from 'test-renderer';

import { VerificationSessionProvider } from '@/features/verification-session/hooks/VerificationSessionContext';

/**
 * Renderiza telas dentro do provider da sessão, que é o que mantém o
 * funcionário identificado vivo entre as telas do fluxo.
 *
 * `showScreen` troca a tela visível preservando a sessão — equivalente a
 * navegar no aplicativo, onde a tela anterior é desmontada mas o provider
 * continua de pé no layout raiz.
 */
export const renderScreen = async (ui: ReactNode) => {
  const view = await render(<VerificationSessionProvider>{ui}</VerificationSessionProvider>);

  const showScreen = async (next: ReactElement) =>
    view.rerender(<VerificationSessionProvider>{next}</VerificationSessionProvider>);

  return { ...view, showScreen };
};

/**
 * Toca em um elemento e deixa assentar o trabalho assíncrono que ele dispara.
 *
 * As ações do terminal chamam serviços que resolvem depois; sem o `act` as
 * atualizações resultantes chegam fora do ciclo de renderização e o React
 * reclama, escondendo erros reais no meio dos avisos.
 */
export const pressAndSettle = async (element: TestInstance) => {
  await act(async () => {
    fireEvent.press(element);
  });
};
