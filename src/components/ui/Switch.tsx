import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii } from '@/theme';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

/** Interruptor com aparência alinhada ao protótipo, em vez do nativo. */
export const Switch = ({ value, onValueChange, accessibilityLabel, disabled }: SwitchProps) => (
  <Pressable
    accessibilityRole="switch"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
    disabled={disabled}
    hitSlop={10}
    onPress={() => onValueChange(!value)}
    style={[
      styles.track,
      { backgroundColor: value ? colors.primary : colors.slate[300] },
      disabled ? styles.disabled : null,
    ]}
  >
    <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
  </Pressable>
);

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: radii.pill,
    justifyContent: 'center',
    padding: 3,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  thumbOff: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
});
