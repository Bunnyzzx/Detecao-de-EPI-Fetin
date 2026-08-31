import { env } from '@/services/env';

export interface FaceApiConfig {
  baseUrl: string;
  /** Ponto de acesso (`ponto_id`) onde este tablet está instalado. */
  pointId: number;
}

export class FaceApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FaceApiConfigError';
  }
}

const parsePointId = (raw: string | undefined): number => {
  if (!raw) {
    throw new FaceApiConfigError('EXPO_PUBLIC_FACE_POINT_ID não está configurada.');
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new FaceApiConfigError(
      `EXPO_PUBLIC_FACE_POINT_ID inválido: "${raw}" não é um inteiro positivo.`,
    );
  }
  return parsed;
};

/**
 * Configuração pública (não-segredo) necessária para chamar o endpoint de
 * identificação facial: URL base e ponto de acesso.
 *
 * O JWT do dispositivo NÃO faz parte disso de propósito — é uma credencial,
 * não configuração pública, e vem de `deviceTokenStore` (SecureStore).
 */
export const getFaceApiConfig = (): FaceApiConfig => {
  if (!env.faceApiUrl) {
    throw new FaceApiConfigError('EXPO_PUBLIC_FACE_API_URL não está configurada.');
  }
  return { baseUrl: env.faceApiUrl, pointId: parsePointId(env.facePointIdRaw) };
};

/** Enquanto a configuração não estiver completa, o fluxo real não pode ser acionado. */
export const isFaceApiConfigured = (): boolean => {
  try {
    getFaceApiConfig();
    return true;
  } catch {
    return false;
  }
};
