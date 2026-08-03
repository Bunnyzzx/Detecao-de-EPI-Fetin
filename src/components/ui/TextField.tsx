import { MaterialCommunityIcons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import type { MaterialCommunityIconName } from '@/features/epi-detection/types';
import { colors, radii, spacing, MIN_TOUCH_TARGET } from '@/theme';

import { Text } from './Text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  errorMessage?: string;
  icon?: MaterialCommunityIconName;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, errorMessage, icon, style, ...rest }, ref) => {
    const hasError = Boolean(errorMessage);

    return (
      <View style={styles.container}>
        <Text variant="captionStrong" color={colors.slate[600]}>
          {label}
        </Text>
        <View style={[styles.inputWrapper, hasError ? styles.inputWrapperError : null]}>
          {icon ? <MaterialCommunityIcons name={icon} size={18} color={colors.slate[400]} /> : null}
          <TextInput
            ref={ref}
            accessibilityLabel={label}
            placeholderTextColor={colors.slate[400]}
            style={[styles.input, style]}
            {...rest}
          />
        </View>
        {hasError ? (
          <Text variant="caption" color={colors.status.rejectedText}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.slate[200],
    backgroundColor: colors.slate[50],
  },
  inputWrapperError: {
    borderColor: colors.status.rejected,
    backgroundColor: colors.status.rejectedSoft,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.slate[900],
  },
});
