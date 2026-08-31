jest.mock('@/services/env', () => ({
  env: {
    faceApiUrl: undefined as string | undefined,
    facePointIdRaw: undefined as string | undefined,
  },
}));

import { env } from '@/services/env';

import { FaceApiConfigError, getFaceApiConfig, isFaceApiConfigured } from '../faceApiConfig';

interface MutableFaceEnv {
  faceApiUrl: string | undefined;
  facePointIdRaw: string | undefined;
}

const mutableEnv = env as unknown as MutableFaceEnv;

describe('getFaceApiConfig', () => {
  beforeEach(() => {
    mutableEnv.faceApiUrl = undefined;
    mutableEnv.facePointIdRaw = undefined;
  });

  it('retorna baseUrl e pointId quando ambos estão configurados corretamente', () => {
    mutableEnv.faceApiUrl = 'https://api.example.test';
    mutableEnv.facePointIdRaw = '1';

    expect(getFaceApiConfig()).toEqual({ baseUrl: 'https://api.example.test', pointId: 1 });
  });

  it('lança FaceApiConfigError quando a URL está ausente', () => {
    mutableEnv.facePointIdRaw = '1';

    expect(() => getFaceApiConfig()).toThrow(FaceApiConfigError);
  });

  it('lança FaceApiConfigError quando o ponto_id está ausente', () => {
    mutableEnv.faceApiUrl = 'https://api.example.test';

    expect(() => getFaceApiConfig()).toThrow(FaceApiConfigError);
  });

  it.each(['0', '-3', 'abc', '1.5'])(
    'lança FaceApiConfigError quando o ponto_id é inválido (%s)',
    (invalid) => {
      mutableEnv.faceApiUrl = 'https://api.example.test';
      mutableEnv.facePointIdRaw = invalid;

      expect(() => getFaceApiConfig()).toThrow(FaceApiConfigError);
    },
  );

  it('isFaceApiConfigured reflete se a configuração está completa', () => {
    expect(isFaceApiConfigured()).toBe(false);

    mutableEnv.faceApiUrl = 'https://api.example.test';
    mutableEnv.facePointIdRaw = '1';

    expect(isFaceApiConfigured()).toBe(true);
  });
});
