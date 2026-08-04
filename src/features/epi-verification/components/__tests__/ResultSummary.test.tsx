import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { EpiId, VerificationResult, VerificationStatus } from '../../types';
import { buildVerificationResult } from '../../utils';
import { ResultSummary } from '../ResultSummary';

const REQUIRED: EpiId[] = ['capacete', 'colete', 'oculos'];

const makeResult = (status: VerificationStatus, missing: EpiId[]): VerificationResult => {
  const result = buildVerificationResult({
    id: 'verificacao-1',
    verifiedAt: '2026-08-03T12:30:00.000Z',
    requiredItems: REQUIRED,
    detections: REQUIRED.map((id) => ({
      id,
      detected: !missing.includes(id),
      confidence: missing.includes(id) ? 0.2 : 0.9,
    })),
    engine: 'mock',
    durationMs: 1500,
  });

  return { ...result, status };
};

describe('ResultSummary', () => {
  it('mostra a contagem de equipamentos verificados', () => {
    render(<ResultSummary result={makeResult('approved', [])} />);

    expect(screen.getByText('3/3 Equipamentos verificados')).toBeInTheDocument();
    expect(screen.getByText('Todos os EPIs confirmados')).toBeInTheDocument();
  });

  it('mostra o selo de acesso válido quando aprovado', () => {
    render(<ResultSummary result={makeResult('approved', [])} />);

    expect(screen.getByText('Acesso válido')).toBeInTheDocument();
  });

  it('mostra o selo de acesso bloqueado quando reprovado', () => {
    render(<ResultSummary result={makeResult('rejected', ['oculos', 'colete'])} />);

    expect(screen.getByText('Acesso bloqueado')).toBeInTheDocument();
    expect(screen.getByText('EPIs obrigatórios ausentes')).toBeInTheDocument();
  });

  it('exibe a confiança em percentual', () => {
    render(<ResultSummary result={makeResult('approved', [])} />);

    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('concorda o rótulo com a contagem no singular', () => {
    render(<ResultSummary result={makeResult('warning', ['oculos'])} />);

    expect(screen.getByText('ausente')).toBeInTheDocument();
  });
});
