import { createContext, use } from 'react';

import type { AdminCredentials } from '../types';

export interface AdminAuthContextValue {
  isAuthenticated: boolean;
  signingIn: boolean;
  signIn: (credentials: AdminCredentials) => Promise<boolean>;
  signOut: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const useAdminAuth = (): AdminAuthContextValue => {
  const context = use(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth precisa estar dentro de AdminAuthProvider.');
  }
  return context;
};
