import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { InlineNotice, StateView } from '@/components/feedback';
import { Screen, ScreenHeader, StepIndicator } from '@/components/layout';
import { Button, Card, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import {
  DetectionStatusHero,
  EpiChecklistItem,
  ResultSummaryCard,
} from '@/features/epi-detection/components';
import { useAnalysis } from '@/features/epi-detection/hooks/AnalysisContext';
import { hasLowConfidence } from '@/features/epi-detection/utils/resolveDetectionStatus';
import { getStatusPresentation } from '@/features/epi-detection/utils/statusPresentation';
import { colors, radii, spacing } from '@/theme';

export default function ResultScreen() {
  const router = useRouter();
  const { lastResult: result, reset } = useAnalysis();

  const goHome = useCallback(() => {
    reset();
    router.replace('/');
  }, [reset, router]);

  const startNewAnalysis = useCallback(() => {
    reset();
    router.replace('/camera');
  }, [reset, router]);

  if (!result) {
    return (
      <Screen>
        <ScreenHeader title={APP_MESSAGES.result.title} onBack={goHome} />
        <View style={styles.centered}>
          <StateView
            icon="alert-circle-outline"
            title={APP_MESSAGES.result.missingResultTitle}
            description={APP_MESSAGES.result.missingResultDescription}
            tone="warning"
            actions={[
              {
                label: APP_MESSAGES.result.newAnalysisButton,
                onPress: startNewAnalysis,
                icon: 'camera',
              },
              {
                label: APP_MESSAGES.result.backHomeButton,
                onPress: goHome,
                variant: 'secondary',
              },
            ]}
          />
        </View>
      </Screen>
    );
  }

  const presentation = getStatusPresentation(result.status);
  const hasNoDetection = result.detectedItems.length === 0;
  const isLowConfidence = hasLowConfidence(result);

  return (
    <Screen edges={['top', 'left', 'right']} backgroundColor={colors.slate[50]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DetectionStatusHero status={result.status} />

        <View style={styles.body}>
          <ResultSummaryCard result={result} />

          {hasNoDetection ? (
            <Card variant="outlined">
              <StateView
                icon="shield-alert-outline"
                title={APP_MESSAGES.result.noDetectionTitle}
                description={APP_MESSAGES.result.noDetectionDescription}
                tone="danger"
                compact
              />
            </Card>
          ) : null}

          {isLowConfidence ? (
            <Card variant="outlined">
              <StateView
                icon="alert-circle-outline"
                title={APP_MESSAGES.result.lowConfidenceTitle}
                description={APP_MESSAGES.result.lowConfidenceDescription}
                tone="warning"
                compact
              />
            </Card>
          ) : null}

          {result.detectedItems.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={colors.status.approved}
                />
                <Text variant="subheading">
                  {`${APP_MESSAGES.result.detectedSectionTitle} (${result.detectedItems.length})`}
                </Text>
              </View>
              {result.detectedItems.map((item) => (
                <EpiChecklistItem key={item.id} item={item} />
              ))}
            </View>
          ) : null}

          {result.missingItems.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={colors.status.rejected}
                />
                <Text variant="subheading">
                  {`${APP_MESSAGES.result.missingSectionTitle} (${result.missingItems.length})`}
                </Text>
              </View>
              {result.missingItems.map((item) => (
                <EpiChecklistItem key={item.id} item={item} />
              ))}
            </View>
          ) : null}

          <InlineNotice message={APP_MESSAGES.result.disclaimer} icon="information-outline" />

          <View style={styles.actions}>
            {result.status === 'approved' ? (
              <Button
                label={APP_MESSAGES.result.continueButton}
                icon="arrow-right"
                iconPosition="right"
                variant="success"
                size="large"
                onPress={goHome}
              />
            ) : null}
            <Button
              label={APP_MESSAGES.result.newAnalysisButton}
              icon="camera"
              variant={result.status === 'approved' ? 'secondary' : 'primary'}
              size={result.status === 'approved' ? 'medium' : 'large'}
              onPress={startNewAnalysis}
            />
            <Button
              label={APP_MESSAGES.result.backHomeButton}
              variant="ghost"
              onPress={goHome}
              accessibilityLabel={`${APP_MESSAGES.result.backHomeButton}. Resultado: ${presentation.shortLabel}`}
            />
          </View>
        </View>
      </ScrollView>

      <StepIndicator currentStep="access" />
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
  imageBlock: {
    height: 200,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.slate[200],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  actions: {
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
