import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, spacing, MIN_TOUCH_TARGET } from '@/theme';

import { Text } from './Text';

export interface OptionGroupOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface OptionGroupProps<TValue extends string> {
  label: string;
  options: readonly OptionGroupOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  errorMessage?: string;
}

/** Seleção em "chips", usada no lugar de um `select` no mobile. */
export const OptionGroup = <TValue extends string>({
  label,
  options,
  value,
  onChange,
  errorMessage,
}: OptionGroupProps<TValue>) => (
  <View style={styles.container}>
    <Text variant="captionStrong" color={colors.slate[600]}>
      {label}
    </Text>

    <View style={styles.options} accessibilityRole="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${label}: ${option.label}`}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              isSelected ? styles.chipSelected : null,
              pressed ? styles.chipPressed : null,
            ]}
          >
            <Text variant="captionStrong" color={isSelected ? colors.white : colors.slate[600]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>

    {errorMessage ? (
      <Text variant="caption" color={colors.status.rejectedText}>
        {errorMessage}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    justifyContent: 'center',
    minHeight: MIN_TOUCH_TARGET - 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.slate[200],
    backgroundColor: colors.slate[50],
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.8,
  },
});
