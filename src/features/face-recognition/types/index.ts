/**
 * Pessoa cadastrada, tal como o dispositivo embarcado a devolverá depois de
 * relacionar o rosto reconhecido a um registro do banco.
 */
export interface RecognizedEmployee {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  setor: string;
}

/** Reconhecimento bem-sucedido: pessoa identificada acima do limiar. */
export interface FaceRecognized {
  status: 'recognized';
  employee: RecognizedEmployee;
  /** Similaridade normalizada entre 0 e 1. */
  confidence: number;
}

/**
 * Nenhuma pessoa correspondeu com confiança suficiente. Também cobre o caso
 * ambíguo, em que dois cadastros ficam próximos demais para decidir.
 */
export interface FaceUnknown {
  status: 'unknown';
  confidence: number;
}

export type FaceRecognitionResult = FaceRecognized | FaceUnknown;

export interface FaceRecognitionInput {
  /** Permite abortar quando a pessoa sai do terminal. */
  signal?: AbortSignal;
}

/**
 * Contrato do reconhecimento facial.
 *
 * Hoje é satisfeito por um mock; amanhã, pelo cliente do dispositivo
 * embarcado, sem que nenhuma tela precise mudar.
 */
export interface FaceRecognitionService {
  recognize(input: FaceRecognitionInput): Promise<FaceRecognitionResult>;
}
