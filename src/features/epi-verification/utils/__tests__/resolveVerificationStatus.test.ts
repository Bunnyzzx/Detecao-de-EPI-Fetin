import { describe, expect, it } from 'vitest';

import type { DetectedEpi } from '../../types';
import { hasLowConfidence, resolveVerificationStatus } from '../resolveVerificationStatus';

const makeItem = (id: DetectedEpi['id'], confidence: number, detected: boolean): DetectedEpi => ({
  id,
  label: id,
  description: '',
  confidence,
  detected,
});

describe('resolveVerificationStatus', () => {
  it('aprova quando todos os equipamentos estão presentes com boa confiança', () => {
    expect(
      resolveVerificationStatus({
        detectedItems: [makeItem('capacete', 0.95, true), makeItem('colete', 0.9, true)],
        missingItems: [],
        requiredCount: 2,
        overallConfidence: 0.92,
      }),
    ).toBe('approved');
  });

  it('sinaliza atenção quando nada falta mas a confiança é baixa', () => {
    expect(
      resolveVerificationStatus({
        detectedItems: [makeItem('capacete', 0.62, true)],
        missingItems: [],
        requiredCount: 1,
        overallConfidence: 0.62,
      }),
    ).toBe('warning');
  });

  it('sinaliza atenção com exatamente um ausente entre três ou mais exigidos', () => {
    expect(
      resolveVerificationStatus({
        detectedItems: [
          makeItem('capacete', 0.95, true),
          makeItem('colete', 0.93, true),
          makeItem('botas', 0.9, true),
        ],
        missingItems: [makeItem('oculos', 0.2, false)],
        requiredCount: 4,
        overallConfidence: 0.93,
      }),
    ).toBe('warning');
  });

  it('reprova com dois ou mais equipamentos ausentes', () => {
    expect(
      resolveVerificationStatus({
        detectedItems: [makeItem('capacete', 0.95, true)],
        missingItems: [makeItem('oculos', 0.1, false), makeItem('luvas', 0.2, false)],
        requiredCount: 3,
        overallConfidence: 0.95,
      }),
    ).toBe('rejected');
  });

  it('reprova quando há ausência com menos de três equipamentos exigidos', () => {
    expect(
      resolveVerificationStatus({
        detectedItems: [makeItem('capacete', 0.95, true)],
        missingItems: [makeItem('colete', 0.2, false)],
        requiredCount: 2,
        overallConfidence: 0.95,
      }),
    ).toBe('rejected');
  });

  it('reprova quando nenhum equipamento foi reconhecido', () => {
    expect(
      resolveVerificationStatus({
        detectedItems: [],
        missingItems: [makeItem('capacete', 0, false)],
        requiredCount: 1,
        overallConfidence: 0,
      }),
    ).toBe('rejected');
  });

  it('reprova quando não há equipamentos exigidos', () => {
    expect(
      resolveVerificationStatus({
        detectedItems: [],
        missingItems: [],
        requiredCount: 0,
        overallConfidence: 0,
      }),
    ).toBe('rejected');
  });
});

describe('hasLowConfidence', () => {
  it('identifica resultados abaixo do limiar', () => {
    expect(
      hasLowConfidence({
        detectedItems: [makeItem('capacete', 0.5, true)],
        overallConfidence: 0.5,
      }),
    ).toBe(true);
  });

  it('não sinaliza quando nada foi detectado', () => {
    expect(hasLowConfidence({ detectedItems: [], overallConfidence: 0 })).toBe(false);
  });
});
