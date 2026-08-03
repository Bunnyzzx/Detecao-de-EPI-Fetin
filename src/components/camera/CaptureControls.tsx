import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { colors, radii, spacing } from '@/theme';

export interface CaptureControlsProps {
  onCapture: () => void;
  onFlip: () => void;
  onOpenGallery: () => void;
  capturing?: boolean;
  disabled?: boolean;
}

/** Barra inferior da câmera: galeria, disparo e alternância de lente. */
export const CaptureControls = ({
  onCapture,
  onFlip,
  onOpenGallery,
  capturing = false,
  disabled = false,
}: CaptureControlsProps) => {
  const isBlocked = capturing || disabled;

  return (
    <View style={styles.container}>
      <IconButton
        icon="image-multiple-outline"
        accessibilityLabel={APP_MESSAGES.camera.galleryLabel}
        onPress={onOpenGallery}
        color={colors.white}
        backgroundColor={colors.overlayLight}
        disabled={isBlocked}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={APP_MESSAGES.camera.captureLabel}
        accessibilityState={{ disabled: isBlocked, busy: capturing }}
        disabled={isBlocked}
        onPress={onCapture}
        style={({ pressed }) => [
          styles.shutterOuter,
          pressed ? styles.shutterPressed : null,
          isBlocked ? styles.shutterDisabled : null,
        ]}
      >
        <View style={styles.shutterInner}>
          {capturing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <MaterialCommunityIcons name="camera" size={26} color={colors.primary} />
          )}
        </View>
      </Pressable>

      <IconButton
        icon="camera-flip-outline"
        accessibilityLabel={APP_MESSAGES.camera.flipLabel}
        onPress={onFlip}
        color={colors.white}
        backgroundColor={colors.overlayLight}
        disabled={isBlocked}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xl,
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  shutterPressed: {
    transform: [{ scale: 0.95 }],
  },
  shutterDisabled: {
    opacity: 0.6,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
