import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { EPI_CATALOG } from '@/constants/epiCatalog';
import { APP_MESSAGES } from '@/constants/messages';
import { useTerminalMetrics } from '@/hooks/useTerminalMetrics';
import { colors, radii, spacing } from '@/theme';

import type { EpiId } from '../types';

import { EpiGridItem } from './EpiGridItem';

export interface EpiGridProps {
  activeIds: readonly EpiId[];
  /** Quando falso, os equipamentos inativos são ocultados em vez de esmaecidos. */
  showInactive?: boolean;
}

/** Grade "N equipamentos exigidos" da tela inicial. */
export const EpiGrid = ({ activeIds, showInactive = true }: EpiGridProps) => {
  const metrics = useTerminalMetrics();

  const items = showInactive
    ? EPI_CATALOG
    : EPI_CATALOG.filter((item) => activeIds.includes(item.id));

  const activeCount = activeIds.length;
  const countLabel =
    activeCount === 1
      ? APP_MESSAGES.home.equipmentCountSuffixSingular
      : APP_MESSAGES.home.equipmentCountSuffix;

  const cellWidth = `${100 / metrics.epiColumns}%` as const;

  return (
    <View style={styles.container}>
      <Text variant={metrics.sectionLabel} color={colors.primaryDark} align="center">
        {`${activeCount} ${countLabel}`}
      </Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={[styles.cell, { width: cellWidth }]}>
            <EpiGridItem item={item} active={activeIds.includes(item.id)} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /**
   * Azul bem claro: marca a região como "os equipamentos exigidos" sem
   * competir com o botão de ação, que é o azul forte da tela.
   */
  container: {
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.primaryOn,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  cell: {
    paddingHorizontal: spacing.xs,
  },
});
