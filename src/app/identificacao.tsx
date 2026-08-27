import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { CameraViewport } from '@/components/camera';
import { Screen, ScreenHeader, StepIndicator } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useAutoFaceRecognition } from '@/features/face-recognition/face/useAutoFaceRecognition';
import { useVerificationSession } from '@/features/verification-session/hooks/VerificationSessionContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useTerminalMetrics } from '@/hooks/useTerminalMetrics';
import { colors, radii, spacing } from '@/theme';

/**
 * Desfecho visual de uma tentativa.
 *
 * Cada tentativa é uma captura só: o resultado fica na tela até o funcionário
 * pedir uma nova (ou sair). Nenhum avanço automático — isso é trabalho de uma
 * etapa futura, com confirmação temporal.
 */
type FaceOutcome = 'idle' | 'waiting' | 'no-face' | 'identified' | 'not-identified' | 'error';

export default function IdentificationScreen() {
  const router = useRouter();
  const { cancel, reset } = useVerificationSession();
  const { impact } = useHaptics();
  const metrics = useTerminalMetrics();

  const cameraRef = useRef<CameraView>(null);

  const { status, result, recognize } = useAutoFaceRecognition({ cameraRef });

  const isPreparing = status === 'preparando';
  const isRunning = status === 'analisando';
  const setupFailed = status === 'erro';
  const hasPipelineError = result?.error != null;

  // O pipeline só chega com `facesDetected > 0` e sem erro depois de calcular
  // o embedding e comparar com a galeria: `match` sempre existe nesse ponto.
  const outcome: FaceOutcome = setupFailed
    ? 'error'
    : isRunning
      ? 'waiting'
      : result === null
        ? 'idle'
        : hasPipelineError
          ? 'error'
          : result.facesDetected === 0
            ? 'no-face'
            : result.match?.passes
              ? 'identified'
              : 'not-identified';

  // As três só param à espera de uma nova tentativa explícita.
  const needsRetry =
    outcome === 'no-face' || outcome === 'not-identified' || outcome === 'error';
  const showsGuidanceCard = outcome === 'not-identified' || outcome === 'error';

  const attempt = useCallback(() => {
    impact();
    recognize();
  }, [impact, recognize]);

  const goHome = useCallback(() => {
    cancel();
    reset();
    router.replace('/');
  }, [cancel, reset, router]);

  const neutralCopy = (): { title: string; detail: string } => {
    if (outcome === 'no-face') {
      return { title: APP_MESSAGES.face.noFaceTitle, detail: APP_MESSAGES.face.instructionDetail };
    }
    if (outcome === 'waiting') {
      return { title: APP_MESSAGES.face.scanning, detail: APP_MESSAGES.face.scanningHint };
    }
    return { title: APP_MESSAGES.face.instruction, detail: APP_MESSAGES.face.instructionDetail };
  };

  return (
    <Screen backgroundColor={colors.scanner.background}>
      <ScreenHeader title={APP_MESSAGES.face.title} onBack={goHome} tone="dark" />

      <View style={styles.body}>
        {/*
          O visor nunca desmonta, nem quando ninguém é identificado: é olhando
          para ele que a pessoa corrige posição, distância e enquadramento. Sem
          moldura sobreposta — a orientação é dada por texto, abaixo.
        */}
        <CameraViewport
          ref={cameraRef}
          style={showsGuidanceCard ? styles.viewportCompact : styles.viewport}
        />

        {outcome === 'identified' ? (
          <View style={styles.identifiedCard}>
            <View style={styles.guidanceHeader}>
              <MaterialCommunityIcons name="account-check" size={30} color={colors.status.approved} />
              <Text variant="heading" color={colors.white} style={styles.guidanceTitle}>
                {APP_MESSAGES.face.identifiedTitle}
              </Text>
            </View>
            <Text variant="subheading" color={colors.slate[200]}>
              {result?.match?.best?.nome ?? '—'}
            </Text>
          </View>
        ) : showsGuidanceCard ? (
          <View style={styles.guidance}>
            <View style={styles.guidanceHeader}>
              <MaterialCommunityIcons
                name="account-alert-outline"
                size={30}
                color={colors.status.warning}
              />
              <Text variant="heading" color={colors.white} style={styles.guidanceTitle}>
                {outcome === 'error' ? APP_MESSAGES.face.errorTitle : APP_MESSAGES.face.unknownTitle}
              </Text>
            </View>

            <Text variant="body" color={colors.slate[300]}>
              {outcome === 'error'
                ? APP_MESSAGES.face.errorDescription
                : APP_MESSAGES.face.unknownDescription}
            </Text>

            {outcome === 'not-identified' ? (
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
              {neutralCopy().title}
            </Text>
            <Text variant={metrics.instructionDetail} color={colors.slate[400]} align="center">
              {neutralCopy().detail}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {/* Enquanto a tentativa está em andamento não há ação alguma: nada
              a tocar duas vezes. Falha de carregamento também não oferece
              "Iniciar" — não há o que tentar sem detector/modelo. */}
          {setupFailed ? (
            <Button
              label={APP_MESSAGES.face.backHomeButton}
              variant="secondary"
              size="large"
              onPress={goHome}
            />
          ) : isRunning || outcome === 'identified' ? null : needsRetry ? (
            <>
              <Button
                label={APP_MESSAGES.face.retryButton}
                icon="refresh"
                size="terminal"
                onPress={attempt}
              />
              <Button
                label={APP_MESSAGES.face.backHomeButton}
                variant="secondary"
                size="large"
                onPress={goHome}
              />
            </>
          ) : (
            <Button
              label={APP_MESSAGES.face.startButton}
              icon="face-recognition"
              size="terminal"
              disabled={isPreparing}
              loading={isPreparing}
              onPress={attempt}
            />
          )}
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
  identifiedCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.status.approved,
    backgroundColor: colors.status.approvedDeep,
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
