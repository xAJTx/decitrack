// Design tokens for DeciTrack — "Dark-First Utility" personality.
// Amber/rust brand on obsidian surfaces. Light mode keeps the same brand.

export type ColorScheme = {
  surface: string;
  onSurface: string;
  surfaceSecondary: string;
  onSurfaceSecondary: string;
  surfaceTertiary: string;
  onSurfaceTertiary: string;
  brand: string;
  brandPrimary: string;
  onBrandPrimary: string;
  brandSecondary: string;
  brandTertiary: string;
  onBrandTertiary: string;
  surfaceInverse: string;
  onSurfaceInverse: string;
  success: string;
  warning: string;
  error: string;
  onError: string;
  border: string;
  borderStrong: string;
  divider: string;
};

export const DARK: ColorScheme = {
  surface: "#111111",
  onSurface: "#F3F3F3",
  surfaceSecondary: "#1C1C1C",
  onSurfaceSecondary: "#E0E0E0",
  surfaceTertiary: "#2A2A2A",
  onSurfaceTertiary: "#CCCCCC",
  brand: "#E65100",
  brandPrimary: "#FF6D00",
  onBrandPrimary: "#111111",
  brandSecondary: "#FF8F00",
  brandTertiary: "#4E260C",
  onBrandTertiary: "#FFB74D",
  surfaceInverse: "#F5F5F5",
  onSurfaceInverse: "#111111",
  success: "#2E7D32",
  warning: "#F57F17",
  error: "#E53935",
  onError: "#FFFFFF",
  border: "#333333",
  borderStrong: "#555555",
  divider: "#222222",
};

export const LIGHT: ColorScheme = {
  surface: "#FAFAFA",
  onSurface: "#111111",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#222222",
  surfaceTertiary: "#F0F0F0",
  onSurfaceTertiary: "#444444",
  brand: "#E65100",
  brandPrimary: "#FF6D00",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#E65100",
  brandTertiary: "#FFE0B2",
  onBrandTertiary: "#E65100",
  surfaceInverse: "#111111",
  onSurfaceInverse: "#F5F5F5",
  success: "#2E7D32",
  warning: "#F57F17",
  error: "#C62828",
  onError: "#FFFFFF",
  border: "#E0E0E0",
  borderStrong: "#BDBDBD",
  divider: "#EEEEEE",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
};

export const fonts = {
  display: "BarlowCondensed-Regular",
  displaySemi: "BarlowCondensed-SemiBold",
  displayBold: "BarlowCondensed-Bold",
  text: "IBMPlexSans-Regular",
  textMedium: "IBMPlexSans-Medium",
  textSemi: "IBMPlexSans-SemiBold",
  textBold: "IBMPlexSans-Bold",
};

export const fontSize = {
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
};
