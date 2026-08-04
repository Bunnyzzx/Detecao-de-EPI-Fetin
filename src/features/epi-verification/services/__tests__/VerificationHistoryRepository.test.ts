import { describe, expect, it } from 'vitest';

import { HISTORY_LIMIT, STORAGE_KEYS } from '@/constants/verification';

import type { VerificationResult } from '../../types';
import { buildVerificationResult } from '../../utils';
import { verificationHistoryRepository } from '../VerificationHistoryRepository';

const makeResult = (id: string, verifiedAt = '2026-08-03T10:00:00.000Z'): VerificationResult =>
  buildVerificationResult({
    id,
    verifiedAt,
    requiredItems: ['capacete'],
    detections: [{ id: 'capacete', detected: true, confidence: 0.95 }],
    engine: 'mock',
    durationMs: 1000,
  });

describe('verificationHistoryRepository', () => {
  it('devolve lista vazia quando não há nada salvo', () => {
    expect(verificationHistoryRepository.getAll()).toEqual([]);
  });

  it('salva e recupera uma verificação', () => {
    verificationHistoryRepository.save(makeResult('verificacao-1'));

    const stored = verificationHistoryRepository.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.id).toBe('verificacao-1');
  });

  it('mantém a mais recente no topo', () => {
    verificationHistoryRepository.save(makeResult('antiga'));
    verificationHistoryRepository.save(makeResult('nova'));

    expect(verificationHistoryRepository.getAll().map((item) => item.id)).toEqual([
      'nova',
      'antiga',
    ]);
  });

  it('substitui um registro com o mesmo identificador', () => {
    verificationHistoryRepository.save(makeResult('verificacao-1'));
    verificationHistoryRepository.save(makeResult('verificacao-1', '2026-08-04T10:00:00.000Z'));

    const stored = verificationHistoryRepository.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.verifiedAt).toBe('2026-08-04T10:00:00.000Z');
  });

  it('busca uma verificação por identificador', () => {
    verificationHistoryRepository.save(makeResult('verificacao-1'));

    expect(verificationHistoryRepository.getById('verificacao-1')).not.toBeNull();
    expect(verificationHistoryRepository.getById('inexistente')).toBeNull();
  });

  it('remove uma verificação específica', () => {
    verificationHistoryRepository.save(makeResult('a'));
    verificationHistoryRepository.save(makeResult('b'));

    verificationHistoryRepository.remove('a');

    expect(verificationHistoryRepository.getAll().map((item) => item.id)).toEqual(['b']);
  });

  it('apaga todo o histórico', () => {
    verificationHistoryRepository.save(makeResult('a'));
    verificationHistoryRepository.clear();

    expect(verificationHistoryRepository.getAll()).toEqual([]);
  });

  it('limita a quantidade de registros guardados', () => {
    for (let index = 0; index < HISTORY_LIMIT + 3; index += 1) {
      verificationHistoryRepository.save(makeResult(`verificacao-${index}`));
    }

    const stored = verificationHistoryRepository.getAll();
    expect(stored).toHaveLength(HISTORY_LIMIT);
    expect(stored[0]?.id).toBe(`verificacao-${HISTORY_LIMIT + 2}`);
  });

  it('descarta entradas corrompidas no armazenamento', () => {
    localStorage.setItem(
      STORAGE_KEYS.history,
      JSON.stringify([{ foo: 'bar' }, makeResult('valida')]),
    );

    const stored = verificationHistoryRepository.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.id).toBe('valida');
  });
});
