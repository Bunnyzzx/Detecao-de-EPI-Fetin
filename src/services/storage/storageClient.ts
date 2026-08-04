import { AppError } from '@/services/errors';

/**
 * Único módulo que fala com o `localStorage`. Telas e componentes usam sempre
 * um repositório, nunca esta camada diretamente.
 */
export const storageClient = {
  readJson<TValue>(key: string): TValue | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as TValue) : null;
    } catch (error) {
      throw new AppError('storage', `Não foi possível ler "${key}".`, error);
    }
  },

  writeJson<TValue>(key: string, value: TValue): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new AppError('storage', `Não foi possível salvar "${key}".`, error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new AppError('storage', `Não foi possível apagar "${key}".`, error);
    }
  },
};
