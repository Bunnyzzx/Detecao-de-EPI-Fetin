import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader, TerminalStatusBar } from '@/components/layout';
import { IconButton } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { AdminTabBar, type AdminSection } from '@/features/admin/components/AdminTabBar';
import { DashboardSection, EpisSection, UsersSection } from '@/features/admin/components/sections';
import { useAdminAuth } from '@/features/admin/hooks/AdminAuthContext';
import { colors } from '@/theme';

const SECTION_TITLES: Record<AdminSection, string> = {
  dashboard: APP_MESSAGES.admin.dashboardTitle,
  users: APP_MESSAGES.admin.usersTitle,
  epis: APP_MESSAGES.admin.episTitle,
};

export default function AdminPanelScreen() {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAdminAuth();
  const [section, setSection] = useState<AdminSection>('dashboard');

  // Impede o acesso direto ao painel sem uma sessão administrativa ativa.
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSignOut = useCallback(() => {
    signOut();
    router.replace('/');
  }, [router, signOut]);

  if (!isAuthenticated) {
    return <Screen backgroundColor={colors.slate[50]} />;
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <TerminalStatusBar />
      <ScreenHeader
        title={APP_MESSAGES.admin.panelTitle}
        subtitle={SECTION_TITLES[section]}
        trailing={
          <IconButton
            icon="logout"
            accessibilityLabel={APP_MESSAGES.admin.logout}
            onPress={handleSignOut}
            backgroundColor={colors.slate[100]}
          />
        }
      />

      <View style={styles.body}>
        {section === 'dashboard' ? <DashboardSection /> : null}
        {section === 'users' ? <UsersSection /> : null}
        {section === 'epis' ? <EpisSection /> : null}
      </View>

      <AdminTabBar current={section} onChange={setSection} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});
