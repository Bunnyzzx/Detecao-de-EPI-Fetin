import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import type { MaterialCommunityIconName } from '@/features/epi-detection/types';
import { colors, radii, spacing } from '@/theme';

export interface MetricCardProps {
  label: string;
  value: string;
  icon: MaterialCommunityIconName;
  accentColor?: string;
}

export const MetricCard = ({
  label,
  value,
  icon,
  accentColor = colors.primary,
}: MetricCardProps) => (
  <Card variant="outlined" style={styles.card}>
    <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}1A` }]}>
      <MaterialCommunityIcons name={icon} size={20} color={accentColor} />
    </View>
    <Text variant="title">{value}</Text>
    <Text variant="micro" color={colors.slate[500]}>
      {label}
    </Text>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
