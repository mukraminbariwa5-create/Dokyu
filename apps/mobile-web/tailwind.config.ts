/**
 * NativeWind theme generated from the shared design tokens (docs/PLAN.md §4.2, "Bayan Blue").
 * Change colors, radii or spacing in packages/shared/src/tokens.ts, never here.
 */
import type { Config } from 'tailwindcss';
import { colors, radius, space } from '../../packages/shared/src/tokens';

const px = (n: number) => `${n}px`;

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('nativewind/preset')],
  // Light mode only for v1 (plan §4.2); 'class' lets the app set the scheme itself.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.primary,
          dark: colors.primaryDark,
          soft: colors.primarySoft,
          tint: colors.primaryTint,
        },
        gold: { DEFAULT: colors.gold, soft: colors.goldSoft, bright: colors.goldBright },
        red: { DEFAULT: colors.red, soft: colors.redSoft },
        success: { DEFAULT: colors.success, soft: colors.successSoft },
        warning: colors.warning,
        danger: colors.danger,
        ink: { DEFAULT: colors.text, muted: colors.textMuted, subtle: colors.textSubtle },
        line: colors.border,
        surface: { DEFAULT: colors.surface, alt: colors.surfaceAlt },
      },
      borderRadius: {
        sm: px(radius.sm),
        md: px(radius.md),
        lg: px(radius.lg),
        tile: px(radius.tile),
        card: px(radius.card),
        sheet: px(radius.sheet),
      },
      spacing: Object.fromEntries(Object.entries(space).map(([k, v]) => [`s${k}`, px(v)])),
      fontFamily: {
        poppins: ['Poppins_400Regular'],
        'poppins-medium': ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold': ['Poppins_700Bold'],
      },
    },
  },
  plugins: [],
} satisfies Config;
