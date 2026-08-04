import { describe, expect, it } from 'vitest';

import { AppError } from '@/services/errors';

import type { EpiId } from '../../types';
import { mapProgress, mapVerificationResponse } from '../mapVerificationResponse';

const REQUIRED: EpiId[] = ['capacete', 'oculos'];

describe('mapVerificationResponse', () => {
  it('normaliza confiança recebida em escala 0–100', () => {
    const result = mapVerificationResponse(
      {
        state: 'completed',
        items: [
          { id: 'capacete', detected: true, confidence: 97 },
          { id: 'oculos', detected: true, confidence: 93 },
        ],
      },
      REQUIRED,
      500,
    );

    expect(result.detectedItems[0]?.confidence).toBeCloseTo(0.97);
    expect(result.detectedItems[1]?.confidence).toBeCloseTo(0.93);
  });

  it('aceita confiança já normalizada entre 0 e 1', () => {
    const result = mapVerificationResponse(
      { state: 'completed', items: [{ id: 'capacete', detected: true, confidence: 0.88 }] },
      REQUIRED,
      500,
    );

    expect(result.detectedItems[0]?.confidence).toBeCloseTo(0.88);
  });

  it('descarta itens com identificador desconhecido', () => {
    const result = mapVerificationResponse(
      {
        state: 'completed',
        items: [
          { id: 'capacete', detected: true, confidence: 0.95 },
          { id: 'paraquedas', detected: true, confidence: 0.99 },
        ],
      },
      REQUIRED,
      500,
    );

    expect(result.detectedItems.map((item) => item.id)).toEqual(['capacete']);
    expect(result.missingItems.map((item) => item.id)).toEqual(['oculos']);
  });

  it('usa a duração local quando a API não informa', () => {
    const result = mapVerificationResponse(
      { state: 'completed', items: [{ id: 'capacete', detected: true, confidence: 0.95 }] },
      REQUIRED,
      742,
    );

    expect(result.durationMs).toBe(742);
    expect(result.engine).toBe('api');
  });

  it('lança AppError quando a API reporta falha', () => {
    expect(() =>
      mapVerificationResponse({ state: 'failed', message: 'câmera offline' }, REQUIRED, 100),
    ).toThrow(AppError);
  });

  it('lança AppError quando a resposta não tem o formato esperado', () => {
    expect(() => mapVerificationResponse({ resultado: 'ok' }, REQUIRED, 100)).toThrow(AppError);
    expect(() => mapVerificationResponse(null, REQUIRED, 100)).toThrow(AppError);
  });
});

describe('mapProgress', () => {
  it('aceita progresso em 0–1 e em 0–100', () => {
    expect(mapProgress(0.42)).toBeCloseTo(0.42);
    expect(mapProgress(42)).toBeCloseTo(0.42);
  });

  it('trata valores inválidos como zero', () => {
    expect(mapProgress(undefined)).toBe(0);
    expect(mapProgress('meio')).toBe(0);
  });
});
