import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { formatDateTime } from '@/utils';

import type { AdminUser } from '../types';

import styles from './UserTable.module.css';

export interface UserTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onRemove: (user: AdminUser) => void;
}

export const UserTable = ({ users, onEdit, onRemove }: UserTableProps) => (
  <div className={styles.scroller}>
    <table className={styles.table}>
      <caption className="visually-hidden">{APP_MESSAGES.admin.usersSubtitle}</caption>
      <thead>
        <tr>
          <th scope="col">{APP_MESSAGES.admin.nameLabel}</th>
          <th scope="col">{APP_MESSAGES.admin.roleLabel}</th>
          <th scope="col">{APP_MESSAGES.admin.areaLabel}</th>
          <th scope="col">{APP_MESSAGES.admin.lastAccessLabel}</th>
          <th scope="col">{APP_MESSAGES.admin.statusLabel}</th>
          <th scope="col">
            <span className="visually-hidden">Ações</span>
          </th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <div className={styles.name}>{user.name}</div>
              <div className={styles.email}>{user.email}</div>
            </td>
            <td>{user.role}</td>
            <td>{user.area}</td>
            <td>
              {user.lastAccessAt
                ? formatDateTime(user.lastAccessAt)
                : APP_MESSAGES.admin.neverAccessed}
            </td>
            <td>
              <Badge
                label={
                  user.status === 'active'
                    ? APP_MESSAGES.admin.userActive
                    : APP_MESSAGES.admin.userInactive
                }
                tone={user.status === 'active' ? 'approved' : 'neutral'}
                withDot
              />
            </td>
            <td>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={`${APP_MESSAGES.common.edit} ${user.name}`}
                  onClick={() => onEdit(user)}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.removeButton}`}
                  aria-label={`${APP_MESSAGES.common.remove} ${user.name}`}
                  onClick={() => onRemove(user)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
