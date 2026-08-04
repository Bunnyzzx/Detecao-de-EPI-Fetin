import { getEpiById } from '@/constants/epiCatalog';
import { VERIFICATION_THRESHOLDS } from '@/constants/verification';
import { clampUnit, createId } from '@/utils';

import type { DetectedEpi, EpiId, VerificationEngine, VerificationResult } from '../types';

import { resolveVerificationStatus } from './resolveVerificationStatus';

/** Detecção crua, antes de ser enriquecida com os dados do catálogo. */
export interface RawDetection {
  id: EpiId;
  detected: boolean;
  confidence: number;
}

export interface BuildVerificationResultInput {
  requiredItems: EpiId[];
  detections: RawDetection[];
  engine: VerificationEngine;
  durationMs: number;
  verifiedAt?: string;
  id?: string;
}

export const toDetectedEpi = (detection: RawDetection): DetectedEpi => {
  const catalogItem = getEpiById(detection.id);

  return {
    id: detection.id,
    label: catalogItem?.label ?? detection.id,
    description: catalogItem?.description ?? '',
    confidence: clampUnit(detection.confidence),
    detected: detection.detected,
  };
};

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;

/**
 * Ponto único onde uma lista de detecções vira um `VerificationResult`.
 * Tanto o serviço simulado quanto a integração com a IA passam por aqui,
 * garantindo que a regra de status e o formato do resultado sejam os mesmos.
 */
export const buildVerificationResult = ({
  requiredItems,
  detections,
  engine,
  durationMs,
  verifiedAt,
  id,
}: BuildVerificationResultInput): VerificationResult => {
  const detectionById = new Map(detections.map((detection) => [detection.id, detection]));

  const detectedItems: DetectedEpi[] = [];
  const missingItems: DetectedEpi[] = [];

  requiredItems.forEach((requiredId) => {
    const detection = detectionById.get(requiredId);
    const isConfirmed = Boolean(
      detection?.detected &&
      clampUnit(detection.confidence) >= VERIFICATION_THRESHOLDS.acceptedConfidence,
    );

    const item = toDetectedEpi(detection ?? { id: requiredId, detected: false, confidence: 0 });

    if (isConfirmed) {
      detectedItems.push({ ...item, detected: true });
    } else {
      missingItems.push({ ...item, detected: false });
    }
  });

  const overallConfidence = average(detectedItems.map((item) => item.confidence));

  return {
    id: id ?? createId(),
    status: resolveVerificationStatus({
      detectedItems,
      missingItems,
      requiredCount: requiredItems.length,
      overallConfidence,
    }),
    detectedItems,
    missingItems,
    requiredItems: [...requiredItems],
    overallConfidence,
    verifiedAt: verifiedAt ?? new Date().toISOString(),
    durationMs: Math.max(0, Math.round(durationMs)),
    engine,
  };
};
