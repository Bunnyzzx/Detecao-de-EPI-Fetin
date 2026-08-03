import { STORAGE_KEYS } from '@/constants/detection';
import { storageClient } from '@/services/storage/storageClient';

import { SEED_USERS } from '../mocks/seedUsers';
import { USER_ROLES, type AdminUser, type UsersRepository, type UserRole } from '../types';

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);

const isAdminUser = (value: unknown): value is AdminUser => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<AdminUser>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.area === 'string' &&
    isUserRole(candidate.role)
  );
};

/**
 * Cadastro local de operadores. Na primeira leitura, semeia a lista com os
 * usuários de exemplo do protótipo.
 */
export const usersRepository: UsersRepository = {
  async getAll() {
    const stored = await storageClient.readJson<unknown>(STORAGE_KEYS.users);

    if (!Array.isArray(stored)) {
      const seeded = [...SEED_USERS];
      await storageClient.writeJson(STORAGE_KEYS.users, seeded);
      return seeded;
    }

    return stored.filter(isAdminUser);
  },

  async save(user) {
    const all = await this.getAll();
    const exists = all.some((item) => item.id === user.id);
    const updated = exists
      ? all.map((item) => (item.id === user.id ? user : item))
      : [user, ...all];
    await storageClient.writeJson(STORAGE_KEYS.users, updated);
  },

  async remove(id) {
    const all = await this.getAll();
    await storageClient.writeJson(
      STORAGE_KEYS.users,
      all.filter((item) => item.id !== id),
    );
  },
};
