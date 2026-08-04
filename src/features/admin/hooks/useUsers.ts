import { useCallback, useMemo, useState } from 'react';

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
  error: unknown;
  createUser: (values: UserFormValues) => void;
  updateUser: (id: string, values: UserFormValues) => void;
  removeUser: (id: string) => void;
}

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
  const [users, setUsers] = useState<AdminUser[]>(() => usersRepository.getAll());
  const [search, setSearch] = useState('');
  const [error, setError] = useState<unknown>(null);

  const run = useCallback((action: () => void) => {
    try {
      action();
      setUsers(usersRepository.getAll());
    } catch (caught) {
      setError(normalizeError(caught, 'storage'));
    }
  }, []);

  const createUser = useCallback(
    (values: UserFormValues) => {
      run(() => usersRepository.save({ id: createId(), lastAccessAt: null, ...values }));
    },
    [run],
  );

  const updateUser = useCallback(
    (id: string, values: UserFormValues) => {
      const existing = users.find((item) => item.id === id);
      run(() =>
        usersRepository.save({ id, lastAccessAt: existing?.lastAccessAt ?? null, ...values }),
      );
    },
    [run, users],
  );

  const removeUser = useCallback((id: string) => run(() => usersRepository.remove(id)), [run]);

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesSearch(user, search)),
    [users, search],
  );

  return { users, filteredUsers, search, setSearch, error, createUser, updateUser, removeUser };
};
