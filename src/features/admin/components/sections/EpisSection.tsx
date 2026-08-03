import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ErrorState, LoadingState } from '@/components/feedback';
import { Card, SectionHeader, Switch, Text } from '@/components/ui';
import { EPI_CATALOG } from '@/constants/epiCatalog';
import { APP_MESSAGES } from '@/constants/messages';
import { EpiGrid } from '@/features/epi-detection/components';
import { useRequiredEpis } from '@/features/epi-detection/hooks/useRequiredEpis';
import type { EpiId } from '@/features/epi-detection/types';
import { colors, radii, spacing } from '@/theme';

export const EpisSection = () => {
  const { requiredEpis, loading, error, reload, setRequiredEpis } = useRequiredEpis();

  const toggle = useCallback(
    (id: EpiId, enabled: boolean) => {
      const next = enabled
        ? [...requiredEpis, id]
        : requiredEpis.filter((current) => current !== id);

      // Pelo menos um equipamento precisa continuar ativo para a verificação.
      if (next.length === 0) {
        return;
      }

      void setRequiredEpis(EPI_CATALOG.filter((item) => next.includes(item.id)).map((i) => i.id));
    },
    [requiredEpis, setRequiredEpis],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => void reload()} />;
  }

  const isLastActive = requiredEpis.length === 1;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title={APP_MESSAGES.admin.episTitle}
        subtitle={APP_MESSAGES.admin.episSubtitle}
      />

      <Card>
        <Text variant="subheading">{APP_MESSAGES.admin.episAvailable}</Text>

        <View style={styles.list}>
          {EPI_CATALOG.map((item) => {
            const isActive = requiredEpis.includes(item.id);
            return (
              <View key={item.id} style={styles.row}>
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={isActive ? colors.primary : colors.slate[400]}
                  />
                </View>

                <View style={styles.rowTexts}>
                  <Text
                    variant="bodyStrong"
                    color={isActive ? colors.slate[800] : colors.slate[500]}
                  >
                    {item.label}
                  </Text>
                  <Text variant="micro" color={colors.slate[400]}>
                    {item.description}
                  </Text>
                </View>

                <Switch
                  value={isActive}
                  onValueChange={(next) => toggle(item.id, next)}
                  accessibilityLabel={`${item.label}: ${isActive ? 'ativo' : 'inativo'}`}
                  disabled={isActive && isLastActive}
                />
              </View>
            );
          })}
        </View>

        {isLastActive ? (
          <Text variant="caption" color={colors.status.warningText} style={styles.warning}>
            {APP_MESSAGES.admin.episMinimumWarning}
          </Text>
        ) : null}
      </Card>

      <Card>
        <Text variant="subheading">{APP_MESSAGES.admin.episPreview}</Text>
        <Text variant="micro" color={colors.slate[400]} style={styles.previewCaption}>
          {APP_MESSAGES.admin.episLiveConfig}
        </Text>
        <EpiGrid activeIds={requiredEpis} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.slate[50],
  },
  rowTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
  warning: {
    marginTop: spacing.lg,
  },
  previewCaption: {
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
  },
});
