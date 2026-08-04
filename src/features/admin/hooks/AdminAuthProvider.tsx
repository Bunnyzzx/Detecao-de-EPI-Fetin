import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { adminAuthService } from '../services/adminAuthService';
import type { AdminCredentials } from '../types';

import { AdminAuthContext, type AdminAuthContextValue } from './adminAuthContext';

/**
 * Sessão administrativa mantida apenas em memória: ao recarregar o terminal, é
 * preciso autenticar de novo. Nada de credenciais é persistido.
 */
export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const signIn = useCallback(async (credentials: AdminCredentials): Promise<boolean> => {
    setSigningIn(true);
    try {
      const granted = await adminAuthService.signIn(credentials);
      setIsAuthenticated(granted);
      return granted;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(() => setIsAuthenticated(false), []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({ isAuthenticated, signingIn, signIn, signOut }),
    [isAuthenticated, signingIn, signIn, signOut],
  );

  return <AdminAuthContext value={value}>{children}</AdminAuthContext>;
};
