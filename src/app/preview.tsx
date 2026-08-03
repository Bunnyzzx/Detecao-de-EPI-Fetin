import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorState, InlineNotice, LoadingState, StateView } from '@/components/feedback';
import { Screen, ScreenHeader, StepIndicator } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useAnalysis } from '@/features/epi-detection/hooks/AnalysisContext';
import { useRequiredEpis } from '@/features/epi-detection/hooks/useRequiredEpis';
import { useHaptics } from '@/hooks/useHaptics';
import { useImagePicker } from '@/hooks/useImagePicker';
import { colors, radii, spacing } from '@/theme';

export default function PreviewScreen() {
  const router = useRouter();
  const { pendingImage, status, error, analyze, setPendingImage, clearPendingImage } =
    useAnalysis();
  const { requiredEpis, loading: loadingSettings } = useRequiredEpis();
  const { pickImage, picking } = useImagePicker();
  const { notifyResult } = useHaptics();

  const [imageFailed, setImageFailed] = useState(false);

  const isAnalyzing = status === 'analyzing';
  const fromCamera = pendingImage?.source === 'camera';

  const goHome = useCallback(() => {
    clearPendingImage();
    router.replace('/');
  }, [clearPendingImage, router]);

  const handleRetake = useCallback(async () => {
    setImageFailed(false);

    if (fromCamera) {
      clearPendingImage();
      router.replace('/camera');
      return;
    }

    const uri = await pickImage();
    if (uri) {
      setPendingImage({ uri, source: 'gallery' });
    }
  }, [clearPendingImage, fromCamera, pickImage, router, setPendingImage]);

  const handleAnalyze = useCallback(async () => {
    const result = await analyze(requiredEpis);
    if (result) {
      notifyResult(result.status);
      router.replace('/result');
    }
  }, [analyze, notifyResult, requiredEpis, router]);

  if (!pendingImage) {
    return (
      <Screen>
        <ScreenHeader title={APP_MESSAGES.preview.title} onBack={goHome} />
        <View style={styles.centered}>
          <StateView
            icon="image-off-outline"
            title={APP_MESSAGES.preview.missingImageTitle}
            description={APP_MESSAGES.preview.missingImageDescription}
            actions={[
              { label: APP_MESSAGES.result.backHomeButton, onPress: goHome, icon: 'home-outline' },
            ]}
          />
        </View>
      </Screen>
    );
  }

  if (isAnalyzing) {
    return (
      <Screen>
        <ScreenHeader title={APP_MESSAGES.preview.title} />
        <LoadingState
          message={APP_MESSAGES.preview.analyzing}
          hint={APP_MESSAGES.preview.analyzingHint}
        />
        <StepIndicator currentStep="verification" />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={APP_MESSAGES.preview.title}
        subtitle={APP_MESSAGES.preview.description}
        onBack={goHome}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {imageFailed ? (
          <StateView
            icon="image-off-outline"
            title={APP_MESSAGES.preview.invalidImageTitle}
            description={APP_MESSAGES.preview.invalidImageDescription}
            tone="warning"
          />
        ) : (
          <View style={styles.imageWrapper}>
            <Image
              accessibilityLabel="Imagem selecionada para análise"
              source={{ uri: pendingImage.uri }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          </View>
        )}

        {status === 'error' && error ? (
          <Card variant="outlined">
            <ErrorState error={error} compact />
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={APP_MESSAGES.preview.analyzeButton}
            icon="shield-check"
            size="large"
            onPress={() => void handleAnalyze()}
            disabled={imageFailed || loadingSettings || requiredEpis.length === 0}
          />
          <Button
            label={
              fromCamera
                ? APP_MESSAGES.preview.retakeCameraButton
                : APP_MESSAGES.preview.retakeGalleryButton
            }
            icon={fromCamera ? 'camera' : 'image-multiple-outline'}
            variant="secondary"
            onPress={() => void handleRetake()}
            loading={picking}
          />
          <Button
            label={APP_MESSAGES.common.cancel}
            variant="ghost"
            onPress={goHome}
            disabled={picking}
          />
        </View>

        <InlineNotice message={APP_MESSAGES.result.disclaimer} icon="information-outline" />
      </ScrollView>

      <StepIndicator currentStep="verification" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingTop: 0,
    gap: spacing.lg,
  },
  imageWrapper: {
    aspectRatio: 3 / 4,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.slate[200],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
