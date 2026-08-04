import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { DetectedEpi } from '../../types';
import { EpiChecklist } from '../EpiChecklist';

const capacete: DetectedEpi = {
  id: 'capacete',
  label: 'Capacete',
  description: 'Proteção da cabeça',
  confidence: 0.97,
  detected: true,
};

describe('EpiChecklist', () => {
  it('comunica o estado por texto, não apenas por cor', () => {
    render(<EpiChecklist items={[capacete]} />);

    expect(screen.getByText('Detectado · Proteção da cabeça')).toBeInTheDocument();
    expect(screen.getByText('97%')).toBeInTheDocument();
  });

  it('distingue detectado com baixa confiança de detectado normal', () => {
    render(<EpiChecklist items={[{ ...capacete, confidence: 0.65 }]} />);

    expect(
      screen.getByText('Detectado com baixa confiança · Proteção da cabeça'),
    ).toBeInTheDocument();
  });

  it('indica quando o equipamento não foi detectado ao final', () => {
    render(<EpiChecklist items={[{ ...capacete, detected: false, confidence: 0.2 }]} />);

    expect(screen.getByText('Não detectado · Proteção da cabeça')).toBeInTheDocument();
  });

  it('mostra "Aguardando" enquanto a verificação não terminou', () => {
    render(
      <EpiChecklist items={[{ ...capacete, detected: false, confidence: 0 }]} finished={false} />,
    );

    expect(screen.getByText('Aguardando · Proteção da cabeça')).toBeInTheDocument();
  });

  it('destaca o equipamento sendo avaliado no momento', () => {
    render(
      <EpiChecklist
        items={[{ ...capacete, detected: false, confidence: 0 }]}
        currentItem="capacete"
        finished={false}
      />,
    );

    expect(screen.getByText('Analisando · Proteção da cabeça')).toBeInTheDocument();
  });

  it('expõe a confiança para leitores de tela', () => {
    render(<EpiChecklist items={[capacete]} />);

    expect(screen.getByRole('progressbar', { name: 'Confiança de Capacete' })).toHaveAttribute(
      'aria-valuenow',
      '97',
    );
  });
});
