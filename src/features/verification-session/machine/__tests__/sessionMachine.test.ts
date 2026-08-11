import type { EpiId } from '@/features/epi-detection/types';
import { buildDetectionResult } from '@/features/epi-detection/utils/buildDetectionResult';
import type { RecognizedEmployee } from '@/features/face-recognition/types';

import type { SessionSnapshot, VerificationOutcome } from '../../types';
import { createInitialSnapshot, isSessionRunning, sessionReducer } from '../sessionMachine';

const REQUIRED: EpiId[] = ['capacete', 'colete'];

const EMPLOYEE: RecognizedEmployee = {
  id: 'employee-001',
  nome: 'Caio de Castro Yarouhas',
  email: 'caio@empresa.com',
  matricula: '001',
  setor: 'Segurança',
};

const makeOutcome = (): VerificationOutcome => ({
  id: 'verificacao-1',
  employee: EMPLOYEE,
  faceConfidence: 0.95,
  verifiedAt: '2026-08-03T12:00:00.000Z',
  detection: buildDetectionResult({
    requiredItems: REQUIRED,
    detections: REQUIRED.map((id) => ({ id, detected: true, confidence: 0.95 })),
    engine: 'mock',
    processingTimeMs: 1000,
  }),
});

/** Aplica uma sequência de eventos a partir do estado inicial. */
const run = (...events: Parameters<typeof sessionReducer>[1][]): SessionSnapshot =>
  events.reduce(sessionReducer, createInitialSnapshot());

describe('sessionMachine', () => {
  it('começa em idle, sem pessoa nem resultado', () => {
    const snapshot = createInitialSnapshot();

    expect(snapshot.state).toBe('idle');
    expect(snapshot.employee).toBeNull();
    expect(snapshot.outcome).toBeNull();
    expect(snapshot.progress).toBe(0);
  });

  it('START abre a sessão e prepara os equipamentos exigidos', () => {
    const snapshot = run({ type: 'START', requiredItems: REQUIRED });

    expect(snapshot.state).toBe('opening');
    expect(snapshot.items.map((item) => item.id)).toEqual(REQUIRED);
    expect(snapshot.items.every((item) => !item.detected)).toBe(true);
    expect(snapshot.currentItem).toBe('capacete');
  });

  it('OPENED avança para o reconhecimento facial', () => {
    const snapshot = run({ type: 'START', requiredItems: REQUIRED }, { type: 'OPENED' });

    expect(snapshot.state).toBe('face_scanning');
  });

  it('FACE_RECOGNIZED guarda a pessoa identificada e a confiança', () => {
    const snapshot = run(
      { type: 'START', requiredItems: REQUIRED },
      { type: 'OPENED' },
      { type: 'FACE_RECOGNIZED', employee: EMPLOYEE, confidence: 0.94 },
    );

    expect(snapshot.state).toBe('face_recognized');
    expect(snapshot.employee).toEqual(EMPLOYEE);
    expect(snapshot.faceConfidence).toBeCloseTo(0.94);
  });

  it('FACE_UNKNOWN mantém a sessão sem pessoa identificada', () => {
    const snapshot = run(
      { type: 'START', requiredItems: REQUIRED },
      { type: 'OPENED' },
      { type: 'FACE_UNKNOWN', confidence: 0.3 },
    );

    expect(snapshot.state).toBe('face_unknown');
    expect(snapshot.employee).toBeNull();
    expect(snapshot.faceConfidence).toBeCloseTo(0.3);
  });

  it('EPI_PROGRESS atualiza progresso, itens e equipamento corrente', () => {
    const snapshot = run(
      { type: 'START', requiredItems: REQUIRED },
      { type: 'OPENED' },
      { type: 'FACE_RECOGNIZED', employee: EMPLOYEE, confidence: 0.94 },
      { type: 'EPI_STARTED' },
      {
        type: 'EPI_PROGRESS',
        progress: 0.5,
        items: [],
        currentItem: 'colete',
      },
    );

    expect(snapshot.state).toBe('epi_detecting');
    expect(snapshot.progress).toBeCloseTo(0.5);
    expect(snapshot.currentItem).toBe('colete');
  });

  it('COMPLETED conclui com o resultado e todos os equipamentos', () => {
    const outcome = makeOutcome();
    const snapshot = run(
      { type: 'START', requiredItems: REQUIRED },
      { type: 'OPENED' },
      { type: 'FACE_RECOGNIZED', employee: EMPLOYEE, confidence: 0.94 },
      { type: 'EPI_STARTED' },
      { type: 'COMPLETED', outcome },
    );

    expect(snapshot.state).toBe('completed');
    expect(snapshot.progress).toBe(1);
    expect(snapshot.currentItem).toBeNull();
    expect(snapshot.outcome).toEqual(outcome);
    expect(snapshot.items).toHaveLength(REQUIRED.length);
  });

  it('FAILED registra o erro', () => {
    const error = new Error('falha');
    const snapshot = run({ type: 'START', requiredItems: REQUIRED }, { type: 'FAILED', error });

    expect(snapshot.state).toBe('error');
    expect(snapshot.error).toBe(error);
  });

  it('CANCELLED interrompe uma sessão em andamento', () => {
    const snapshot = run(
      { type: 'START', requiredItems: REQUIRED },
      { type: 'OPENED' },
      { type: 'CANCELLED' },
    );

    expect(snapshot.state).toBe('cancelled');
  });

  it('CANCELLED não altera uma sessão já concluída', () => {
    const snapshot = run(
      { type: 'START', requiredItems: REQUIRED },
      { type: 'COMPLETED', outcome: makeOutcome() },
      { type: 'CANCELLED' },
    );

    expect(snapshot.state).toBe('completed');
  });

  it('RESET limpa pessoa, progresso e resultado', () => {
    const snapshot = run(
      { type: 'START', requiredItems: REQUIRED },
      { type: 'FACE_RECOGNIZED', employee: EMPLOYEE, confidence: 0.9 },
      { type: 'COMPLETED', outcome: makeOutcome() },
      { type: 'RESET' },
    );

    expect(snapshot).toEqual(createInitialSnapshot());
    expect(snapshot.employee).toBeNull();
    expect(snapshot.outcome).toBeNull();
  });

  it('isSessionRunning distingue estados ativos de terminais', () => {
    expect(isSessionRunning('opening')).toBe(true);
    expect(isSessionRunning('face_scanning')).toBe(true);
    expect(isSessionRunning('epi_detecting')).toBe(true);
    expect(isSessionRunning('completed')).toBe(false);
    expect(isSessionRunning('error')).toBe(false);
    expect(isSessionRunning('cancelled')).toBe(false);
    expect(isSessionRunning('idle')).toBe(false);
  });
});
