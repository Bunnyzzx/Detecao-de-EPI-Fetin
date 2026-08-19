import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { CameraViewport } from '@/components/camera';
import { Screen, ScreenHeader, StepIndicator } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useVerificationSession } from '@/features/verification-session/hooks/VerificationSessionContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useTerminalMetrics } from '@/hooks/useTerminalMetrics';
import { colors, radii, spacing } from '@/theme';

export default function IdentificationScreen() {
  const router = useRouter();
  const { snapshot, startFaceRecognition, cancel, reset } = useVerificationSession();
  const { impact } = useHaptics();
  const metrics = useTerminalMetrics();

  const { state } = snapshot;
  const isScanning = state === 'face_scanning';
  const isUnknown = state === 'face_unknown';
  const hasFailed = state === 'error';
  const needsRetry = isUnknown || hasFailed;

  /**
   * Trava síncrona contra duplo toque: `isScanning` só reflete o estado no
   * próximo render, então dois toques no mesmo quadro escapariam dele.
   */
  const isRunningRef = useRef(false);

  const identify = useCallback(async () => {
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    impact();

    try {
      const recognized = await startFaceRecognition();
      if (recognized) {
        router.replace('/preparacao');
      }
      // Não reconhecido permanece nesta tela: a orientação abaixo do visor
      // muda e o funcionário tenta de novo, sem limite de tentativas.
    } finally {
      isRunningRef.current = false;
    }
  }, [impact, router, startFaceRecognition]);

  const goHome = useCallback(() => {
    cancel();
    reset();
    router.replace('/');
  }, [cancel, reset, router]);

  return (
    <Screen backgroundColor={colors.scanner.background}>
      <ScreenHeader title={APP_MESSAGES.face.title} onBack={goHome} tone="dark" />

      <View style={styles.body}>
        {/*
          O visor nunca desmonta, nem quando ninguém é identificado: é olhando
          para ele que a pessoa corrige posição, distância e enquadramento
          antes de tentar de novo. Sem moldura sobreposta — a orientação é
          dada por texto, abaixo.
        */}
        <CameraViewport style={needsRetry ? styles.viewportCompact : styles.viewport} />

        {needsRetry ? (
          <View style={styles.guidance}>
            <View style={styles.guidanceHeader}>
              <MaterialCommunityIcons
                name="account-alert-outline"
                size={30}
                color={colors.status.warning}
              />
              <Text variant="heading" color={colors.white} style={styles.guidanceTitle}>
                {hasFailed ? APP_MESSAGES.face.errorTitle : APP_MESSAGES.face.unknownTitle}
              </Text>
            </View>

            <Text variant="body" color={colors.slate[300]}>
              {hasFailed
                ? APP_MESSAGES.face.errorDescription
                : APP_MESSAGES.face.unknownDescription}
            </Text>

            {isUnknown ? (
              <>
                <Text variant="bodyStrong" color={colors.slate[200]}>
                  {APP_MESSAGES.face.unknownChecksTitle}
                </Text>

                <View style={styles.checks}>
                  {APP_MESSAGES.face.unknownChecks.map((check) => (
                    <View key={check} style={styles.checkRow}>
                      <MaterialCommunityIcons
                        name="circle-medium"
                        size={20}
                        color={colors.accent}
                      />
                      <Text variant="body" color={colors.slate[300]} style={styles.checkText}>
                        {check}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text variant="bodyStrong" color={colors.white}>
                  {APP_MESSAGES.face.unknownRetryHint}
                </Text>
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.statusBlock}>
            <Text variant={metrics.instruction} color={colors.white} align="center">
              {isScanning ? APP_MESSAGES.face.scanning : APP_MESSAGES.face.instruction}
            </Text>
            <Text variant={metrics.instructionDetail} color={colors.slate[400]} align="center">
              {isScanning
                ? APP_MESSAGES.face.scanningHint
                : APP_MESSAGES.face.instructionDetail}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {/* Durante a identificação não há ação alguma: nada a tocar duas vezes. */}
          {isScanning ? null : (
            <Button
              label={needsRetry ? APP_MESSAGES.face.retryButton : APP_MESSAGES.face.startButton}
              icon={needsRetry ? 'refresh' : 'face-recognition'}
              size="terminal"
              onPress={() => void identify()}
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
  viewport: {
    flex: 1,
  },
  /** Com a orientação em tela o visor cede altura, mas continua utilizável. */
  viewportCompact: {
    flex: 1,
    minHeight: 200,
  },
  statusBlock: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  guidance: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.status.warning,
    backgroundColor: colors.status.warningDeep,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  guidanceTitle: {
    flex: 1,
  },
  checks: {
    gap: spacing.xxs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xxs,
  },
  checkText: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
