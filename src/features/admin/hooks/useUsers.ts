import { useCallback, useMemo, useState } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { normalizeError } from '@/services/errors';
import { createId } from '@/utils';

import type { UserFormValues } from '../schemas/userSchema';
import { usersRepository } from '../services/UsersRepository';
import type { AdminUser } from '../types';

export interface UseUsersResult {
  users: AdminUser[];
  filteredUsers: AdminUser[];
  search: string;
  setSearch: (value: string) => void;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
  createUser: (values: UserFormValues) => Promise<void>;
  updateUser: (id: string, values: UserFormValues) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
}

const loadUsers = () => usersRepository.getAll();

const matchesSearch = (user: AdminUser, term: string): boolean => {
  const normalized = term.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return [user.name, user.email, user.area, user.role].some((field) =>
    field.toLowerCase().includes(normalized),
  );
};

export const useUsers = (): UseUsersResult => {
  const {
    data: users,
    setData,
    loading,
    error,
    setError,
    reload,
  } = useAsyncResource<AdminUser[]>(loadUsers, []);

  const [search, setSearch] = useState('');

  const persist = useCallback(
    async (user: AdminUser) => {
      try {
        await usersRepository.save(user);
        setData((current) => {
          const exists = current.some((item) => item.id === user.id);
          return exists
            ? current.map((item) => (item.id === user.id ? user : item))
            : [user, ...current];
        });
      } catch (caught) {
        setError(normalizeError(caught, 'storage'));
      }
    },
    [setData, setError],
  );

  const createUser = useCallback(
    async (values: UserFormValues) => {
      await persist({ id: createId(), lastAccessAt: null, ...values });
    },
    [persist],
  );

  const updateUser = useCallback(
    async (id: string, values: UserFormValues) => {
      const existing = users.find((item) => item.id === id);
      await persist({ id, lastAccessAt: existing?.lastAccessAt ?? null, ...values });
    },
    [persist, users],
  );

  const removeUser = useCallback(
    async (id: string) => {
      try {
        await usersRepository.remove(id);
        setData((current) => current.filter((item) => item.id !== id));
      } catch (caught) {
        setError(normalizeError(caught, 'storage'));
      }
    },
    [setData, setError],
  );

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesSearch(user, search)),
    [users, search],
  );

  return {
    users,
    filteredUsers,
    search,
    setSearch,
    loading,
    error,
    reload,
    createUser,
    updateUser,
    removeUser,
  };
};
