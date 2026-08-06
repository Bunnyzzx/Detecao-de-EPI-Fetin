import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScanFrame } from '@/components/camera';
import { StateView } from '@/components/feedback';
import { Screen, ScreenHeader, StepIndicator } from '@/components/layout';
import { ConfidenceBar, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiChecklistItem } from '@/features/epi-detection/components';
import { useRequiredEpis } from '@/features/epi-detection/hooks/useRequiredEpis';
import { RecognizedPersonCard } from '@/features/verification-session/components';
import { useVerificationSession } from '@/features/verification-session/hooks/VerificationSessionContext';
import { useCameraAvailability } from '@/hooks/useCameraAvailability';
import { colors, radii, spacing } from '@/theme';

/** Mensagem de acompanhamento correspondente ao estado corrente. */
const STAGE_LABEL: Record<string, string> = {
  opening: APP_MESSAGES.scan.opening,
  face_scanning: APP_MESSAGES.scan.faceScanning,
  face_recognized: APP_MESSAGES.scan.epiDetecting,
  face_unknown: APP_MESSAGES.scan.epiDetecting,
  epi_detecting: APP_MESSAGES.scan.epiDetecting,
};

export default function VerificationScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const availability = useCameraAvailability();
  const { requiredEpis } = useRequiredEpis();
  const { snapshot, start, cancel } = useVerificationSession();

  const { state, employee, faceConfidence, progress, items, currentItem } = snapshot;

  /** O visor só mostra vídeo quando há câmera disponível e autorizada. */
  const showCamera = availability === 'available' && Boolean(permission?.granted);

  const runSession = useCallback(async () => {
    const outcome = await start(requiredEpis);
    if (outcome) {
      router.replace('/resultado');
    }
  }, [requiredEpis, router, start]);

  /**
   * Pede a permissão uma única vez, sem bloquear nada: num terminal
   * provisionado ela já vem concedida.
   */
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  /**
   * A sessão começa sozinha assim que a tela monta. Nenhuma ação do usuário é
   * necessária depois do toque inicial — nem mesmo autorizar a câmera, que é
   * apenas o visor. Quando a detecção vier do dispositivo embarcado, este
   * ponto continua o mesmo.
   */
  useEffect(() => {
    if (requiredEpis.length === 0) {
      return;
    }
    void runSession();
    return cancel;
  }, [cancel, requiredEpis.length, runSession]);

  const goHome = useCallback(() => {
    cancel();
    router.replace('/');
  }, [cancel, router]);

  const isFinished = state === 'completed' || state === 'error' || state === 'cancelled';

  const renderBody = () => {
    if (state === 'error') {
      return (
        <StateView
          icon="alert-circle-outline"
          title={APP_MESSAGES.scan.errorTitle}
          description={APP_MESSAGES.scan.errorDescription}
          tone="danger"
          appearance="dark"
          actions={[
            {
              label: APP_MESSAGES.scan.retryButton,
              onPress: () => void runSession(),
              icon: 'refresh',
            },
            { label: APP_MESSAGES.common.back, onPress: goHome, variant: 'secondary' },
          ]}
        />
      );
    }

    if (state === 'cancelled') {
      return (
        <StateView
          icon="refresh"
          title={APP_MESSAGES.scan.cancelledTitle}
          description={APP_MESSAGES.scan.cancelledDescription}
          tone="warning"
          appearance="dark"
          actions={[
            {
              label: APP_MESSAGES.scan.retryButton,
              onPress: () => void runSession(),
              icon: 'refresh',
            },
            { label: APP_MESSAGES.common.back, onPress: goHome, variant: 'secondary' },
          ]}
        />
      );
    }

    return (
      <View style={styles.layout}>
        <View style={styles.viewport}>
          {showCamera ? (
            <CameraView style={StyleSheet.absoluteFill} facing="front" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.viewportPlaceholder]}>
              <MaterialCommunityIcons
                name="account-outline"
                size={140}
                color={colors.overlayBorder}
              />
              <Text variant="caption" color={colors.slate[400]} align="center">
                {APP_MESSAGES.camera.unavailableTitle}
              </Text>
            </View>
          )}
          <ScanFrame active={!isFinished} />

          <View style={styles.stageBadge} pointerEvents="none">
            <Text variant="captionStrong" color={colors.white} align="center">
              {STAGE_LABEL[state] ?? APP_MESSAGES.scan.faceScanningHint}
            </Text>
          </View>
        </View>

        <View style={styles.sidebar}>
          {employee || state === 'face_unknown' || state === 'epi_detecting' ? (
            <RecognizedPersonCard employee={employee} confidence={faceConfidence} onDark />
          ) : null}

          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text variant="overline" color={colors.slate[400]}>
                {APP_MESSAGES.scan.checklistTitle}
              </Text>
              <Text variant="captionStrong" color={colors.accent}>
                {`${Math.round(progress * 100)}%`}
              </Text>
            </View>
            <ConfidenceBar
              value={progress}
              color={colors.accent}
              trackColor={colors.overlayBorder}
              height={6}
            />
          </View>

          <View style={styles.checklist}>
            {items.map((item) => (
              <EpiChecklistItem
                key={item.id}
                item={item}
                tone="dark"
                pending={!isFinished && !item.detected}
                scanning={item.id === currentItem && state === 'epi_detecting'}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen backgroundColor={colors.scanner.background}>
      <ScreenHeader title={APP_MESSAGES.scan.title} onBack={goHome} tone="dark" />
      <View style={styles.body}>{renderBody()}</View>
      <StepIndicator currentStep="verification" tone="dark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  viewport: {
    flex: 1,
    minWidth: 0,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.scanner.viewport,
  },
  viewportPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stageBadge: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: colors.overlayBorder,
  },
  sidebar: {
    width: 300,
    gap: spacing.md,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checklist: {
    flex: 1,
    gap: spacing.sm,
  },
});
