import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

import type { EpiCatalogItem } from '../types';

export interface EpiGridItemProps {
  item: EpiCatalogItem;
  /** Itens inativos aparecem esmaecidos, como na pré-visualização do admin. */
  active?: boolean;
}

/** Cartão de equipamento exibido na grade da tela inicial. */
export const EpiGridItem = ({ item, active = true }: EpiGridItemProps) => (
  <View
    accessible
    accessibilityLabel={`${item.label}. ${item.description}. ${active ? 'Ativo' : 'Inativo'}`}
    style={[styles.container, active ? null : styles.inactive]}
  >
    <View style={[styles.iconWrapper, active ? styles.iconActive : styles.iconInactive]}>
      <MaterialCommunityIcons
        name={item.icon}
        size={20}
        color={active ? colors.primary : colors.slate[400]}
      />
    </View>
    <Text variant="captionStrong" color={active ? colors.slate[700] : colors.slate[400]}>
      {item.label}
    </Text>
    <Text variant="micro" color={colors.slate[400]}>
      {item.description}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 96,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  inactive: {
    opacity: 0.55,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: colors.primarySoft,
  },
  iconInactive: {
    backgroundColor: colors.slate[100],
  },
});
