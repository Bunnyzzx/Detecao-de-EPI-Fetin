import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { deviceTokenStore } from '@/features/face-recognition/services/deviceTokenStore';
import {
  isFaceApiUrlConfigured,
  isFacePointIdConfigured,
} from '@/features/face-recognition/services/faceApiConfig';
import { colors, radii, spacing } from '@/theme';

type TokenStatus = 'verificando' | 'provisionado' | 'nao_provisionado';

interface Feedback {
  tone: 'success' | 'error';
  message: string;
}

/**
 * Validação estrutural mínima: três segmentos não vazios separados por ".".
 *
 * Não decodifica nem confia em nenhum claim — isso é responsabilidade do
 * backend. Serve só para recusar colagens claramente erradas antes de gastar
 * uma escrita no SecureStore.
 */
const isStructurallyValidJwt = (value: string): boolean => {
  const partes = value.split('.');
  return partes.length === 3 && partes.every((parte) => parte.length > 0);
};

/**
 * Provisionamento do JWT de dispositivo — tela administrativa, fora do fluxo
 * do funcionário. Acessada diretamente pela rota durante a configuração do
 * totem, não por um botão na home.
 *
 * O token nunca é lido de volta: esta tela só sabe dizer se HÁ um token
 * salvo, nunca qual é o valor.
 */
export default function ProvisionamentoTabletScreen() {
  const router = useRouter();

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('verificando');
  const [tokenInput, setTokenInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const refreshTokenStatus = useCallback(async () => {
    const stored = await deviceTokenStore.get();
    setTokenStatus(stored ? 'provisionado' : 'nao_provisionado');
  }, []);

  useEffect(() => {
    void refreshTokenStatus();
  }, [refreshTokenStatus]);

  const handleSave = useCallback(async () => {
    const trimmed = tokenInput.trim();

    if (!isStructurallyValidJwt(trimmed)) {
      setFeedback({
        tone: 'error',
        message: 'Token inválido: precisa ter três partes separadas por ".".',
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await deviceTokenStore.set(trimmed);
      setTokenInput('');
      setFeedback({ tone: 'success', message: 'Token salvo com sucesso.' });
      await refreshTokenStatus();
    } catch {
      setFeedback({ tone: 'error', message: 'Não foi possível salvar o token.' });
    } finally {
      setSaving(false);
    }
  }, [tokenInput, refreshTokenStatus]);

  const handleRemove = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await deviceTokenStore.remove();
      setFeedback({ tone: 'success', message: 'Token removido.' });
      await refreshTokenStatus();
    } catch {
      setFeedback({ tone: 'error', message: 'Não foi possível remover o token.' });
    } finally {
      setSaving(false);
    }
  }, [refreshTokenStatus]);

  const apiConfigured = isFaceApiUrlConfigured();
  const pointConfigured = isFacePointIdConfigured();

  return (
    <Screen>
      <ScreenHeader
        title="Provisionamento do tablet"
        subtitle="Configuração administrativa"
        onBack={() => router.back()}
      />

      <View style={styles.body}>
        <View style={styles.card}>
          <Text variant="captionStrong" color={colors.slate[500]}>
            CONFIGURAÇÃO PÚBLICA
          </Text>
          <StatusRow label="API" configured={apiConfigured} />
          <StatusRow label="Ponto de acesso" configured={pointConfigured} />
          {!apiConfigured || !pointConfigured ? (
            <Text variant="caption" color={colors.status.rejectedText}>
              Configure EXPO_PUBLIC_FACE_API_URL e EXPO_PUBLIC_FACE_POINT_ID antes de operar.
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text variant="captionStrong" color={colors.slate[500]}>
            TOKEN DO DISPOSITIVO
          </Text>
          <View style={styles.row}>
            <Text variant="caption" color={colors.slate[500]}>
              Status
            </Text>
            <Text
              variant="bodyStrong"
              color={
                tokenStatus === 'provisionado' ? colors.status.approvedText : colors.slate[500]
              }
            >
              {tokenStatus === 'verificando'
                ? 'Verificando...'
                : tokenStatus === 'provisionado'
                  ? 'Provisionado'
                  : 'Não provisionado'}
            </Text>
          </View>

          <TextInput
            value={tokenInput}
            onChangeText={setTokenInput}
            placeholder="Cole o JWT do dispositivo aqui"
            placeholderTextColor={colors.slate[400]}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            style={styles.input}
          />

          <Button
            label={saving ? 'Salvando...' : 'Salvar token'}
            onPress={() => void handleSave()}
            disabled={saving}
            loading={saving}
          />

          <Button
            label="Remover token"
            variant="danger"
            onPress={() => void handleRemove()}
            disabled={saving || tokenStatus !== 'provisionado'}
          />

          {feedback ? (
            <Text
              variant="caption"
              color={feedback.tone === 'success' ? colors.status.approvedText : colors.status.rejectedText}
            >
              {feedback.message}
            </Text>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const StatusRow = ({ label, configured }: { label: string; configured: boolean }) => (
  <View style={styles.row}>
    <Text variant="caption" color={colors.slate[500]}>
      {label}
    </Text>
    <Text
      variant="bodyStrong"
      color={configured ? colors.status.approvedText : colors.status.rejectedText}
    >
      {configured ? 'Configurada' : 'Não configurada'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: radii.lg,
    padding: spacing.sm,
    color: colors.slate[900],
    textAlignVertical: 'top',
  },
});
