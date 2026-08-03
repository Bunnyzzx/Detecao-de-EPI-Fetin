import { Platform, type TextStyle } from 'react-native';

/**
 * O protótipo usa Inter. Para manter o app leve e evitar carregamento de fontes
 * remotas, usamos a fonte de sistema — que é geometricamente próxima em ambas
 * as plataformas — e preservamos os pesos e tamanhos originais.
 */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontFamilyMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const typography = {
  display: {
    fontFamily,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  title: {
    fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
  },
  heading: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  subheading: {
    fontFamily: fontFamilyMedium,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontFamily: fontFamilyMedium,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  caption: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  captionStrong: {
    fontFamily: fontFamilyMedium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  overline: {
    fontFamily: fontFamilyMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  micro: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '400',
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
