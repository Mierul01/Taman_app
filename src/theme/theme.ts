export type ColorPalette = typeof lightColors;

export const lightColors = {
  primary: '#1B7A43',
  primaryDark: '#12522D',
  primaryLight: '#E7F4EC',
  accent: '#F2A93B',
  danger: '#D64545',
  background: '#F6F8F7',
  surface: '#FFFFFF',
  text: '#1C2521',
  textMuted: '#6B7570',
  border: '#E3E8E5',
  white: '#FFFFFF',
};

export const darkColors: ColorPalette = {
  primary: '#3CB873',
  primaryDark: '#1B7A43',
  primaryLight: '#B7E4C7',
  accent: '#F2A93B',
  danger: '#E5726F',
  background: '#0F1512',
  surface: '#1A2320',
  text: '#EEF3F0',
  textMuted: '#93A29B',
  border: '#2B3733',
  white: '#FFFFFF',
};

// Backwards-compatible default (light) exports — screens should migrate to useThemeColors().
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
};

export function withAlpha(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// percent: negative darkens, positive lightens (e.g. -25 = 25% darker).
export function shadeColor(hex: string, percent: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const shade = (c: number) => Math.round((t - c) * p + c);
  return `rgb(${shade(r)}, ${shade(g)}, ${shade(b)})`;
}

export function buildTypography(palette: ColorPalette) {
  return {
    h1: { fontSize: 28, fontWeight: '700' as const, color: palette.text },
    h2: { fontSize: 22, fontWeight: '700' as const, color: palette.text },
    h3: { fontSize: 17, fontWeight: '600' as const, color: palette.text },
    body: { fontSize: 15, fontWeight: '400' as const, color: palette.text },
    caption: { fontSize: 13, fontWeight: '400' as const, color: palette.textMuted },
  };
}

export const typography = buildTypography(lightColors);
