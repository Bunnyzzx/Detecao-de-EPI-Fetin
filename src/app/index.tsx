import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, InlineNotice, LoadingState } from '@/components/feedback';
import { Screen, StepIndicator, TerminalStatusBar } from '@/components/layout';
import { Button, Card, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiGrid, HomeHero } from '@/features/epi-detection/components';
import { useAnalysis } from '@/features/epi-detection/hooks/AnalysisContext';
import { useRequiredEpis } from '@/features/epi-detection/hooks/useRequiredEpis';
import { useHaptics } from '@/hooks/useHaptics';
import { useImagePicker } from '@/hooks/useImagePicker';
import { isApiConfigured } from '@/services/env';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { requiredEpis, loading, error, reload } = useRequiredEpis();
  const { setPendingImage } = useAnalysis();
  const { pickImage, picking, error: pickerError, clearError } = useImagePicker();
  const { impact } = useHaptics();

  const handleOpenCamera = useCallback(() => {
    impact();
    router.push('/camera');
  }, [impact, router]);

  const handlePickImage = useCallback(async () => {
    const uri = await pickImage();
    if (uri) {
      setPendingImage({ uri, source: 'gallery' });
      router.push('/preview');
    }
  }, [pickImage, router, setPendingImage]);

  if (loading) {
    return (
      <Screen>
        <TerminalStatusBar />
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <TerminalStatusBar />
        <View style={styles.centered}>
          <ErrorState error={error} onRetry={() => void reload()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <TerminalStatusBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <HomeHero onOpenAdmin={() => router.push('/admin')} />

        <View style={styles.body}>
          <Card>
            <Text variant="title">{APP_MESSAGES.home.readyTitle}</Text>
            <Text variant="body" color={colors.slate[500]} style={styles.readyDescription}>
              {APP_MESSAGES.home.readyDescription}
            </Text>

            <EpiGrid activeIds={requiredEpis} />

            {requiredEpis.length === 0 ? (
              <EmptyState
                icon="shield-alert-outline"
                title={APP_MESSAGES.home.noEquipmentTitle}
                description={APP_MESSAGES.home.noEquipmentDescription}
                compact
              />
            ) : (
              <View style={styles.actions}>
                <Button
                  label={APP_MESSAGES.home.startButton}
                  icon="camera"
                  size="large"
                  onPress={handleOpenCamera}
                  disabled={picking}
                />
                <Button
                  label={APP_MESSAGES.home.galleryButton}
                  icon="image-multiple-outline"
                  variant="secondary"
                  onPress={() => void handlePickImage()}
                  loading={picking}
                />
                <Text variant="caption" color={colors.slate[400]} align="center">
                  {APP_MESSAGES.home.startHint}
                </Text>
                {isApiConfigured() ? null : (
                  <InlineNotice
                    message={APP_MESSAGES.home.simulationNotice}
                    icon="flask-outline"
                    tone="warning"
                  />
                )}
              </View>
            )}
          </Card>

          {pickerError ? (
            <Card variant="outlined">
              <ErrorState error={pickerError} onRetry={clearError} compact />
            </Card>
          ) : null}

          <Button
            label={APP_MESSAGES.home.historyButton}
            icon="history"
            variant="ghost"
            onPress={() => router.push('/history')}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <StepIndicator currentStep="start" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  body: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  readyDescription: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
    backgroundColor: colors.white,
    paddingBottom: spacing.sm,
  },
});
