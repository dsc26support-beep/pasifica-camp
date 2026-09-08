/**
 * Pasifika Campus — Shared validation (client-side) with Zod.
 * -------------------------------------------------------------------------
 * Client validation improves UX; the DATABASE (constraints + RLS + triggers)
 * is the real source of truth. Never rely solely on these schemas (spec §47).
 */
import { z } from 'zod';
import { AppConfig } from '../constants/config';

export const emailSchema = z.string().trim().email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

// Loose international phone check — optional field, kept permissive for Pacific
// numbering. Server stores as-is.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s-]{5,20}$/, 'Enter a valid phone number');

export const signUpSchema = z.object({
  full_name: z.string().trim().min(1, 'Enter your full name').max(120),
  email: emailSchema,
  password: passwordSchema,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});
export type SignInInput = z.infer<typeof signInSchema>;

const priceField = z
  .number({ invalid_type_error: 'Enter a valid price' })
  .min(0, 'Price cannot be negative')
  .max(99_999_999, 'Price is too large');

/** Base listing fields shared across product/service/rental. */
const baseListing = z.object({
  title: z.string().trim().min(1, 'Enter a title').max(140),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  category_id: z.string().uuid('Choose a category'),
  country: z.string().trim().min(1).default(AppConfig.defaultCountry),
  island: z.string().trim().optional().or(z.literal('')),
  community: z.string().trim().optional().or(z.literal('')),
  price_type: z.enum(['fixed', 'negotiable']),
});

export const productSchema = baseListing.extend({
  listing_type: z.literal('product'),
  price: priceField, // products require a price
  condition: z.string().trim().optional().or(z.literal('')),
  brand: z.string().trim().optional().or(z.literal('')),
  quantity: z.number().int().min(0).optional(),
});

export const serviceSchema = baseListing.extend({
  listing_type: z.literal('service'),
  // Services: price optional (may be negotiable / on request).
  price: priceField.optional(),
});

export const rentalSchema = baseListing.extend({
  listing_type: z.literal('rental'),
  price: priceField.optional(), // may be negotiable
});

export const listingSchema = z.discriminatedUnion('listing_type', [
  productSchema,
  serviceSchema,
  rentalSchema,
]);
export type ListingInput = z.infer<typeof listingSchema>;

export const businessSchema = z.object({
  name: z.string().trim().min(1, 'Enter a business name').max(120),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  category_id: z.string().uuid().optional(),
  phone: phoneSchema.optional().or(z.literal('')),
  email: emailSchema.optional().or(z.literal('')),
  country: z.string().trim().min(1).default(AppConfig.defaultCountry),
  island: z.string().trim().optional().or(z.literal('')),
  community: z.string().trim().optional().or(z.literal('')),
});
export type BusinessInput = z.infer<typeof businessSchema>;

export const reportSchema = z.object({
  target_type: z.enum(['listing', 'business', 'user']),
  target_id: z.string().uuid(),
  reason: z.enum([
    'scam',
    'incorrect_information',
    'prohibited_item',
    'duplicate',
    'offensive_content',
    'other',
  ]),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
});
export type ReportInput = z.infer<typeof reportSchema>;

/** Validate a picked image against the configured type/size limits. */
export function validateImage(file: { mimeType?: string; fileSize?: number }): string | null {
  if (file.mimeType && !AppConfig.allowedImageTypes.includes(file.mimeType as never)) {
    return 'Only JPG, PNG or WEBP images are allowed';
  }
  if (file.fileSize && file.fileSize > AppConfig.maxImageSizeBytes) {
    return 'Image is too large (max 5 MB)';
  }
  return null;
}
