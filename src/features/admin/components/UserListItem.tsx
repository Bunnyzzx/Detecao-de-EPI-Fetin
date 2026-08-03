import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, IconButton, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, radii, spacing } from '@/theme';
import { formatDateTime } from '@/utils';

import type { AdminUser } from '../types';

export interface UserListItemProps {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onRemove: (user: AdminUser) => void;
}

/** Cartão que substitui a linha da tabela do protótipo em telas estreitas. */
export const UserListItem = ({ user, onEdit, onRemove }: UserListItemProps) => {
  const isActive = user.status === 'active';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${user.name}, ${user.role}, área ${user.area}. ${isActive ? APP_MESSAGES.admin.userActive : APP_MESSAGES.admin.userInactive}. Toque para editar.`}
      onPress={() => onEdit(user)}
      style={({ pressed }) => [styles.container, pressed ? styles.pressed : null]}
    >
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="account-outline" size={22} color={colors.primary} />
      </View>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {user.name}
          </Text>
          <Badge
            label={isActive ? APP_MESSAGES.admin.userActive : APP_MESSAGES.admin.userInactive}
            backgroundColor={isActive ? colors.status.approvedSoft : colors.slate[100]}
            textColor={isActive ? colors.status.approvedText : colors.slate[500]}
          />
        </View>

        <Text variant="caption" color={colors.slate[500]} numberOfLines={1}>
          {user.email}
        </Text>
        <Text variant="micro" color={colors.slate[400]}>
          {`${user.role} · ${user.area}`}
        </Text>
        <Text variant="micro" color={colors.slate[400]}>
          {`${APP_MESSAGES.admin.lastAccessLabel}: ${
            user.lastAccessAt ? formatDateTime(user.lastAccessAt) : APP_MESSAGES.admin.neverAccessed
          }`}
        </Text>
      </View>

      <IconButton
        icon="trash-can-outline"
        accessibilityLabel={`${APP_MESSAGES.common.remove} ${user.name}`}
        color={colors.slate[400]}
        onPress={() => onRemove(user)}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  pressed: {
    backgroundColor: colors.slate[50],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  details: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
  },
});
