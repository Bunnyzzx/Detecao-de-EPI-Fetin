import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ChevronLeft, Lock, LogIn, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { Button, Card, TextField } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useAdminAuth } from '@/features/admin/hooks/adminAuthContext';
import { adminLoginSchema, type AdminLoginValues } from '@/features/admin/schemas/loginSchema';

import styles from './AdminLoginPage.module.css';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signingIn } = useAdminAuth();
  const [authFailed, setAuthFailed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAuthFailed(false);
    const granted = await signIn(values);

    if (granted) {
      navigate('/admin/painel', { replace: true });
      return;
    }

    setAuthFailed(true);
  });

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <span className={styles.emblem}>
          <ShieldCheck size={28} aria-hidden="true" />
        </span>

        <h1 className={styles.title}>{APP_MESSAGES.admin.loginTitle}</h1>
        <p className={styles.description}>{APP_MESSAGES.admin.loginDescription}</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <TextField
            label={APP_MESSAGES.admin.usernameLabel}
            icon={User}
            autoComplete="username"
            autoFocus
            {...register('username')}
            {...(errors.username?.message ? { errorMessage: errors.username.message } : {})}
          />

          <TextField
            label={APP_MESSAGES.admin.passwordLabel}
            type="password"
            icon={Lock}
            autoComplete="current-password"
            {...register('password')}
            {...(errors.password?.message ? { errorMessage: errors.password.message } : {})}
          />

          {authFailed && (
            <p className={styles.errorBanner} role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              {APP_MESSAGES.admin.invalidCredentials}
            </p>
          )}

          <Button
            label={APP_MESSAGES.admin.submitButton}
            icon={LogIn}
            type="submit"
            loading={signingIn}
            fullWidth
          />

          <Button
            label={APP_MESSAGES.admin.backToTerminal}
            icon={ChevronLeft}
            variant="ghost"
            fullWidth
            onClick={() => navigate('/')}
          />
        </form>

        <p className={styles.hint}>{APP_MESSAGES.admin.demoHint}</p>
      </Card>
    </div>
  );
};
