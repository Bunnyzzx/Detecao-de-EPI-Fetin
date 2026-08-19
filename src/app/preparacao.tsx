import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { StateView } from '@/components/feedback';
import { Screen, StepIndicator } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useVerificationSession } from '@/features/verification-session/hooks/VerificationSessionContext';
import { hasIdentifiedEmployee } from '@/features/verification-session/machine/sessionMachine';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, radii, spacing } from '@/theme';

export default function PreparationScreen() {
  const router = useRouter();
  const { snapshot, prepareEpiVerification, reset } = useVerificationSession();
  const { impact } = useHaptics();

  const { employee } = snapshot;
  const isIdentified = hasIdentifiedEmployee(snapshot);

  /**
   * Chegada logo após a identificação: abre a preparação.
   *
   * A vinda de uma reprovação não é tratada aqui — quem sai do resultado já
   * prepara a sessão antes de navegar. Reagir a outros estados faria esta tela
   * descartar um resultado recém-produzido ou abortar uma análise em curso.
   */
  useEffect(() => {
    if (snapshot.state === 'face_recognized') {
      prepareEpiVerification();
    }
  }, [prepareEpiVerification, snapshot.state]);

  const goHome = useCallback(() => {
    reset();
    router.replace('/');
  }, [reset, router]);

  const handleStart = useCallback(() => {
    impact();
    router.replace('/verificacao');
  }, [impact, router]);

  if (!isIdentified || !employee) {
    return (
      <Screen>
        <View style={styles.centered}>
          <StateView
            icon="account-question"
            title={APP_MESSAGES.preparation.missingEmployeeTitle}
            description={APP_MESSAGES.preparation.missingEmployeeDescription}
            tone="warning"
            actions={[{ label: APP_MESSAGES.face.backHomeButton, onPress: goHome, icon: 'home' }]}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        <View style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <MaterialCommunityIcons
              name="check-circle"
              size={30}
              color={colors.status.approvedDark}
            />
            <Text variant="subheading" color={colors.status.approvedText}>
              {APP_MESSAGES.preparation.title}
            </Text>
          </View>

          <Text variant="display" color={colors.slate[900]} align="center">
            {employee.nome}
          </Text>

          <View style={styles.identityMeta}>
            <Text variant="bodyStrong" color={colors.slate[600]}>
              {`${APP_MESSAGES.face.registrationLabel}: ${employee.matricula}`}
            </Text>
            <Text variant="bodyStrong" color={colors.slate[600]}>
              {`${APP_MESSAGES.face.sectorLabel}: ${employee.setor}`}
            </Text>
          </View>
        </View>

        <View style={styles.positionBlock}>
          <View style={styles.positionFigure}>
            <MaterialCommunityIcons name="human-handsdown" size={92} color={colors.primary} />
            <View style={styles.floorMark} />
          </View>

          <Text variant="heading" color={colors.slate[900]} align="center">
            {APP_MESSAGES.preparation.positionInstruction}
          </Text>
          <Text variant="body" color={colors.slate[500]} align="center">
            {APP_MESSAGES.preparation.positionDetail}
          </Text>
        </View>

        <Button
          label={APP_MESSAGES.preparation.startButton}
          icon="shield-search"
          size="terminal"
          onPress={handleStart}
        />
      </View>

      <StepIndicator currentStep="verification" />
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
  identityCard: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.xxl,
    backgroundColor: colors.status.approvedSoft,
    borderWidth: 1,
    borderColor: colors.status.approved,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identityMeta: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  positionBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  positionFigure: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  /** Marcação do chão: a mesma referência física que o funcionário procura. */
  floorMark: {
    width: 120,
    height: 14,
    borderRadius: radii.pill,
    borderWidth: 3,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
