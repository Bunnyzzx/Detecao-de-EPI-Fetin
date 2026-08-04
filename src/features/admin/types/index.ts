export const USER_ROLES = ['Operador', 'Técnico', 'Supervisor', 'Administrador'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = 'active' | 'inactive';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: string;
  status: UserStatus;
  /** ISO 8601 ou `null` quando o operador nunca acessou. */
  lastAccessAt: string | null;
}

export interface UsersRepository {
  getAll(): AdminUser[];
  save(user: AdminUser): void;
  remove(id: string): void;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
