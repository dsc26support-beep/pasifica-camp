/**
 * Pasifika Campus — Spacing, radius & elevation scale.
 * Strong spacing, moderate corner radius, minimal shadows (premium/clean).
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12, // default card radius (moderate, not excessive)
  lg: 16,
  pill: 999,
} as const;

/** Minimal shadow for dark premium surfaces. */
export const Elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

/** Minimum accessible tap target (Android guidance ~48dp). */
export const MIN_TAP_TARGET = 48;
