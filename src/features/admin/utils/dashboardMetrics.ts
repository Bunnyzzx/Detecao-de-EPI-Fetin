import { EPI_CATALOG } from '@/constants/epiCatalog';
import type { DetectionStatus, EpiDetectionResult, EpiId } from '@/features/epi-detection/types';

export interface DailyBucket {
  /** Rótulo curto do dia da semana, ex.: "Seg". */
  label: string;
  compliant: number;
  nonCompliant: number;
}

export interface StatusDistribution {
  status: DetectionStatus;
  count: number;
  ratio: number;
}

export interface MissingEpiCount {
  id: EpiId;
  label: string;
  count: number;
}

export interface DashboardMetrics {
  total: number;
  today: number;
  week: number;
  complianceRate: number;
  weekly: DailyBucket[];
  distribution: StatusDistribution[];
  topMissing: MissingEpiCount[];
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const labelForDay = (date: Date): string => WEEKDAY_LABELS[date.getDay()] ?? '';

/**
 * Indicadores do painel derivados do histórico local — no protótipo os números
 * eram fixos; aqui refletem as análises realmente realizadas no aparelho.
 */
export const buildDashboardMetrics = (
  results: EpiDetectionResult[],
  now: Date = new Date(),
): DashboardMetrics => {
  const todayStart = startOfDay(now);
  const dayInMs = 24 * 60 * 60 * 1000;

  const weekly: DailyBucket[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayStart - (6 - index) * dayInMs);
    return { label: labelForDay(date), compliant: 0, nonCompliant: 0 };
  });

  const statusCounts: Record<DetectionStatus, number> = { approved: 0, warning: 0, rejected: 0 };
  const missingCounts = new Map<EpiId, number>();

  let today = 0;
  let week = 0;

  results.forEach((result) => {
    const analyzedAt = new Date(result.analyzedAt);
    const analyzedDayStart = startOfDay(analyzedAt);
    const daysAgo = Math.round((todayStart - analyzedDayStart) / dayInMs);

    statusCounts[result.status] += 1;
    result.missingItems.forEach((item) => {
      missingCounts.set(item.id, (missingCounts.get(item.id) ?? 0) + 1);
    });

    if (daysAgo === 0) {
      today += 1;
    }

    if (daysAgo >= 0 && daysAgo <= 6) {
      week += 1;
      const bucket = weekly[6 - daysAgo];
      if (bucket) {
        if (result.status === 'approved') {
          bucket.compliant += 1;
        } else {
          bucket.nonCompliant += 1;
        }
      }
    }
  });

  const total = results.length;

  const distribution: StatusDistribution[] = (
    ['approved', 'warning', 'rejected'] as DetectionStatus[]
  ).map((status) => ({
    status,
    count: statusCounts[status],
    ratio: total === 0 ? 0 : statusCounts[status] / total,
  }));

  const topMissing: MissingEpiCount[] = EPI_CATALOG.map((item) => ({
    id: item.id,
    label: item.label,
    count: missingCounts.get(item.id) ?? 0,
  }))
    .filter((item) => item.count > 0)
    .sort((first, second) => second.count - first.count)
    .slice(0, 5);

  return {
    total,
    today,
    week,
    complianceRate: total === 0 ? 0 : statusCounts.approved / total,
    weekly,
    distribution,
    topMissing,
  };
};
