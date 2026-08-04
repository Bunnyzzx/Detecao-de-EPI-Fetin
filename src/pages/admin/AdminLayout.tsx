import clsx from 'clsx';
import { ChevronLeft, History, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router';

import { Button } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useAdminAuth } from '@/features/admin/hooks/adminAuthContext';

import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/painel', label: APP_MESSAGES.admin.dashboardTitle, icon: LayoutDashboard },
  { to: '/admin/painel/usuarios', label: APP_MESSAGES.admin.usersTitle, icon: Users },
  { to: '/admin/painel/epis', label: APP_MESSAGES.admin.episTitle, icon: ShieldCheck },
  { to: '/admin/painel/historico', label: APP_MESSAGES.admin.historyTitle, icon: History },
];

/** Casca do painel: barra lateral de navegação e área de conteúdo. */
export const AdminLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAdminAuth();

  // Impede acesso direto ao painel sem uma sessão administrativa ativa.
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSignOut = () => {
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.brand}>
            <ShieldCheck size={20} aria-hidden="true" />
            {APP_MESSAGES.admin.brand}
          </p>
          <p className={styles.brandSubtitle}>{APP_MESSAGES.admin.panelTitle}</p>
        </div>

        <nav className={styles.nav} aria-label={APP_MESSAGES.admin.panelTitle}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin/painel'}
              className={({ isActive }) => clsx(styles.navLink, isActive && styles.navLinkActive)}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footerActions}>
          <Button
            label={APP_MESSAGES.admin.backToTerminal}
            icon={ChevronLeft}
            variant="dark"
            fullWidth
            onClick={() => navigate('/')}
          />
          <Button
            label={APP_MESSAGES.admin.logout}
            icon={LogOut}
            variant="dark"
            fullWidth
            onClick={handleSignOut}
          />
        </div>
      </aside>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
