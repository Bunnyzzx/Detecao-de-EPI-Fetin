import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { EPI_CATALOG } from '@/constants/epiCatalog';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, radii, spacing } from '@/theme';

import type { EpiId } from '../types';

import { EpiGridItem } from './EpiGridItem';

export interface EpiGridProps {
  activeIds: readonly EpiId[];
  /** Quando falso, os equipamentos inativos são ocultados em vez de esmaecidos. */
  showInactive?: boolean;
}

/** Grade "N equipamentos ativos para verificação" da tela inicial. */
export const EpiGrid = ({ activeIds, showInactive = true }: EpiGridProps) => {
  const items = showInactive
    ? EPI_CATALOG
    : EPI_CATALOG.filter((item) => activeIds.includes(item.id));

  const activeCount = activeIds.length;
  const countLabel =
    activeCount === 1
      ? APP_MESSAGES.home.equipmentCountSuffixSingular
      : APP_MESSAGES.home.equipmentCountSuffix;

  return (
    <View style={styles.container}>
      <Text variant="overline" color={colors.slate[500]}>
        {`${activeCount} ${countLabel}`}
      </Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.id} style={styles.cell}>
            <EpiGridItem item={item} active={activeIds.includes(item.id)} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.slate[50],
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.slate[100],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  cell: {
    // Três colunas mantêm os rótulos legíveis mesmo em telas de 320 px.
    width: '33.33%',
    paddingRight: spacing.sm,
  },
});
