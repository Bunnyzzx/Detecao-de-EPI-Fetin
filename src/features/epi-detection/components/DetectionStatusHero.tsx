import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

import type { DetectionStatus } from '../types';
import { getStatusPresentation } from '../utils/statusPresentation';

export interface DetectionStatusHeroProps {
  status: DetectionStatus;
}

/**
 * Painel colorido do resultado, equivalente ao bloco "Acesso Liberado" do
 * protótipo, agora com as três variações de status.
 */
export const DetectionStatusHero = ({ status }: DetectionStatusHeroProps) => {
  const presentation = getStatusPresentation(status);

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${presentation.headline}. ${presentation.subtitle}`}
      style={[styles.container, { backgroundColor: presentation.colorDark }]}
    >
      <View style={[styles.decorationLeft, { backgroundColor: presentation.color }]} />
      <View style={[styles.decorationRight, { backgroundColor: presentation.colorDeep }]} />

      <View style={styles.iconRing}>
        <MaterialCommunityIcons name={presentation.icon} size={56} color={colors.white} />
      </View>

      <Text variant="display" color={colors.white} align="center">
        {presentation.headline}
      </Text>
      <Text variant="body" color={colors.white} align="center" style={styles.subtitle}>
        {presentation.subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  decorationLeft: {
    position: 'absolute',
    left: -70,
    bottom: -70,
    width: 180,
    height: 180,
    borderRadius: radii.pill,
    opacity: 0.25,
  },
  decorationRight: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 140,
    height: 140,
    borderRadius: radii.pill,
    opacity: 0.35,
  },
  iconRing: {
    width: 108,
    height: 108,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  subtitle: {
    opacity: 0.9,
    maxWidth: 340,
  },
});
