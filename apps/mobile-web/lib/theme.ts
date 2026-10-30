import { colors, font, radius } from '@dokyu/shared';

export { colors, radius };

/** Poppins font family names as loaded in app/_layout.tsx */
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const type = {
  h1: { fontFamily: fonts.bold, fontSize: font.size.h1, color: colors.text },
  h2: { fontFamily: fonts.semibold, fontSize: font.size.h2, color: colors.text },
  title: { fontFamily: fonts.semibold, fontSize: font.size.title, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: font.size.body, color: colors.text, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: font.size.small, color: colors.textMuted },
  caption: { fontFamily: fonts.regular, fontSize: font.size.caption, color: colors.textSubtle },
} as const;
