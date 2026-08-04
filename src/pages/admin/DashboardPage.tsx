import { CalendarDays, ChartLine, ChartPie, ScanLine, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { EmptyState } from '@/components/feedback';
import { Card, ProgressBar } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { MetricCard } from '@/features/admin/components/MetricCard';
import { buildDashboardMetrics } from '@/features/admin/utils/dashboardMetrics';
import { useVerificationHistory } from '@/features/epi-verification/hooks';
import { getStatusPresentation } from '@/features/epi-verification/utils';
import { formatConfidence, pluralize } from '@/utils';

import styles from './adminPage.module.css';

const AXIS_STYLE = { fontSize: 11, fill: '#94a3b8' } as const;

export const DashboardPage = () => {
  const { items } = useVerificationHistory();
  const metrics = useMemo(() => buildDashboardMetrics(items), [items]);

  const weeklyData = metrics.weekly.map((bucket) => ({
    dia: bucket.label,
    [APP_MESSAGES.admin.compliant]: bucket.compliant,
    [APP_MESSAGES.admin.nonCompliant]: bucket.nonCompliant,
  }));

  const distributionData = metrics.distribution
    .filter((entry) => entry.count > 0)
    .map((entry) => {
      const presentation = getStatusPresentation(entry.status);
      return { name: presentation.shortLabel, value: entry.count, color: presentation.color };
    });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{APP_MESSAGES.admin.dashboardTitle}</h1>
          <p className={styles.subtitle}>{APP_MESSAGES.admin.dashboardSubtitle}</p>
        </div>
      </header>

      <div className={styles.metrics}>
        <MetricCard
          label={APP_MESSAGES.admin.checksToday}
          value={String(metrics.today)}
          icon={ScanLine}
        />
        <MetricCard
          label={APP_MESSAGES.admin.checksWeek}
          value={String(metrics.week)}
          icon={CalendarDays}
          tone="accent"
        />
        <MetricCard
          label={APP_MESSAGES.admin.complianceRateTitle}
          value={formatConfidence(metrics.complianceRate)}
          icon={ChartPie}
          tone="approved"
        />
        <MetricCard
          label={APP_MESSAGES.admin.systemOperational}
          value="OK"
          icon={ShieldCheck}
          tone="approved"
        />
      </div>

      {metrics.total === 0 ? (
        <Card variant="outlined">
          <EmptyState
            icon={ChartLine}
            title={APP_MESSAGES.admin.dashboardEmptyTitle}
            description={APP_MESSAGES.admin.dashboardEmptyDescription}
            compact
          />
        </Card>
      ) : (
        <>
          <div className={styles.charts}>
            <Card>
              <h2 className={styles.cardTitle}>{APP_MESSAGES.admin.weeklyChartTitle}</h2>
              <p className={styles.cardSubtitle}>{APP_MESSAGES.admin.weeklyChartSubtitle}</p>

              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="dia" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={AXIS_STYLE}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey={APP_MESSAGES.admin.compliant}
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey={APP_MESSAGES.admin.nonCompliant}
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h2 className={styles.cardTitle}>{APP_MESSAGES.admin.overallResultTitle}</h2>
              <p className={styles.cardSubtitle}>
                {pluralize(metrics.total, 'verificação registrada', 'verificações registradas')}
              </p>

              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                    >
                      {distributionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {metrics.topMissing.length > 0 && (
            <Card>
              <h2 className={styles.cardTitle}>{APP_MESSAGES.admin.topMissingTitle}</h2>
              <p className={styles.cardSubtitle}>{APP_MESSAGES.admin.topMissingSubtitle}</p>

              <ul className={styles.list}>
                {metrics.topMissing.map((entry) => {
                  const maxCount = metrics.topMissing[0]?.count ?? 1;
                  return (
                    <li key={entry.id} className={styles.rankingRow}>
                      <span className={styles.rankingLabel}>{entry.label}</span>
                      <ProgressBar
                        value={entry.count / maxCount}
                        tone="rejected"
                        label={`Não detecções de ${entry.label}`}
                      />
                      <span className={styles.rankingCount}>{entry.count}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
