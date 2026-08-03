import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, radii, spacing } from '@/theme';

export type FlowStep = 'start' | 'verification' | 'access';

const STEPS: { key: FlowStep; label: string }[] = [
  { key: 'start', label: APP_MESSAGES.steps.start },
  { key: 'verification', label: APP_MESSAGES.steps.verification },
  { key: 'access', label: APP_MESSAGES.steps.access },
];

export interface StepIndicatorProps {
  currentStep: FlowStep;
  tone?: 'light' | 'dark';
}

/** Rodapé "1 Início · 2 Verificação · 3 Acesso" do protótipo. */
export const StepIndicator = ({ currentStep, tone = 'light' }: StepIndicatorProps) => {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep);
  const isDark = tone === 'dark';

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const circleColor = isCompleted
          ? colors.status.approved
          : isActive
            ? colors.primary
            : isDark
              ? colors.overlayLight
              : colors.slate[200];
        const labelColor = isActive
          ? isDark
            ? colors.white
            : colors.slate[800]
          : isDark
            ? colors.slate[500]
            : colors.slate[400];

        return (
          <View key={step.key} style={styles.step}>
            <View style={[styles.circle, { backgroundColor: circleColor }]}>
              {isCompleted ? (
                <MaterialCommunityIcons name="check" size={13} color={colors.white} />
              ) : (
                <Text
                  variant="micro"
                  color={isActive ? colors.white : isDark ? colors.slate[400] : colors.slate[500]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text variant="micro" color={labelColor}>
              {step.label}
            </Text>
            {index < STEPS.length - 1 ? (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: isCompleted
                      ? colors.status.approved
                      : isDark
                        ? colors.overlayBorder
                        : colors.slate[200],
                  },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 26,
    height: 2,
    marginHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
});
