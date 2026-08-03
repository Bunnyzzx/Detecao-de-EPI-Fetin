import type { DetectionStatus, EpiDetectionResult, EpiId } from '@/features/epi-detection/types';
import { buildDetectionResult } from '@/features/epi-detection/utils/buildDetectionResult';

import { buildDashboardMetrics } from '../dashboardMetrics';

const NOW = new Date('2026-08-03T15:00:00.000Z');

const daysBefore = (days: number): string =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

const makeResult = (
  id: string,
  status: DetectionStatus,
  analyzedAt: string,
  missing: EpiId[] = [],
): EpiDetectionResult => {
  const required: EpiId[] = ['capacete', 'colete', 'oculos'];

  const result = buildDetectionResult({
    id,
    analyzedAt,
    imageUri: `file:///${id}.jpg`,
    requiredItems: required,
    detections: required.map((epiId) => ({
      id: epiId,
      detected: !missing.includes(epiId),
      confidence: missing.includes(epiId) ? 0.2 : 0.95,
    })),
    source: 'camera',
    engine: 'mock',
    processingTimeMs: 900,
  });

  // O status é fixado nos testes para isolar o cálculo dos indicadores.
  return { ...result, status };
};

describe('buildDashboardMetrics', () => {
  it('devolve indicadores zerados quando não há histórico', () => {
    const metrics = buildDashboardMetrics([], NOW);

    expect(metrics.total).toBe(0);
    expect(metrics.today).toBe(0);
    expect(metrics.week).toBe(0);
    expect(metrics.complianceRate).toBe(0);
    expect(metrics.weekly).toHaveLength(7);
    expect(metrics.topMissing).toEqual([]);
  });

  it('conta as verificações de hoje e da semana', () => {
    const metrics = buildDashboardMetrics(
      [
        makeResult('a', 'approved', daysBefore(0)),
        makeResult('b', 'rejected', daysBefore(0), ['oculos', 'colete']),
        makeResult('c', 'approved', daysBefore(3)),
        makeResult('d', 'approved', daysBefore(20)),
      ],
      NOW,
    );

    expect(metrics.total).toBe(4);
    expect(metrics.today).toBe(2);
    expect(metrics.week).toBe(3);
  });

  it('calcula a taxa de conformidade sobre o total de análises', () => {
    const metrics = buildDashboardMetrics(
      [
        makeResult('a', 'approved', daysBefore(0)),
        makeResult('b', 'approved', daysBefore(1)),
        makeResult('c', 'rejected', daysBefore(1), ['oculos', 'colete']),
        makeResult('d', 'warning', daysBefore(2), ['oculos']),
      ],
      NOW,
    );

    expect(metrics.complianceRate).toBeCloseTo(0.5);
  });

  it('distribui as análises da semana entre conformes e não conformes', () => {
    const metrics = buildDashboardMetrics(
      [
        makeResult('a', 'approved', daysBefore(0)),
        makeResult('b', 'rejected', daysBefore(0), ['oculos', 'colete']),
      ],
      NOW,
    );

    const todayBucket = metrics.weekly[6];
    expect(todayBucket?.compliant).toBe(1);
    expect(todayBucket?.nonCompliant).toBe(1);
  });

  it('ordena os EPIs mais ausentes', () => {
    const metrics = buildDashboardMetrics(
      [
        makeResult('a', 'warning', daysBefore(0), ['oculos']),
        makeResult('b', 'warning', daysBefore(1), ['oculos']),
        makeResult('c', 'warning', daysBefore(2), ['colete']),
      ],
      NOW,
    );

    expect(metrics.topMissing[0]).toMatchObject({ id: 'oculos', count: 2 });
    expect(metrics.topMissing[1]).toMatchObject({ id: 'colete', count: 1 });
  });

  it('monta a distribuição por status com as proporções corretas', () => {
    const metrics = buildDashboardMetrics(
      [
        makeResult('a', 'approved', daysBefore(0)),
        makeResult('b', 'rejected', daysBefore(0), ['oculos', 'colete']),
      ],
      NOW,
    );

    const approved = metrics.distribution.find((entry) => entry.status === 'approved');
    expect(approved).toMatchObject({ count: 1 });
    expect(approved?.ratio).toBeCloseTo(0.5);
  });
});
