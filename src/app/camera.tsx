import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { CaptureControls, ScanFrame } from '@/components/camera';
import { LoadingState, StateView } from '@/components/feedback';
import { Screen, ScreenHeader, StepIndicator } from '@/components/layout';
import { Text } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { useAnalysis } from '@/features/epi-detection/hooks/AnalysisContext';
import { useCameraAvailability } from '@/hooks/useCameraAvailability';
import { useHaptics } from '@/hooks/useHaptics';
import { useImagePicker } from '@/hooks/useImagePicker';
import { colors, radii, spacing } from '@/theme';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const availability = useCameraAvailability();
  const { setPendingImage } = useAnalysis();
  const { pickImage, picking } = useImagePicker();
  const { impact } = useHaptics();

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }, [router]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || capturing) {
      return;
    }

    setCapturing(true);
    setCaptureFailed(false);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) {
        setCaptureFailed(true);
        return;
      }

      impact();
      setPendingImage({ uri: photo.uri, source: 'camera' });
      router.push('/preview');
    } catch {
      setCaptureFailed(true);
    } finally {
      setCapturing(false);
    }
  }, [capturing, impact, router, setPendingImage]);

  const handleOpenGallery = useCallback(async () => {
    const uri = await pickImage();
    if (uri) {
      setPendingImage({ uri, source: 'gallery' });
      router.push('/preview');
    }
  }, [pickImage, router, setPendingImage]);

  const renderContent = () => {
    if (availability === 'checking' || !permission) {
      return <LoadingState tone="dark" />;
    }

    if (availability === 'unavailable') {
      return (
        <StateView
          icon="camera-off-outline"
          title={APP_MESSAGES.camera.unavailableTitle}
          description={APP_MESSAGES.camera.unavailableDescription}
          tone="warning"
          appearance="dark"
          actions={[
            {
              label: APP_MESSAGES.home.galleryButton,
              onPress: () => void handleOpenGallery(),
              icon: 'image-multiple-outline',
              loading: picking,
            },
            { label: APP_MESSAGES.common.back, onPress: goBack, variant: 'secondary' },
          ]}
        />
      );
    }

    if (!permission.granted) {
      const canAskAgain = permission.canAskAgain;

      return (
        <StateView
          icon={canAskAgain ? 'camera' : 'camera-off-outline'}
          title={
            canAskAgain
              ? APP_MESSAGES.camera.permissionTitle
              : APP_MESSAGES.camera.permissionDeniedTitle
          }
          description={
            canAskAgain
              ? APP_MESSAGES.camera.permissionDescription
              : APP_MESSAGES.camera.permissionDeniedDescription
          }
          tone={canAskAgain ? 'info' : 'warning'}
          appearance="dark"
          actions={[
            canAskAgain
              ? {
                  label: APP_MESSAGES.camera.permissionRequestButton,
                  onPress: () => void requestPermission(),
                  icon: 'camera',
                }
              : {
                  label: APP_MESSAGES.camera.openSettingsButton,
                  onPress: () => void Linking.openSettings(),
                  icon: 'cog-outline',
                },
            {
              label: APP_MESSAGES.home.galleryButton,
              onPress: () => void handleOpenGallery(),
              variant: 'secondary',
              icon: 'image-multiple-outline',
              loading: picking,
            },
          ]}
        />
      );
    }

    return (
      <>
        <View style={styles.viewport}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            onCameraReady={() => setIsCameraReady(true)}
          />
          <ScanFrame active={isCameraReady && !capturing} />

          <View style={styles.hintWrapper} pointerEvents="none">
            <View style={styles.hintBubble}>
              <Text variant="captionStrong" color={colors.white} align="center">
                {capturing ? APP_MESSAGES.camera.capturing : APP_MESSAGES.camera.frameHint}
              </Text>
            </View>
          </View>
        </View>

        {captureFailed ? (
          <View style={styles.captureError}>
            <Text variant="captionStrong" color={colors.white}>
              {APP_MESSAGES.camera.captureErrorTitle}
            </Text>
            <Text variant="micro" color={colors.slate[300]}>
              {APP_MESSAGES.camera.captureErrorDescription}
            </Text>
          </View>
        ) : null}

        <CaptureControls
          onCapture={() => void handleCapture()}
          onFlip={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
          onOpenGallery={() => void handleOpenGallery()}
          capturing={capturing}
          disabled={!isCameraReady || picking}
        />
      </>
    );
  };

  return (
    <Screen backgroundColor={colors.scanner.background}>
      <ScreenHeader title={APP_MESSAGES.camera.title} onBack={goBack} tone="dark" />
      <View style={styles.body}>{renderContent()}</View>
      <StepIndicator currentStep="verification" tone="dark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  viewport: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.scanner.viewport,
  },
  hintWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.xxxl,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  hintBubble: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: colors.overlayBorder,
  },
  captureError: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xl,
  },
});
