import AsyncStorage from '@react-native-async-storage/async-storage';

import { HISTORY_LIMIT, STORAGE_KEYS } from '@/constants/detection';

import type { EpiDetectionResult } from '../../types';
import { buildDetectionResult } from '../../utils/buildDetectionResult';
import { detectionHistoryRepository } from '../DetectionHistoryRepository';

const makeResult = (id: string, analyzedAt = '2026-08-03T10:00:00.000Z'): EpiDetectionResult =>
  buildDetectionResult({
    id,
    analyzedAt,
    imageUri: `file:///${id}.jpg`,
    requiredItems: ['capacete'],
    detections: [{ id: 'capacete', detected: true, confidence: 0.95 }],
    source: 'camera',
    engine: 'mock',
    processingTimeMs: 1000,
  });

describe('detectionHistoryRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('devolve lista vazia quando não há nada salvo', async () => {
    await expect(detectionHistoryRepository.getAll()).resolves.toEqual([]);
  });

  it('salva e recupera um resultado', async () => {
    const result = makeResult('analise-1');
    await detectionHistoryRepository.save(result);

    const stored = await detectionHistoryRepository.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.id).toBe('analise-1');
  });

  it('mantém o mais recente no topo', async () => {
    await detectionHistoryRepository.save(makeResult('antiga'));
    await detectionHistoryRepository.save(makeResult('nova'));

    const stored = await detectionHistoryRepository.getAll();
    expect(stored.map((item) => item.id)).toEqual(['nova', 'antiga']);
  });

  it('substitui um registro com o mesmo identificador', async () => {
    await detectionHistoryRepository.save(makeResult('analise-1'));
    await detectionHistoryRepository.save(makeResult('analise-1', '2026-08-04T10:00:00.000Z'));

    const stored = await detectionHistoryRepository.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.analyzedAt).toBe('2026-08-04T10:00:00.000Z');
  });

  it('busca um resultado por identificador', async () => {
    await detectionHistoryRepository.save(makeResult('analise-1'));

    await expect(detectionHistoryRepository.getById('analise-1')).resolves.not.toBeNull();
    await expect(detectionHistoryRepository.getById('inexistente')).resolves.toBeNull();
  });

  it('remove um resultado específico', async () => {
    await detectionHistoryRepository.save(makeResult('a'));
    await detectionHistoryRepository.save(makeResult('b'));

    await detectionHistoryRepository.remove('a');

    const stored = await detectionHistoryRepository.getAll();
    expect(stored.map((item) => item.id)).toEqual(['b']);
  });

  it('apaga todo o histórico', async () => {
    await detectionHistoryRepository.save(makeResult('a'));
    await detectionHistoryRepository.clear();

    await expect(detectionHistoryRepository.getAll()).resolves.toEqual([]);
  });

  it('limita a quantidade de registros guardados', async () => {
    for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) {
      await detectionHistoryRepository.save(makeResult(`analise-${index}`));
    }

    const stored = await detectionHistoryRepository.getAll();
    expect(stored).toHaveLength(HISTORY_LIMIT);
    expect(stored[0]?.id).toBe(`analise-${HISTORY_LIMIT + 4}`);
  });

  it('descarta entradas corrompidas no armazenamento', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.history,
      JSON.stringify([{ foo: 'bar' }, makeResult('valida')]),
    );

    const stored = await detectionHistoryRepository.getAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.id).toBe('valida');
  });
});
