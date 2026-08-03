import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { IconButton, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, radii, spacing } from '@/theme';
import { formatConfidence, formatDateTime, pluralize } from '@/utils';

import type { EpiDetectionResult } from '../types';
import { getStatusPresentation } from '../utils/statusPresentation';

export interface HistoryListItemProps {
  result: EpiDetectionResult;
  onPress: (result: EpiDetectionResult) => void;
  onRemove: (result: EpiDetectionResult) => void;
}

export const HistoryListItem = ({ result, onPress, onRemove }: HistoryListItemProps) => {
  const presentation = getStatusPresentation(result.status);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Análise de ${formatDateTime(result.analyzedAt)}. Resultado ${presentation.shortLabel}. ${result.detectedItems.length} detectados, ${result.missingItems.length} ausentes.`}
      onPress={() => onPress(result)}
      style={({ pressed }) => [styles.container, pressed ? styles.pressed : null]}
    >
      <View style={styles.thumbnailWrapper}>
        <Image source={{ uri: result.imageUri }} style={styles.thumbnail} resizeMode="cover" />
        <View style={[styles.statusDot, { backgroundColor: presentation.color }]}>
          <MaterialCommunityIcons name={presentation.icon} size={12} color={colors.white} />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text variant="bodyStrong" color={presentation.textColor}>
            {presentation.shortLabel}
          </Text>
          <Text variant="micro" color={colors.slate[400]}>
            {formatDateTime(result.analyzedAt)}
          </Text>
        </View>

        <Text variant="caption" color={colors.slate[500]}>
          {`${pluralize(
            result.detectedItems.length,
            APP_MESSAGES.history.detectedCountLabelSingular,
            APP_MESSAGES.history.detectedCountLabel,
          )} · ${pluralize(
            result.missingItems.length,
            APP_MESSAGES.history.missingCountLabelSingular,
            APP_MESSAGES.history.missingCountLabel,
          )}`}
        </Text>

        <Text variant="micro" color={colors.slate[400]}>
          {`${APP_MESSAGES.result.confidenceLabel}: ${formatConfidence(result.overallConfidence)}`}
        </Text>
      </View>

      <IconButton
        icon="trash-can-outline"
        accessibilityLabel={`${APP_MESSAGES.common.remove} análise de ${formatDateTime(result.analyzedAt)}`}
        color={colors.slate[400]}
        onPress={() => onRemove(result)}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  pressed: {
    backgroundColor: colors.slate[50],
  },
  thumbnailWrapper: {
    width: 62,
    height: 62,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
    backgroundColor: colors.slate[200],
  },
  statusDot: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  details: {
    flex: 1,
    gap: spacing.xxs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
