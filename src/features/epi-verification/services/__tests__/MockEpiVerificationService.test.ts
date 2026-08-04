import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_REQUIRED_EPI_IDS } from '@/constants/epiCatalog';
import { AppError } from '@/services/errors';

import type { EpiId, VerificationProgress } from '../../types';
import { MockEpiVerificationService } from '../MockEpiVerificationService';

const REQUIRED: EpiId[] = [...DEFAULT_REQUIRED_EPI_IDS];

const createService = (forcedScenario: string) =>
  new MockEpiVerificationService({ random: () => 0.5, stepDurationMs: 0, forcedScenario });

describe('MockEpiVerificationService', () => {
  it('produz resultado aprovado no cenário de conformidade total', async () => {
    const result = await createService('conformidade-total').verify({ requiredItems: REQUIRED });

    expect(result.status).toBe('approved');
    expect(result.missingItems).toHaveLength(0);
    expect(result.detectedItems).toHaveLength(REQUIRED.length);
    expect(result.engine).toBe('mock');
  });

  it('produz resultado de atenção quando falta apenas um equipamento', async () => {
    const result = await createService('falta-oculos').verify({ requiredItems: REQUIRED });

    expect(result.status).toBe('warning');
    expect(result.missingItems.map((item) => item.id)).toEqual(['oculos']);
  });

  it('produz resultado de atenção quando a confiança é baixa', async () => {
    const result = await createService('confianca-baixa').verify({ requiredItems: REQUIRED });

    expect(result.status).toBe('warning');
    expect(result.missingItems).toHaveLength(0);
    expect(result.overallConfidence).toBeLessThan(0.7);
  });

  it('produz resultado reprovado quando vários equipamentos faltam', async () => {
    const result = await createService('falta-luvas-e-mascara').verify({
      requiredItems: REQUIRED,
    });

    expect(result.status).toBe('rejected');
    expect(result.missingItems.map((item) => item.id).sort()).toEqual(['luvas', 'mascara']);
  });

  it('produz resultado reprovado quando nada é reconhecido', async () => {
    const result = await createService('nada-reconhecido').verify({ requiredItems: REQUIRED });

    expect(result.status).toBe('rejected');
    expect(result.detectedItems).toHaveLength(0);
  });

  it('respeita a lista de equipamentos exigidos', async () => {
    const result = await createService('conformidade-total').verify({
      requiredItems: ['capacete', 'colete'],
    });

    expect(result.requiredItems).toEqual(['capacete', 'colete']);
    expect(result.detectedItems).toHaveLength(2);
  });

  it('emite progresso a cada equipamento avaliado', async () => {
    const updates: VerificationProgress[] = [];

    await createService('conformidade-total').verify(
      { requiredItems: ['capacete', 'colete', 'oculos'] },
      (progress) => updates.push(progress),
    );

    // Um evento inicial em zero e um por equipamento avaliado.
    expect(updates).toHaveLength(4);
    expect(updates[0]?.progress).toBe(0);
    expect(updates.at(-1)?.progress).toBe(1);
    expect(updates.at(-1)?.items.every((item) => item.detected)).toBe(true);
  });

  it('indica qual equipamento está sendo avaliado', async () => {
    const currentItems: (EpiId | null)[] = [];

    await createService('conformidade-total').verify(
      { requiredItems: ['capacete', 'colete'] },
      (progress) => currentItems.push(progress.currentItem),
    );

    expect(currentItems).toEqual(['capacete', 'colete', null]);
  });

  it('rejeita verificação sem equipamentos exigidos', async () => {
    await expect(
      createService('conformidade-total').verify({ requiredItems: [] }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('aborta quando o sinal é cancelado', async () => {
    const controller = new AbortController();
    const service = new MockEpiVerificationService({
      random: () => 0.5,
      stepDurationMs: 20,
      forcedScenario: 'conformidade-total',
    });

    const promise = service.verify({ requiredItems: REQUIRED, signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toMatchObject({ code: 'cancelled' });
  });

  it('sorteia cenários usando a fonte de aleatoriedade injetada', async () => {
    const random = vi.fn(() => 0.01);
    const service = new MockEpiVerificationService({ random, stepDurationMs: 0 });

    await service.verify({ requiredItems: ['capacete'] });

    expect(random).toHaveBeenCalled();
  });
});
