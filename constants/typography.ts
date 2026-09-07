/**
 * Pasifika Campus — Typography
 * -------------------------------------------------------------------------
 * Headings: Poppins (Bold/SemiBold). Body: Inter (Regular/Medium).
 * Fonts are loaded via @expo-google-fonts in app/_layout (see fontMap).
 * Falls back to system fonts until loaded. Readability on Android is the
 * priority — no decorative faces.
 */

export const FontFamily = {
  heading: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.45,
  relaxed: 1.6,
} as const;

/** Ready-to-spread text style presets. */
export const TextStyles = {
  display: { fontFamily: FontFamily.headingBold, fontSize: FontSize.display },
  h1: { fontFamily: FontFamily.headingBold, fontSize: FontSize.xxl },
  h2: { fontFamily: FontFamily.heading, fontSize: FontSize.xl },
  h3: { fontFamily: FontFamily.heading, fontSize: FontSize.lg },
  title: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md },
  body: { fontFamily: FontFamily.body, fontSize: FontSize.base },
  bodyMedium: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base },
  label: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm },
  caption: { fontFamily: FontFamily.body, fontSize: FontSize.xs },
} as const;
