import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { CameraViewport, FaceGuide } from '@/components/camera';
import { Screen, ScreenHeader, StepIndicator } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useVerificationSession } from '@/features/verification-session/hooks/VerificationSessionContext';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, radii, spacing } from '@/theme';

export default function IdentificationScreen() {
  const router = useRouter();
  const { snapshot, startFaceRecognition, reset } = useVerificationSession();
  const { impact } = useHaptics();

  const { state } = snapshot;
  const isScanning = state === 'face_scanning';
  const isUnknown = state === 'face_unknown';
  const hasFailed = state === 'error';

  const handleStart = useCallback(async () => {
    // Enquanto identifica, o botão sai da tela: não há como abrir duas sessões.
    if (isScanning) {
      return;
    }
    impact();
    const recognized = await startFaceRecognition();
    if (recognized) {
      router.replace('/preparacao');
    }
  }, [impact, isScanning, router, startFaceRecognition]);

  const goHome = useCallback(() => {
    reset();
    router.replace('/');
  }, [reset, router]);

  const instruction = isScanning
    ? APP_MESSAGES.face.scanningHint
    : isUnknown
      ? APP_MESSAGES.face.unknownDescription
      : hasFailed
        ? APP_MESSAGES.face.errorDescription
        : APP_MESSAGES.face.instruction;

  const statusLabel = isScanning
    ? APP_MESSAGES.face.scanning
    : isUnknown
      ? APP_MESSAGES.face.unknownTitle
      : hasFailed
        ? APP_MESSAGES.face.errorTitle
        : null;

  const needsRetry = isUnknown || hasFailed;

  return (
    <Screen backgroundColor={colors.scanner.background}>
      <ScreenHeader title={APP_MESSAGES.face.title} onBack={goHome} tone="dark" />

      <View style={styles.body}>
        <CameraViewport>
          <FaceGuide active={isScanning} />
        </CameraViewport>

        {statusLabel ? (
          <View
            style={[
              styles.statusBanner,
              needsRetry ? styles.statusBannerAlert : styles.statusBannerActive,
            ]}
          >
            <Text variant="heading" color={colors.white} align="center">
              {statusLabel}
            </Text>
          </View>
        ) : null}

        <Text variant="subheading" color={colors.slate[300]} align="center">
          {instruction}
        </Text>

        <View style={styles.actions}>
          {isScanning ? null : (
            <Button
              label={needsRetry ? APP_MESSAGES.face.retryButton : APP_MESSAGES.face.startButton}
              icon={needsRetry ? 'refresh' : 'face-recognition'}
              size="terminal"
              onPress={() => void handleStart()}
            />
          )}

          {needsRetry ? (
            <Button
              label={APP_MESSAGES.face.backHomeButton}
              variant="secondary"
              size="large"
              onPress={goHome}
            />
          ) : null}
        </View>
      </View>

      <StepIndicator currentStep="identification" tone="dark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  statusBanner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  statusBannerActive: {
    backgroundColor: colors.overlayLight,
    borderColor: colors.accent,
  },
  statusBannerAlert: {
    backgroundColor: colors.status.warningDeep,
    borderColor: colors.status.warning,
  },
  actions: {
    gap: spacing.md,
  },
});
