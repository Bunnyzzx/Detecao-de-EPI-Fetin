import { StyleSheet, View } from 'react-native';

import { Badge, Card, ConfidenceBar, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, spacing } from '@/theme';
import { formatAccessMoment, formatConfidence, formatDuration } from '@/utils';

import type { EpiDetectionResult } from '../types';
import { getStatusPresentation } from '../utils/statusPresentation';

export interface ResultSummaryCardProps {
  result: EpiDetectionResult;
}

/** Resumo numérico do resultado: contagem, confiança e horário do acesso. */
export const ResultSummaryCard = ({ result }: ResultSummaryCardProps) => {
  const presentation = getStatusPresentation(result.status);
  const verifiedCount = result.detectedItems.length;
  const requiredCount = result.requiredItems.length;

  return (
    <Card>
      <View style={styles.header}>
        <Badge
          label={`${verifiedCount}/${requiredCount} ${APP_MESSAGES.result.verifiedSuffix}`}
          backgroundColor={presentation.softColor}
          textColor={presentation.textColor}
          dotColor={presentation.color}
          uppercase
        />
      </View>

      <Text variant="title" style={styles.title}>
        {presentation.cardTitle}
      </Text>

      <View style={styles.confidenceBlock}>
        <View style={styles.confidenceHeader}>
          <Text variant="captionStrong" color={colors.slate[600]}>
            {APP_MESSAGES.result.confidenceLabel}
          </Text>
          <Text variant="captionStrong" color={presentation.textColor}>
            {formatConfidence(result.overallConfidence)}
          </Text>
        </View>
        <ConfidenceBar value={result.overallConfidence} color={presentation.color} height={8} />
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text variant="title" color={colors.status.approvedText}>
            {verifiedCount}
          </Text>
          <Text variant="micro" color={colors.slate[500]}>
            {verifiedCount === 1
              ? APP_MESSAGES.history.detectedCountLabelSingular
              : APP_MESSAGES.history.detectedCountLabel}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text variant="title" color={colors.status.rejectedText}>
            {result.missingItems.length}
          </Text>
          <Text variant="micro" color={colors.slate[500]}>
            {result.missingItems.length === 1
              ? APP_MESSAGES.history.missingCountLabelSingular
              : APP_MESSAGES.history.missingCountLabel}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text variant="subheading" color={colors.slate[700]}>
            {formatDuration(result.processingTimeMs)}
          </Text>
          <Text variant="micro" color={colors.slate[500]}>
            processamento
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerTexts}>
          <Text variant="overline" color={colors.slate[400]}>
            {APP_MESSAGES.result.accessTimeLabel}
          </Text>
          <Text variant="captionStrong" color={colors.slate[800]}>
            {formatAccessMoment(result.analyzedAt)}
          </Text>
        </View>
        <Badge
          label={presentation.accessBadge}
          backgroundColor={presentation.softColor}
          textColor={presentation.textColor}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
  confidenceBlock: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  metricDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.slate[200],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  footerTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
