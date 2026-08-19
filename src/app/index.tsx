import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { Screen, StepIndicator } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiGrid } from '@/features/epi-detection/components';
import { useRequiredEpis } from '@/features/epi-detection/hooks/useRequiredEpis';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, radii, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { requiredEpis, loading, error, reload } = useRequiredEpis();
  const { impact } = useHaptics();

  /** Única ação do terminal: começar pela identificação do funcionário. */
  const handleStart = useCallback(() => {
    impact();
    router.push('/identificacao');
  }, [impact, router]);

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ErrorState error={error} onRetry={() => void reload()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.emblem}>
            <MaterialCommunityIcons name="hard-hat" size={56} color={colors.primary} />
          </View>

          <Text variant="display" color={colors.slate[900]} align="center">
            {APP_MESSAGES.home.title}
          </Text>
          <Text variant="body" color={colors.slate[500]} align="center" style={styles.subtitle}>
            {APP_MESSAGES.home.subtitle}
          </Text>
        </View>

        {requiredEpis.length === 0 ? (
          <EmptyState
            icon="shield-alert-outline"
            title={APP_MESSAGES.home.noEquipmentTitle}
            description={APP_MESSAGES.home.noEquipmentDescription}
          />
        ) : (
          <>
            <View style={styles.equipment}>
              <EpiGrid activeIds={requiredEpis} showInactive={false} />
            </View>

            <Button
              label={APP_MESSAGES.home.startButton}
              icon="arrow-right-circle"
              size="terminal"
              onPress={handleStart}
            />
          </>
        )}
      </View>

      <StepIndicator currentStep="start" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  emblem: {
    width: 104,
    height: 104,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.sm,
  },
  subtitle: {
    maxWidth: 420,
  },
  equipment: {
    flexShrink: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
