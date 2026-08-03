import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => (
  <View style={styles.container}>
    <View style={styles.texts}>
      <Text variant="heading">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color={colors.slate[500]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    {action}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
