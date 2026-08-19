import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/theme';

export interface FaceGuideProps {
  /** Destaca a moldura enquanto a identificação está em andamento. */
  active?: boolean;
}

/**
 * Contorno oval sobre o visor, indicando onde o rosto deve ficar.
 *
 * É apenas uma referência visual: não há detecção de posicionamento aqui, e
 * nenhuma decisão do sistema depende de o rosto estar dentro do oval.
 */
export const FaceGuide = ({ active = false }: FaceGuideProps) => (
  <View testID="face-guide" style={styles.container} pointerEvents="none">
    <View
      style={[
        styles.oval,
        { borderColor: active ? colors.accent : 'rgba(255, 255, 255, 0.55)' },
        active ? styles.ovalActive : null,
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oval: {
    width: '62%',
    aspectRatio: 0.78,
    borderWidth: 3,
    // Raio alto o bastante para o retângulo virar um oval.
    borderRadius: radii.pill,
  },
  ovalActive: {
    borderWidth: 4,
  },
});
