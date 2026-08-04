import { Plus, Search, Users } from 'lucide-react';
import { useCallback, useState } from 'react';

import { EmptyState } from '@/components/feedback';
import { Button, Card, TextField } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { UserFormDialog, UserTable } from '@/features/admin/components';
import { useUsers } from '@/features/admin/hooks/useUsers';
import type { UserFormValues } from '@/features/admin/schemas/userSchema';
import type { AdminUser } from '@/features/admin/types';

import styles from './adminPage.module.css';

export const UsersPage = () => {
  const { filteredUsers, search, setSearch, createUser, updateUser, removeUser } = useUsers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const openCreate = useCallback(() => {
    setEditingUser(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (values: UserFormValues) => {
      if (editingUser) {
        updateUser(editingUser.id, values);
        return;
      }
      createUser(values);
    },
    [createUser, editingUser, updateUser],
  );

  const confirmRemove = useCallback(
    (user: AdminUser) => {
      if (window.confirm(`${user.name} — ${APP_MESSAGES.admin.removeUserConfirm}`)) {
        removeUser(user.id);
      }
    },
    [removeUser],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{APP_MESSAGES.admin.usersTitle}</h1>
          <p className={styles.subtitle}>{APP_MESSAGES.admin.usersSubtitle}</p>
        </div>
        <Button label={APP_MESSAGES.admin.newUserButton} icon={Plus} onClick={openCreate} />
      </header>

      <div className={styles.toolbar}>
        <TextField
          className={styles.searchField}
          label={APP_MESSAGES.admin.searchLabel}
          placeholder={APP_MESSAGES.admin.searchPlaceholder}
          icon={Search}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Card padded={false}>
        {filteredUsers.length === 0 ? (
          <EmptyState icon={Users} title={APP_MESSAGES.admin.usersEmpty} compact />
        ) : (
          <UserTable users={filteredUsers} onEdit={openEdit} onRemove={confirmRemove} />
        )}
      </Card>

      <UserFormDialog
        open={dialogOpen}
        user={editingUser}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
