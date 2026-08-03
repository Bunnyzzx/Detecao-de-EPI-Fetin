import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { Card, SectionHeader, Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useDetectionHistory } from '@/features/epi-detection/hooks/useDetectionHistory';
import { getStatusPresentation } from '@/features/epi-detection/utils/statusPresentation';
import { colors, radii, spacing } from '@/theme';
import { formatConfidence, pluralize } from '@/utils';

import { buildDashboardMetrics } from '../../utils/dashboardMetrics';
import { BarChart } from '../BarChart';
import { DonutChart } from '../DonutChart';
import { MetricCard } from '../MetricCard';

export const DashboardSection = () => {
  const { items, loading, error, reload } = useDetectionHistory();
  const metrics = useMemo(() => buildDashboardMetrics(items), [items]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => void reload()} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title={APP_MESSAGES.admin.dashboardTitle}
        subtitle={APP_MESSAGES.admin.dashboardSubtitle}
      />

      <View style={styles.metricsRow}>
        <MetricCard
          label={APP_MESSAGES.admin.checksToday}
          value={String(metrics.today)}
          icon="camera"
        />
        <MetricCard
          label={APP_MESSAGES.admin.checksWeek}
          value={String(metrics.week)}
          icon="calendar-week"
          accentColor={colors.accent}
        />
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          label={APP_MESSAGES.admin.complianceRateTitle}
          value={formatConfidence(metrics.complianceRate)}
          icon="chart-donut"
          accentColor={colors.status.approvedDark}
        />
        <MetricCard
          label={APP_MESSAGES.admin.systemOperational}
          value="OK"
          icon="shield-check"
          accentColor={colors.status.approved}
        />
      </View>

      {metrics.total === 0 ? (
        <Card variant="outlined">
          <EmptyState
            icon="chart-line"
            title={APP_MESSAGES.admin.dashboardEmptyTitle}
            description={APP_MESSAGES.admin.dashboardEmptyDescription}
            compact
          />
        </Card>
      ) : (
        <>
          <Card>
            <Text variant="subheading">{APP_MESSAGES.admin.weeklyChartTitle}</Text>
            <Text variant="micro" color={colors.slate[400]} style={styles.chartSubtitle}>
              {APP_MESSAGES.admin.weeklyChartSubtitle}
            </Text>
            <BarChart
              categories={metrics.weekly.map((bucket) => bucket.label)}
              series={[
                {
                  label: APP_MESSAGES.admin.compliant,
                  color: colors.status.approved,
                  values: metrics.weekly.map((bucket) => bucket.compliant),
                },
                {
                  label: APP_MESSAGES.admin.nonCompliant,
                  color: colors.status.rejected,
                  values: metrics.weekly.map((bucket) => bucket.nonCompliant),
                },
              ]}
            />
          </Card>

          <Card>
            <Text variant="subheading">{APP_MESSAGES.admin.overallResultTitle}</Text>
            <Text variant="micro" color={colors.slate[400]} style={styles.chartSubtitle}>
              {pluralize(metrics.total, 'verificação registrada', 'verificações registradas')}
            </Text>
            <DonutChart
              slices={metrics.distribution.map((entry) => {
                const presentation = getStatusPresentation(entry.status);
                return {
                  label: presentation.shortLabel,
                  value: entry.count,
                  color: presentation.color,
                };
              })}
              centerLabel={formatConfidence(metrics.complianceRate)}
              centerCaption="aprovadas"
            />
          </Card>

          {metrics.topMissing.length > 0 ? (
            <Card>
              <Text variant="subheading">{APP_MESSAGES.admin.topMissingTitle}</Text>
              <Text variant="micro" color={colors.slate[400]} style={styles.chartSubtitle}>
                {APP_MESSAGES.admin.topMissingSubtitle}
              </Text>

              <View style={styles.missingList}>
                {metrics.topMissing.map((entry) => {
                  const maxCount = metrics.topMissing[0]?.count ?? 1;
                  return (
                    <View key={entry.id} style={styles.missingRow}>
                      <Text variant="caption" color={colors.slate[600]} style={styles.missingLabel}>
                        {entry.label}
                      </Text>
                      <View style={styles.missingTrack}>
                        <View
                          style={[
                            styles.missingFill,
                            { width: `${(entry.count / maxCount) * 100}%` },
                          ]}
                        />
                      </View>
                      <Text variant="captionStrong" color={colors.slate[700]}>
                        {entry.count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chartSubtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
  },
  missingList: {
    gap: spacing.md,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  missingLabel: {
    width: 110,
  },
  missingTrack: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.slate[100],
    overflow: 'hidden',
  },
  missingFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.status.rejected,
  },
});
