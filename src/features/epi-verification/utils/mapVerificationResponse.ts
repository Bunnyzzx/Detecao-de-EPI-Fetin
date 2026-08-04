import { AppError } from '@/services/errors';
import { clampUnit, normalizeConfidence } from '@/utils';

import type { ApiSessionStatusDto, EpiId, VerificationResult } from '../types';
import { isEpiId } from '../types';

import { buildVerificationResult, type RawDetection } from './buildVerificationResult';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Extrai apenas as detecções cujo identificador pertence ao catálogo. */
export const mapDetectionItems = (items: unknown): RawDetection[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item): RawDetection[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || !isEpiId(item.id)) {
      return [];
    }

    return [
      {
        id: item.id,
        detected: Boolean(item.detected),
        confidence: normalizeConfidence(typeof item.confidence === 'number' ? item.confidence : 0),
      },
    ];
  });
};

export const isSessionStatus = (value: unknown): value is ApiSessionStatusDto =>
  isRecord(value) &&
  (value.state === 'running' || value.state === 'completed' || value.state === 'failed');

/** Progresso da API normalizado para 0–1, aceitando também 0–100. */
export const mapProgress = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return clampUnit(value > 1 ? value / 100 : value);
};

/**
 * Converte a resposta final da API no modelo de domínio, descartando itens
 * desconhecidos e normalizando a confiança (aceita 0–1 ou 0–100).
 */
export const mapVerificationResponse = (
  payload: unknown,
  requiredItems: EpiId[],
  fallbackDurationMs: number,
): VerificationResult => {
  if (!isSessionStatus(payload)) {
    throw new AppError('invalid_response', 'A resposta da verificação está em formato inesperado.');
  }

  if (payload.state === 'failed') {
    throw new AppError('invalid_response', payload.message ?? 'A verificação falhou na API.');
  }

  return buildVerificationResult({
    requiredItems,
    detections: mapDetectionItems(payload.items),
    engine: 'api',
    durationMs:
      typeof payload.durationMs === 'number' && Number.isFinite(payload.durationMs)
        ? payload.durationMs
        : fallbackDurationMs,
    ...(typeof payload.verifiedAt === 'string' ? { verifiedAt: payload.verifiedAt } : {}),
  });
};
