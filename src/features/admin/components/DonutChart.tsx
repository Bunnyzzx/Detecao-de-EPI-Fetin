import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel: string;
  centerCaption: string;
}

/** Rosca do "Resultado geral", desenhada com arcos de SVG. */
export const DonutChart = ({
  slices,
  size = 150,
  strokeWidth = 20,
  centerLabel,
  centerCaption,
}: DonutChartProps) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAccumulator = 0;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.slate[100]}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {total > 0
            ? slices.map((slice) => {
                const fraction = slice.value / total;
                const dash = fraction * circumference;
                const circle = (
                  <Circle
                    key={slice.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offsetAccumulator}
                    strokeLinecap="butt"
                    fill="none"
                    // Começa o primeiro arco no topo do círculo.
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                );
                offsetAccumulator += dash;
                return circle;
              })
            : null}
        </Svg>

        <View style={styles.center} pointerEvents="none">
          <Text variant="title">{centerLabel}</Text>
          <Text variant="micro" color={colors.slate[400]}>
            {centerCaption}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        {slices.map((slice) => (
          <View key={slice.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text variant="caption" color={colors.slate[600]}>
              {`${slice.label} · ${slice.value}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
});
