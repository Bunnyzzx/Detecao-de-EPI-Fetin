import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { adminAuthService } from '../services/adminAuthService';
import type { AdminCredentials } from '../types';

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  signingIn: boolean;
  signIn: (credentials: AdminCredentials) => Promise<boolean>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/**
 * Sessão administrativa mantida apenas em memória: ao fechar o app, é preciso
 * autenticar de novo. Nada de credenciais é persistido no aparelho.
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

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = (): AdminAuthContextValue => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth precisa estar dentro de AdminAuthProvider.');
  }
  return context;
};
