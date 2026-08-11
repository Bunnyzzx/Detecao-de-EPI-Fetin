import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, radii, spacing } from '@/theme';

/** Painel azul de abertura, equivalente à coluna esquerda do protótipo. */
export const HomeHero = () => (
  <LinearGradient
    colors={[colors.primaryDark, colors.primaryDeep]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.container}
  >
    <View style={styles.decorationBottom} />
    <View style={styles.decorationTop} />

    <View style={styles.topRow}>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text variant="overline" color={colors.primaryOn}>
          {APP_MESSAGES.home.restrictedBadge}
        </Text>
      </View>
    </View>

    <View style={styles.emblem}>
      <MaterialCommunityIcons name="hard-hat" size={46} color={colors.white} />
    </View>

    <Text variant="display" color={colors.white} align="center">
      {APP_MESSAGES.home.title}
    </Text>
    <Text variant="body" color={colors.primaryOn} align="center" style={styles.subtitle}>
      {APP_MESSAGES.home.subtitle}
    </Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  decorationBottom: {
    position: 'absolute',
    left: -60,
    bottom: -70,
    width: 190,
    height: 190,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorationTop: {
    position: 'absolute',
    right: -50,
    top: -60,
    width: 150,
    height: 150,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  badge: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  emblem: {
    width: 92,
    height: 92,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    marginBottom: spacing.md,
  },
  subtitle: {
    maxWidth: 340,
  },
});
