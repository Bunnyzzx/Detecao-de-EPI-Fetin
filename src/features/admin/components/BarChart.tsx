import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

export interface BarChartSeries {
  label: string;
  color: string;
  values: number[];
}

export interface BarChartProps {
  categories: string[];
  series: BarChartSeries[];
  height?: number;
}

/**
 * Gráfico de barras agrupadas desenhado com views. Evita uma dependência de
 * gráficos só para dois formatos simples e mantém o bundle enxuto.
 */
export const BarChart = ({ categories, series, height = 140 }: BarChartProps) => {
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));

  return (
    <View style={styles.container}>
      <View style={[styles.plot, { height }]}>
        {categories.map((category, index) => (
          <View key={category + String(index)} style={styles.column}>
            <View style={styles.bars}>
              {series.map((serie) => {
                const value = serie.values[index] ?? 0;
                return (
                  <View
                    key={serie.label}
                    accessible
                    accessibilityLabel={`${category}, ${serie.label}: ${value}`}
                    style={[
                      styles.bar,
                      {
                        backgroundColor: serie.color,
                        height: Math.max(value === 0 ? 2 : 6, (value / maxValue) * (height - 24)),
                        opacity: value === 0 ? 0.25 : 1,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <Text variant="micro" color={colors.slate[400]}>
              {category}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        {series.map((serie) => (
          <View key={serie.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: serie.color }]} />
            <Text variant="micro" color={colors.slate[500]}>
              {serie.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 9,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
});
