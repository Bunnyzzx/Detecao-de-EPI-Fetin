import { describe, expect, it } from 'vitest';

import { buildVerificationResult } from '../buildVerificationResult';

const baseInput = { engine: 'mock' as const, durationMs: 1200 };

describe('buildVerificationResult', () => {
  it('enriquece as detecções com os dados do catálogo', () => {
    const result = buildVerificationResult({
      ...baseInput,
      requiredItems: ['capacete'],
      detections: [{ id: 'capacete', detected: true, confidence: 0.97 }],
    });

    expect(result.detectedItems[0]).toMatchObject({
      id: 'capacete',
      label: 'Capacete',
      description: 'Proteção da cabeça',
      detected: true,
    });
  });

  it('separa detectados de ausentes conforme os itens exigidos', () => {
    const result = buildVerificationResult({
      ...baseInput,
      requiredItems: ['capacete', 'oculos', 'luvas'],
      detections: [
        { id: 'capacete', detected: true, confidence: 0.95 },
        { id: 'oculos', detected: false, confidence: 0.3 },
      ],
    });

    expect(result.detectedItems.map((item) => item.id)).toEqual(['capacete']);
    expect(result.missingItems.map((item) => item.id)).toEqual(['oculos', 'luvas']);
  });

  it('trata como ausente uma detecção abaixo da confiança mínima', () => {
    const result = buildVerificationResult({
      ...baseInput,
      requiredItems: ['capacete'],
      detections: [{ id: 'capacete', detected: true, confidence: 0.4 }],
    });

    expect(result.detectedItems).toHaveLength(0);
    expect(result.missingItems.map((item) => item.id)).toEqual(['capacete']);
  });

  it('ignora detecções de itens que não são exigidos', () => {
    const result = buildVerificationResult({
      ...baseInput,
      requiredItems: ['capacete'],
      detections: [
        { id: 'capacete', detected: true, confidence: 0.95 },
        { id: 'botas', detected: true, confidence: 0.9 },
      ],
    });

    expect(result.detectedItems).toHaveLength(1);
    expect(result.missingItems).toHaveLength(0);
  });

  it('calcula a confiança geral como média dos itens detectados', () => {
    const result = buildVerificationResult({
      ...baseInput,
      requiredItems: ['capacete', 'colete'],
      detections: [
        { id: 'capacete', detected: true, confidence: 1 },
        { id: 'colete', detected: true, confidence: 0.8 },
      ],
    });

    expect(result.overallConfidence).toBeCloseTo(0.9);
  });

  it('preserva o identificador e a data quando informados', () => {
    const verifiedAt = '2026-08-03T12:00:00.000Z';
    const result = buildVerificationResult({
      ...baseInput,
      id: 'verificacao-1',
      verifiedAt,
      requiredItems: ['capacete'],
      detections: [{ id: 'capacete', detected: true, confidence: 0.95 }],
    });

    expect(result.id).toBe('verificacao-1');
    expect(result.verifiedAt).toBe(verifiedAt);
    expect(result.requiredItems).toEqual(['capacete']);
    expect(result.engine).toBe('mock');
  });
});
