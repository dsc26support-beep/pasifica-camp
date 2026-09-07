/**
 * Pasifika Campus — Brand Colour System
 * -------------------------------------------------------------------------
 * Exact approved brand palette. The interface is primarily charcoal/black
 * and sophisticated; GOLD is a controlled ACCENT (~10–15%), never the whole
 * interface. See docs/brand balance: Black 40–50%, Grey 20–30%, Gold 10–15%,
 * Light/White 5–10%.
 */

export const Palette = {
  // Primary
  charcoal: '#0D0D0D', // main background, headers, nav, premium sections
  gold: '#D4AF37', // primary buttons, active nav, key CTAs, highlights

  // Secondary
  darkGrey: '#252525', // cards, surfaces, containers, dividers
  mediumGrey: '#6B6B6B', // secondary text, muted icons, borders
  lightGrey: '#F2F2F2', // light backgrounds, inputs, clean content areas
  white: '#FFFFFF', // primary text on dark, high-contrast content

  // Functional (kept muted; status must never rely on colour alone)
  success: '#2E7D53',
  warning: '#C9962B',
  danger: '#B23A3A',
  info: '#3A6EA5',

  // Gold variants for pressed/subtle states (used sparingly)
  goldPressed: '#B8962E',
  goldSubtle: 'rgba(212, 175, 55, 0.12)',

  transparent: 'transparent',
} as const;

/**
 * Semantic theme tokens — always reference these in components rather than raw
 * hex, so the black/gold/grey balance stays consistent app-wide.
 */
export const Theme = {
  // Backgrounds
  background: Palette.charcoal,
  surface: Palette.darkGrey,
  surfaceAlt: '#1C1C1C',
  inputBackground: '#1A1A1A',

  // Text
  textPrimary: Palette.white,
  textSecondary: Palette.mediumGrey,
  textMuted: '#8A8A8A',
  textOnGold: Palette.charcoal, // dark text on gold buttons for contrast

  // Accent
  accent: Palette.gold,
  accentPressed: Palette.goldPressed,
  accentSubtle: Palette.goldSubtle,

  // Lines & borders
  border: '#333333',
  divider: '#2A2A2A',

  // Status (paired with text/icon in UI, never colour-only)
  success: Palette.success,
  warning: Palette.warning,
  danger: Palette.danger,
  info: Palette.info,

  // Navigation
  navBackground: Palette.charcoal,
  navActive: Palette.gold,
  navInactive: Palette.mediumGrey,
} as const;

export type ThemeColor = keyof typeof Theme;
