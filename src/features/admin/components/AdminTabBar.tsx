import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import type { MaterialCommunityIconName } from '@/features/epi-detection/types';
import { colors, radii, spacing, MIN_TOUCH_TARGET } from '@/theme';

export type AdminSection = 'dashboard' | 'users' | 'epis';

const SECTIONS: { key: AdminSection; label: string; icon: MaterialCommunityIconName }[] = [
  { key: 'dashboard', label: APP_MESSAGES.admin.dashboardTitle, icon: 'view-dashboard-outline' },
  { key: 'users', label: APP_MESSAGES.admin.usersTitle, icon: 'account-group-outline' },
  { key: 'epis', label: APP_MESSAGES.admin.episTitle, icon: 'shield-check' },
];

export interface AdminTabBarProps {
  current: AdminSection;
  onChange: (section: AdminSection) => void;
}

/** Barra inferior que substitui a barra lateral do painel no protótipo. */
export const AdminTabBar = ({ current, onChange }: AdminTabBarProps) => (
  <View style={styles.container}>
    {SECTIONS.map((section) => {
      const isActive = section.key === current;
      const color = isActive ? colors.primary : colors.slate[400];

      return (
        <Pressable
          key={section.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={section.label}
          onPress={() => onChange(section.key)}
          style={({ pressed }) => [styles.tab, pressed ? styles.pressed : null]}
        >
          <View style={[styles.iconWrapper, isActive ? styles.iconWrapperActive : null]}>
            <MaterialCommunityIcons name={section.icon} size={20} color={color} />
          </View>
          <Text variant="micro" color={color}>
            {section.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    minHeight: MIN_TOUCH_TARGET,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  iconWrapperActive: {
    backgroundColor: colors.primarySoft,
  },
});
