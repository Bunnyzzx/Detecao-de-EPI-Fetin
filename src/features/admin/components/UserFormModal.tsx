import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button, IconButton, OptionGroup, Text, TextField } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, radii, spacing } from '@/theme';

import { userFormSchema, type UserFormValues } from '../schemas/userSchema';
import { USER_ROLES, type AdminUser } from '../types';

export interface UserFormModalProps {
  visible: boolean;
  /** Quando informado, o formulário está em modo de edição. */
  user: AdminUser | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
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
  { value: 'active' as const, label: APP_MESSAGES.admin.userActive },
  { value: 'inactive' as const, label: APP_MESSAGES.admin.userInactive },
];

export const UserFormModal = ({ visible, user, onClose, onSubmit }: UserFormModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    reset(
      user
        ? {
            name: user.name,
            email: user.email,
            role: user.role,
            area: user.area,
            status: user.status,
          }
        : EMPTY_VALUES,
    );
  }, [reset, user, visible]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
    onClose();
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTexts}>
              <Text variant="heading">
                {user ? APP_MESSAGES.admin.editUserTitle : APP_MESSAGES.admin.newUserTitle}
              </Text>
              <Text variant="caption" color={colors.slate[500]}>
                {user
                  ? APP_MESSAGES.admin.editUserDescription
                  : APP_MESSAGES.admin.newUserDescription}
              </Text>
            </View>
            <IconButton
              icon="close"
              accessibilityLabel={APP_MESSAGES.common.close}
              onPress={onClose}
              backgroundColor={colors.slate[100]}
            />
          </View>

          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label={`${APP_MESSAGES.admin.nameLabel} *`}
                  placeholder={APP_MESSAGES.admin.namePlaceholder}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  icon="account-outline"
                  {...(errors.name?.message ? { errorMessage: errors.name.message } : {})}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label={`${APP_MESSAGES.admin.emailLabel} *`}
                  placeholder={APP_MESSAGES.admin.emailPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  icon="email-outline"
                  {...(errors.email?.message ? { errorMessage: errors.email.message } : {})}
                />
              )}
            />

            <Controller
              control={control}
              name="area"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label={`${APP_MESSAGES.admin.areaLabel} *`}
                  placeholder={APP_MESSAGES.admin.areaPlaceholder}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  icon="office-building-outline"
                  {...(errors.area?.message ? { errorMessage: errors.area.message } : {})}
                />
              )}
            />

            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <OptionGroup
                  label={APP_MESSAGES.admin.roleLabel}
                  options={ROLE_OPTIONS}
                  value={value}
                  onChange={onChange}
                  {...(errors.role?.message ? { errorMessage: errors.role.message } : {})}
                />
              )}
            />

            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <OptionGroup
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </ScrollView>

          <View style={styles.actions}>
            <Button
              label={user ? APP_MESSAGES.admin.saveButton : APP_MESSAGES.admin.createButton}
              onPress={() => void submit()}
              loading={isSubmitting}
              icon="check"
            />
            <Button
              label={APP_MESSAGES.common.cancel}
              variant="ghost"
              onPress={onClose}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
  form: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
});
