import {
  signUpSchema,
  signInSchema,
  productSchema,
  serviceSchema,
  listingSchema,
  reportSchema,
  validateImage,
} from '../lib/validation';
import { AppConfig } from '../constants/config';

const CAT = '11111111-1111-1111-1111-111111111111';

describe('auth schemas', () => {
  it('accepts a valid sign-up', () => {
    const r = signUpSchema.safeParse({
      full_name: 'Tebwa',
      email: 'tebwa@example.com',
      password: 'password1',
    });
    expect(r.success).toBe(true);
  });
  it('rejects a short password', () => {
    const r = signUpSchema.safeParse({
      full_name: 'Tebwa',
      email: 'tebwa@example.com',
      password: 'short',
    });
    expect(r.success).toBe(false);
  });
  it('rejects a bad email on sign-in', () => {
    expect(signInSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
});

describe('listing schemas', () => {
  it('requires a price for a product', () => {
    const r = productSchema.safeParse({
      listing_type: 'product',
      title: 'Coconuts',
      category_id: CAT,
      price_type: 'fixed',
    });
    expect(r.success).toBe(false);
  });
  it('accepts a valid product', () => {
    const r = productSchema.safeParse({
      listing_type: 'product',
      title: 'Coconuts',
      category_id: CAT,
      price: 5,
      price_type: 'fixed',
    });
    expect(r.success).toBe(true);
  });
  it('allows a service without a price', () => {
    const r = serviceSchema.safeParse({
      listing_type: 'service',
      title: 'Repairs',
      category_id: CAT,
      price_type: 'negotiable',
    });
    expect(r.success).toBe(true);
  });
  it('discriminates by listing_type', () => {
    const r = listingSchema.safeParse({
      listing_type: 'rental',
      title: 'Room',
      category_id: CAT,
      price_type: 'negotiable',
    });
    expect(r.success).toBe(true);
  });
});

describe('reportSchema', () => {
  it('accepts a valid report', () => {
    const r = reportSchema.safeParse({
      target_type: 'listing',
      target_id: CAT,
      reason: 'scam',
    });
    expect(r.success).toBe(true);
  });
});

describe('validateImage', () => {
  it('rejects an oversized image', () => {
    expect(
      validateImage({ mimeType: 'image/jpeg', fileSize: AppConfig.maxImageSizeBytes + 1 })
    ).toMatch(/too large/);
  });
  it('rejects an unsupported type', () => {
    expect(validateImage({ mimeType: 'image/gif', fileSize: 100 })).toMatch(/JPG|PNG|WEBP/);
  });
  it('accepts a valid image', () => {
    expect(validateImage({ mimeType: 'image/png', fileSize: 1000 })).toBeNull();
  });
});
