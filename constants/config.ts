/**
 * Pasifika Campus — App configuration & tunable limits.
 * Keep magic numbers here (configurable, not hard-coded across the UI).
 */

export const AppConfig = {
  appName: 'Pasifika Campus',
  tagline: 'Find. Discover. Contact.',

  // Listing images — default max is configurable (spec §25).
  maxImagesPerListing: 5,
  maxImageSizeBytes: 5 * 1024 * 1024, // 5 MB before compression
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  // Target size fed to expo-image-manipulator before upload (Pacific bandwidth).
  imageResizeMaxWidth: 1280,
  imageCompress: 0.7,

  // Pagination (never load hundreds at once — spec §50).
  pageSize: 20,
  homeSectionSize: 10,

  // Default V1 market (NOT hard-coded in the DB; this is a UI default only).
  defaultCountry: 'Kiribati',
} as const;

/** The five primary categories surfaced on Home. */
export const PrimaryCategoryTypes = [
  { key: 'product', label: 'Products', icon: 'shopping-bag' },
  { key: 'service', label: 'Services', icon: 'briefcase' },
  { key: 'business', label: 'Businesses', icon: 'store' },
  { key: 'rental', label: 'Rentals', icon: 'key' },
] as const;
