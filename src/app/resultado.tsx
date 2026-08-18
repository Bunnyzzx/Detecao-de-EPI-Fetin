import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { StateView } from '@/components/feedback';
import { Screen, StepIndicator } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiChecklistItem } from '@/features/epi-detection/components';
import { getStatusPresentation } from '@/features/epi-detection/utils/statusPresentation';
import { RecognizedPersonCard } from '@/features/verification-session/components';
import { useVerificationSession } from '@/features/verification-session/hooks/VerificationSessionContext';
import { colors, radii, spacing } from '@/theme';
import { formatConfidence } from '@/utils';

export default function ResultScreen() {
  const router = useRouter();
  const { snapshot, reset } = useVerificationSession();
  const outcome = snapshot.outcome;

  /** Limpa a sessão inteira e devolve o terminal para a próxima pessoa. */
  const goHome = useCallback(() => {
    reset();
    router.replace('/');
  }, [reset, router]);

  if (!outcome) {
    return (
      <Screen>
        <View style={styles.centered}>
          <StateView
            icon="alert-circle-outline"
            title={APP_MESSAGES.result.missingResultTitle}
            description={APP_MESSAGES.result.missingResultDescription}
            tone="warning"
            actions={[{ label: APP_MESSAGES.result.backHomeButton, onPress: goHome, icon: 'home' }]}
          />
        </View>
      </Screen>
    );
  }

  const { detection, employee, faceConfidence } = outcome;
  const presentation = getStatusPresentation(detection.status);
  const isApproved = detection.status === 'approved';

  // Todos os EPIs exigidos, detectados e ausentes, na ordem do catálogo.
  const allItems = [...detection.detectedItems, ...detection.missingItems].sort(
    (first, second) =>
      detection.requiredItems.indexOf(first.id) - detection.requiredItems.indexOf(second.id),
  );

  const missingLabels = detection.missingItems.map((item) => item.label).join(', ');

  return (
    <Screen backgroundColor={colors.slate[50]} edges={['top', 'left', 'right']}>
      <View style={styles.layout}>
        <View style={[styles.hero, { backgroundColor: presentation.colorDark }]}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name={isApproved ? 'check-circle' : 'close-circle'}
              size={64}
              color={colors.white}
            />
          </View>

          <Text variant="display" color={colors.white} align="center">
            {isApproved ? APP_MESSAGES.result.approvedTitle : APP_MESSAGES.result.rejectedTitle}
          </Text>

          <Text variant="body" color={colors.white} align="center" style={styles.heroSubtitle}>
            {isApproved
              ? APP_MESSAGES.result.approvedSubtitle
              : missingLabels
                ? `${APP_MESSAGES.result.rejectedReasonPrefix} ${missingLabels}.`
                : APP_MESSAGES.result.rejectedNoDetection}
          </Text>

          <View style={styles.heroMeta}>
            <Text variant="captionStrong" color={colors.white}>
              {`${detection.detectedItems.length}/${detection.requiredItems.length} ${APP_MESSAGES.result.verifiedSuffix}`}
            </Text>
            <Text variant="micro" color={colors.white}>
              {`${APP_MESSAGES.result.confidenceLabel}: ${formatConfidence(detection.overallConfidence)}`}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <RecognizedPersonCard employee={employee} confidence={faceConfidence} />

          <View style={styles.checklist}>
            {allItems.map((item) => (
              <View key={item.id} style={styles.checklistCell}>
                <EpiChecklistItem item={item} />
              </View>
            ))}
          </View>

          <Button
            label={APP_MESSAGES.result.backHomeButton}
            icon="home"
            size="large"
            onPress={goHome}
          />
        </View>
      </View>

      <StepIndicator currentStep="access" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroSubtitle: {
    opacity: 0.92,
    maxWidth: 460,
  },
  /** Em retrato a meta fica em linha: economiza altura para a lista de EPIs. */
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xxs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'stretch',
  },
  panel: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  /**
   * Duas colunas. Em retrato os sete equipamentos empilhados não caberiam sem
   * rolagem, e a tela precisa ser lida de uma vez só.
   */
  checklist: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    gap: spacing.sm,
  },
  checklistCell: {
    width: '48.5%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
