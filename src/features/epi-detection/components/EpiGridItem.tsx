import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTerminalMetrics } from '@/hooks/useTerminalMetrics';
import { colors, radii, spacing } from '@/theme';

import type { EpiCatalogItem } from '../types';

export interface EpiGridItemProps {
  item: EpiCatalogItem;
  /** Itens inativos aparecem esmaecidos, como na pré-visualização do admin. */
  active?: boolean;
}

/** Cartão de equipamento exibido na grade da tela inicial. */
export const EpiGridItem = ({ item, active = true }: EpiGridItemProps) => {
  const metrics = useTerminalMetrics();

  return (
    <View
      accessible
      accessibilityLabel={`${item.label}. ${item.description}. ${active ? 'Ativo' : 'Inativo'}`}
      style={[styles.container, active ? null : styles.inactive]}
    >
      <View
        style={[
          styles.iconWrapper,
          { width: metrics.epiIconBoxSize, height: metrics.epiIconBoxSize },
          active ? styles.iconActive : styles.iconInactive,
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={metrics.epiIconSize}
          color={active ? colors.primary : colors.slate[400]}
        />
      </View>

      <Text
        variant={metrics.epiLabel}
        color={active ? colors.slate[800] : colors.slate[400]}
        align="center"
      >
        {item.label}
      </Text>
      <Text variant={metrics.epiDescription} color={colors.slate[500]} align="center">
        {item.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 96,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  inactive: {
    opacity: 0.55,
  },
  iconWrapper: {
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: colors.white,
  },
  iconInactive: {
    backgroundColor: colors.slate[100],
  },
});
