import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { AppError, normalizeError } from '@/services/errors';

export interface UseImagePickerResult {
  pickImage: () => Promise<string | null>;
  picking: boolean;
  error: unknown;
  clearError: () => void;
}

/**
 * Seleção de imagem da galeria. Devolve `null` quando o usuário cancela — o
 * cancelamento não é tratado como erro.
 */
export const useImagePicker = (): UseImagePickerResult => {
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const clearError = useCallback(() => setError(null), []);

  const pickImage = useCallback(async (): Promise<string | null> => {
    setPicking(true);
    setError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        throw new AppError('permission_denied', 'Acesso à galeria não autorizado.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (result.canceled) {
        return null;
      }

      const uri = result.assets[0]?.uri;
      if (!uri) {
        throw new AppError('invalid_image', 'A imagem selecionada não pôde ser lida.');
      }

      return uri;
    } catch (caught) {
      setError(normalizeError(caught));
      return null;
    } finally {
      setPicking(false);
    }
  }, []);

  return { pickImage, picking, error, clearError };
};
