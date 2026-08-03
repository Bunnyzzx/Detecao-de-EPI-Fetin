import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useClock } from '@/hooks/useClock';
import { colors, radii, spacing } from '@/theme';

export interface TerminalStatusBarProps {
  tone?: 'light' | 'dark';
  connected?: boolean;
}

/**
 * Faixa superior do protótipo com identificação do terminal, estado de conexão,
 * hora e data. Em telas estreitas a data é omitida para não truncar o texto.
 */
export const TerminalStatusBar = ({ tone = 'light', connected = true }: TerminalStatusBarProps) => {
  const now = useClock();
  const isDark = tone === 'dark';

  const mutedColor = isDark ? colors.slate[400] : colors.slate[500];
  const strongColor = isDark ? colors.slate[200] : colors.slate[700];
  const statusColor = connected ? colors.status.approvedDark : colors.status.warningDark;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.scanner.background : colors.white,
          borderBottomColor: isDark ? colors.overlayBorder : colors.slate[100],
        },
      ]}
    >
      <View style={styles.identity}>
        <MaterialCommunityIcons name="shield-check" size={16} color={colors.primary} />
        <Text variant="micro" color={mutedColor} numberOfLines={1} style={styles.terminalLabel}>
          {APP_MESSAGES.system.terminalLabel}
        </Text>
      </View>

      <View style={styles.meta}>
        <View style={styles.connection}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text variant="micro" color={mutedColor}>
            {connected ? APP_MESSAGES.system.connected : APP_MESSAGES.system.offline}
          </Text>
        </View>
        <Text variant="captionStrong" color={strongColor}>
          {now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  terminalLabel: {
    flexShrink: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  connection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radii.pill,
  },
});
