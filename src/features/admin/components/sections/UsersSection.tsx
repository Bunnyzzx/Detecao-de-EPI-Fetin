import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { Button, SectionHeader, TextField } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { spacing } from '@/theme';

import { useUsers } from '../../hooks/useUsers';
import type { UserFormValues } from '../../schemas/userSchema';
import type { AdminUser } from '../../types';
import { UserFormModal } from '../UserFormModal';
import { UserListItem } from '../UserListItem';

export const UsersSection = () => {
  const {
    filteredUsers,
    search,
    setSearch,
    loading,
    error,
    reload,
    createUser,
    updateUser,
    removeUser,
  } = useUsers();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const openCreate = useCallback(() => {
    setEditingUser(null);
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setModalVisible(true);
  }, []);

  const handleSubmit = useCallback(
    async (values: UserFormValues) => {
      if (editingUser) {
        await updateUser(editingUser.id, values);
        return;
      }
      await createUser(values);
    },
    [createUser, editingUser, updateUser],
  );

  const confirmRemove = useCallback(
    (user: AdminUser) => {
      Alert.alert(
        APP_MESSAGES.admin.removeUserConfirmTitle,
        `${user.name} — ${APP_MESSAGES.admin.removeUserConfirmDescription}`,
        [
          { text: APP_MESSAGES.common.cancel, style: 'cancel' },
          {
            text: APP_MESSAGES.common.remove,
            style: 'destructive',
            onPress: () => void removeUser(user.id),
          },
        ],
      );
    },
    [removeUser],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => void reload()} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionHeader
          title={APP_MESSAGES.admin.usersTitle}
          subtitle={APP_MESSAGES.admin.usersSubtitle}
        />
        <TextField
          label="Buscar"
          placeholder={APP_MESSAGES.admin.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
          icon="magnify"
          autoCapitalize="none"
        />
        <Button label={APP_MESSAGES.admin.newUserButton} icon="plus" onPress={openCreate} />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState icon="account-group-outline" title={APP_MESSAGES.admin.usersEmpty} compact />
        }
        renderItem={({ item }) => (
          <UserListItem user={item} onEdit={openEdit} onRemove={confirmRemove} />
        )}
      />

      <UserFormModal
        visible={modalVisible}
        user={editingUser}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.md,
  },
});
