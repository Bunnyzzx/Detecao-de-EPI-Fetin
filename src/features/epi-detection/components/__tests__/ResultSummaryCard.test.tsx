import { render } from '@testing-library/react-native';

import type { DetectionStatus, EpiDetectionResult, EpiId } from '../../types';
import { buildDetectionResult } from '../../utils/buildDetectionResult';
import { ResultSummaryCard } from '../ResultSummaryCard';

const makeResult = (status: DetectionStatus, missing: EpiId[]): EpiDetectionResult => {
  const required: EpiId[] = ['capacete', 'colete', 'oculos'];

  const result = buildDetectionResult({
    id: 'analise-1',
    analyzedAt: '2026-08-03T12:30:00.000Z',
    requiredItems: required,
    detections: required.map((id) => ({
      id,
      detected: !missing.includes(id),
      confidence: missing.includes(id) ? 0.2 : 0.9,
    })),
    engine: 'mock',
    processingTimeMs: 1500,
  });

  return { ...result, status };
};

describe('ResultSummaryCard', () => {
  it('mostra a contagem de equipamentos verificados', async () => {
    const { getByText } = await render(<ResultSummaryCard result={makeResult('approved', [])} />);

    expect(getByText('3/3 Equipamentos verificados')).toBeTruthy();
    expect(getByText('Todos os EPIs confirmados')).toBeTruthy();
  });

  it('mostra o selo de acesso válido quando aprovado', async () => {
    const { getByText } = await render(<ResultSummaryCard result={makeResult('approved', [])} />);

    expect(getByText('Acesso válido')).toBeTruthy();
  });

  it('mostra o selo de acesso bloqueado quando reprovado', async () => {
    const { getByText } = await render(
      <ResultSummaryCard result={makeResult('rejected', ['oculos', 'colete'])} />,
    );

    expect(getByText('Acesso bloqueado')).toBeTruthy();
    expect(getByText('EPIs obrigatórios ausentes')).toBeTruthy();
  });

  it('exibe a confiança em percentual', async () => {
    const { getByText } = await render(<ResultSummaryCard result={makeResult('approved', [])} />);

    expect(getByText('90%')).toBeTruthy();
  });
});
