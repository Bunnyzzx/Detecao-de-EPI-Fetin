import { DEFAULT_REQUIRED_EPI_IDS } from '@/constants/epiCatalog';
import type { EpiId } from '@/features/epi-detection/types';
import { MockFaceRecognitionService } from '@/features/face-recognition/services/MockFaceRecognitionService';
import { AppError } from '@/services/errors';

import type { SessionEvent } from '../../types';
import { MockVerificationSessionService } from '../MockVerificationSessionService';

const REQUIRED: EpiId[] = [...DEFAULT_REQUIRED_EPI_IDS];

const createService = (
  forcedScenario: string,
  faceOutcome: 'recognized' | 'unknown' = 'recognized',
) =>
  new MockVerificationSessionService({
    random: () => 0.5,
    openingMs: 0,
    stepMs: 0,
    forcedScenario,
    faceRecognition: new MockFaceRecognitionService({
      random: () => 0.5,
      durationMs: 0,
      forcedOutcome: faceOutcome,
    }),
  });

/** Executa a sessão coletando todos os eventos emitidos. */
const runSession = async (
  service: MockVerificationSessionService,
  requiredItems: EpiId[] = REQUIRED,
) => {
  const events: SessionEvent[] = [];
  const outcome = await service.run({ requiredItems }, (event) => events.push(event));
  return { events, outcome };
};

describe('MockVerificationSessionService', () => {
  it('emite a sequência completa de eventos da sessão', async () => {
    const { events } = await runSession(createService('conformidade-total'));
    const types = events.map((event) => event.type);

    expect(types[0]).toBe('OPENED');
    expect(types).toContain('FACE_SCANNING');
    expect(types).toContain('FACE_RECOGNIZED');
    expect(types).toContain('EPI_STARTED');
    expect(types).toContain('EPI_PROGRESS');
    expect(types.at(-1)).toBe('COMPLETED');
  });

  it('reconhece a pessoa e devolve os dados dela no resultado', async () => {
    const { outcome } = await runSession(createService('conformidade-total'));

    expect(outcome.employee).not.toBeNull();
    expect(outcome.employee?.matricula).toEqual(expect.any(String));
    expect(outcome.faceConfidence).toBeGreaterThan(0.7);
  });

  it('conclui sem pessoa quando o rosto não é reconhecido', async () => {
    const { events, outcome } = await runSession(createService('conformidade-total', 'unknown'));

    expect(events.map((event) => event.type)).toContain('FACE_UNKNOWN');
    expect(outcome.employee).toBeNull();
  });

  it('avalia os EPIs um a um, com progresso crescente até 100%', async () => {
    const { events } = await runSession(createService('conformidade-total'), [
      'capacete',
      'colete',
      'oculos',
    ]);

    const progresses = events
      .filter(
        (event): event is Extract<SessionEvent, { type: 'EPI_PROGRESS' }> =>
          event.type === 'EPI_PROGRESS',
      )
      .map((event) => event.progress);

    // Um evento inicial em zero e um por equipamento avaliado.
    expect(progresses).toHaveLength(4);
    expect(progresses[0]).toBe(0);
    expect(progresses.at(-1)).toBe(1);
  });

  it('indica qual equipamento está sendo avaliado', async () => {
    const { events } = await runSession(createService('conformidade-total'), [
      'capacete',
      'colete',
    ]);

    const currentItems = events
      .filter(
        (event): event is Extract<SessionEvent, { type: 'EPI_PROGRESS' }> =>
          event.type === 'EPI_PROGRESS',
      )
      .map((event) => event.currentItem);

    expect(currentItems).toEqual(['capacete', 'colete', null]);
  });

  it('conclui aprovado quando todos os equipamentos são detectados', async () => {
    const { outcome } = await runSession(createService('conformidade-total'));

    expect(outcome.detection.status).toBe('approved');
    expect(outcome.detection.missingItems).toHaveLength(0);
    expect(outcome.detection.detectedItems).toHaveLength(REQUIRED.length);
  });

  it('conclui reprovado quando vários equipamentos faltam', async () => {
    const { outcome } = await runSession(createService('falta-luvas-e-mascara'));

    expect(outcome.detection.status).toBe('rejected');
    expect(outcome.detection.missingItems.map((item) => item.id).sort()).toEqual([
      'luvas',
      'mascara',
    ]);
  });

  it('conclui reprovado quando nada é reconhecido', async () => {
    const { outcome } = await runSession(createService('nada-reconhecido'));

    expect(outcome.detection.status).toBe('rejected');
    expect(outcome.detection.detectedItems).toHaveLength(0);
  });

  it('o resultado cobre todos os equipamentos exigidos', async () => {
    const { outcome } = await runSession(createService('falta-oculos'));
    const total = outcome.detection.detectedItems.length + outcome.detection.missingItems.length;

    expect(total).toBe(REQUIRED.length);
  });

  it('rejeita a sessão sem equipamentos exigidos', async () => {
    await expect(
      createService('conformidade-total').run({ requiredItems: [] }, () => {}),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('aborta quando o sinal é cancelado', async () => {
    const controller = new AbortController();
    const service = new MockVerificationSessionService({
      random: () => 0.5,
      openingMs: 20,
      stepMs: 20,
      forcedScenario: 'conformidade-total',
    });

    const promise = service.run({ requiredItems: REQUIRED, signal: controller.signal }, () => {});
    controller.abort();

    await expect(promise).rejects.toMatchObject({ code: 'cancelled' });
  });
});
