import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Check, Mail, User, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { Button, SelectField, TextField } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';

import { userFormSchema, type UserFormValues } from '../schemas/userSchema';
import { USER_ROLES, type AdminUser } from '../types';

import styles from './UserFormDialog.module.css';

export interface UserFormDialogProps {
  open: boolean;
  /** Quando informado, o formulário está em modo de edição. */
  user: AdminUser | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

const EMPTY_VALUES: UserFormValues = {
  name: '',
  email: '',
  role: 'Operador',
  area: '',
  status: 'active',
};

const ROLE_OPTIONS = USER_ROLES.map((role) => ({ value: role, label: role }));

const STATUS_OPTIONS = [
  { value: 'active', label: APP_MESSAGES.admin.userActive },
  { value: 'inactive', label: APP_MESSAGES.admin.userInactive },
];

export const UserFormDialog = ({ open, user, onClose, onSubmit }: UserFormDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  // O `<dialog>` nativo dá foco preso e fechamento por Esc de graça.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      reset(user ?? EMPTY_VALUES);
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, reset, user]);

  const submit = handleSubmit((values) => {
    onSubmit(values);
    onClose();
  });

  return (
    <dialog ref={dialogRef} className={styles.dialog} onCancel={onClose} onClose={onClose}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {user ? APP_MESSAGES.admin.editUserTitle : APP_MESSAGES.admin.newUserTitle}
            </h2>
            <p className={styles.description}>
              {user
                ? APP_MESSAGES.admin.editUserDescription
                : APP_MESSAGES.admin.newUserDescription}
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            aria-label={APP_MESSAGES.common.close}
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form className={styles.form} onSubmit={submit} noValidate>
          <TextField
            label={`${APP_MESSAGES.admin.nameLabel} *`}
            placeholder={APP_MESSAGES.admin.namePlaceholder}
            icon={User}
            {...register('name')}
            {...(errors.name?.message ? { errorMessage: errors.name.message } : {})}
          />

          <TextField
            label={`${APP_MESSAGES.admin.emailLabel} *`}
            placeholder={APP_MESSAGES.admin.emailPlaceholder}
            type="email"
            icon={Mail}
            {...register('email')}
            {...(errors.email?.message ? { errorMessage: errors.email.message } : {})}
          />

          <TextField
            label={`${APP_MESSAGES.admin.areaLabel} *`}
            placeholder={APP_MESSAGES.admin.areaPlaceholder}
            icon={Building2}
            {...register('area')}
            {...(errors.area?.message ? { errorMessage: errors.area.message } : {})}
          />

          <SelectField
            label={APP_MESSAGES.admin.roleLabel}
            options={ROLE_OPTIONS}
            {...register('role')}
            {...(errors.role?.message ? { errorMessage: errors.role.message } : {})}
          />

          <SelectField
            label={APP_MESSAGES.admin.statusLabel}
            options={STATUS_OPTIONS}
            {...register('status')}
          />

          <div className={styles.actions}>
            <Button label={APP_MESSAGES.admin.cancelButton} variant="ghost" onClick={onClose} />
            <Button
              label={user ? APP_MESSAGES.admin.saveButton : APP_MESSAGES.admin.createButton}
              icon={Check}
              type="submit"
            />
          </div>
        </form>
      </div>
    </dialog>
  );
};
