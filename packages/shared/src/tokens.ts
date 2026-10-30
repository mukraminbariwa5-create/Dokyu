/**
 * Dokyu design tokens: "Bayan Blue" (locked 2026-10-30, see docs/PLAN.md §4.2).
 * One source of truth for the Expo app (NativeWind theme) and the staff web dashboard.
 */
export const colors = {
  primary: '#2042C4',
  primaryDark: '#13287A',
  primarySoft: '#ECF0FF',
  primaryTint: '#D5DEFF',
  gold: '#E0A800',
  goldSoft: '#FFF6DB',
  goldBright: '#FFD452',
  red: '#D93A4A',
  redSoft: '#FDE8EA',
  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#B45309',
  danger: '#B91C1C',
  text: '#172033',
  textMuted: '#5B6478',
  textSubtle: '#8A93A8',
  border: '#E6EAF4',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F6FC',
  scrim: 'rgba(10, 18, 44, 0.66)',
} as const;

/** Status colors are the same everywhere (plan §4.2). */
export const statusColors = {
  notStarted: { fg: colors.textMuted, bg: colors.surfaceAlt },
  inProgress: { fg: colors.primary, bg: colors.primarySoft },
  ready: { fg: '#8A6400', bg: colors.goldSoft },
  done: { fg: colors.success, bg: colors.successSoft },
  problem: { fg: colors.red, bg: colors.redSoft },
} as const;

export const font = {
  family: 'Poppins',
  weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  size: { caption: 11, small: 12, body: 14, bodyLg: 16, title: 17, h2: 20, h1: 24, display: 88 },
  largeTextBody: 20,
} as const;

export const radius = { sm: 8, md: 12, lg: 14, tile: 18, card: 20, sheet: 26, pill: 999 } as const;
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 } as const;
export const size = { tile: 60, touchMin: 44, button: 52, tabBar: 84, dokiButton: 66 } as const;
export const motion = { fast: 150, normal: 200, slow: 250 } as const;
export const shadow = {
  card: '0 2px 10px rgba(15, 23, 42, 0.04)',
  raised: '0 8px 28px rgba(19, 40, 122, 0.10)',
  doki: '0 6px 16px rgba(32, 66, 196, 0.35)',
  focusRing: '0 0 0 4px #FFD452',
} as const;
