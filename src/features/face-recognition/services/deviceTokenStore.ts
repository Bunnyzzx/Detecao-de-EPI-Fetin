import * as SecureStore from 'expo-secure-store';

import { AppError } from '@/services/errors';

const DEVICE_TOKEN_KEY = '@epi-fetin/device-token';

export interface DeviceTokenStore {
  /** `null` quando nenhum token foi provisionado ainda. */
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  remove(): Promise<void>;
}

/**
 * Único módulo que fala com o SecureStore para o JWT do dispositivo (tablet).
 *
 * O JWT é uma credencial, não uma preferência: por isso SecureStore
 * (Keystore/Keychain), nunca AsyncStorage. Nenhuma função aqui loga o valor
 * do token — nem em sucesso, nem no `AppError` de falha.
 */
export const deviceTokenStore: DeviceTokenStore = {
  async get() {
    try {
      return await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
    } catch (error) {
      throw new AppError('storage', 'Não foi possível ler o token do dispositivo.', error);
    }
  },

  async set(token) {
    try {
      await SecureStore.setItemAsync(DEVICE_TOKEN_KEY, token);
    } catch (error) {
      throw new AppError('storage', 'Não foi possível salvar o token do dispositivo.', error);
    }
  },

  async remove() {
    try {
      await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
    } catch (error) {
      throw new AppError('storage', 'Não foi possível remover o token do dispositivo.', error);
    }
  },
};
