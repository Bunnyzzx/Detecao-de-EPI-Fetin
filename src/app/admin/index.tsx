import { MaterialCommunityIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/layout';
import { Button, Card, Text, TextField } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useAdminAuth } from '@/features/admin/hooks/AdminAuthContext';
import { adminLoginSchema, type AdminLoginValues } from '@/features/admin/schemas/loginSchema';
import { colors, radii, spacing } from '@/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { signIn, signingIn } = useAdminAuth();
  const [authFailed, setAuthFailed] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }, [router]);

  const submit = handleSubmit(async (values) => {
    setAuthFailed(false);
    const granted = await signIn(values);

    if (granted) {
      router.replace('/admin/panel');
      return;
    }

    setAuthFailed(true);
  });

  return (
    <Screen>
      <ScreenHeader title={APP_MESSAGES.admin.loginTitle} onBack={goBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Card>
            <View style={styles.emblem}>
              <MaterialCommunityIcons name="shield-lock-outline" size={28} color={colors.primary} />
            </View>

            <Text variant="title">{APP_MESSAGES.admin.loginTitle}</Text>
            <Text variant="caption" color={colors.slate[500]} style={styles.description}>
              {APP_MESSAGES.admin.loginDescription}
            </Text>

            <View style={styles.fields}>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label={APP_MESSAGES.admin.usernameLabel}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    icon="account-outline"
                    {...(errors.username?.message ? { errorMessage: errors.username.message } : {})}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label={APP_MESSAGES.admin.passwordLabel}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoCapitalize="none"
                    icon="lock-outline"
                    onSubmitEditing={() => void submit()}
                    {...(errors.password?.message ? { errorMessage: errors.password.message } : {})}
                  />
                )}
              />
            </View>

            {authFailed ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.status.rejectedText}
                />
                <Text variant="caption" color={colors.status.rejectedText} style={styles.flex}>
                  {APP_MESSAGES.admin.invalidCredentials}
                </Text>
              </View>
            ) : null}

            <Button
              label={APP_MESSAGES.admin.submitButton}
              icon="login"
              onPress={() => void submit()}
              loading={signingIn}
              style={styles.submitButton}
            />

            <Text variant="micro" color={colors.slate[400]} align="center" style={styles.hint}>
              {APP_MESSAGES.admin.demoHint}
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
  },
  emblem: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.lg,
  },
  description: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xl,
  },
  fields: {
    gap: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.status.rejectedSoft,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  hint: {
    marginTop: spacing.md,
  },
});
