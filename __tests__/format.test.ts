import {
  formatPrice,
  formatLocation,
  cartSubtotal,
  statusLabel,
  timeAgo,
} from '../utils/format';

describe('formatPrice', () => {
  it('formats a fixed whole-number price in AUD', () => {
    expect(formatPrice(5, 'fixed')).toBe('$5');
  });
  it('shows decimals when present', () => {
    expect(formatPrice(5.5, 'fixed')).toBe('$5.50');
  });
  it('marks negotiable prices', () => {
    expect(formatPrice(40, 'negotiable')).toContain('neg.');
  });
  it('handles a missing price', () => {
    expect(formatPrice(null, 'negotiable')).toBe('Negotiable');
    expect(formatPrice(null, 'fixed')).toBe('Contact for price');
  });
});

describe('formatLocation', () => {
  it('joins present geography fields', () => {
    expect(
      formatLocation({ community: 'Betio', island: 'South Tarawa', country: 'Kiribati' })
    ).toBe('Betio, South Tarawa, Kiribati');
  });
  it('skips missing fields', () => {
    expect(formatLocation({ community: null, island: null, country: 'Kiribati' })).toBe('Kiribati');
  });
});

describe('cartSubtotal', () => {
  it('sums quantity * price and ignores null prices', () => {
    expect(
      cartSubtotal([
        { quantity: 2, price: 5 },
        { quantity: 1, price: 10 },
        { quantity: 3, price: null },
      ])
    ).toBe(20);
  });
  it('is zero for an empty cart', () => {
    expect(cartSubtotal([])).toBe(0);
  });
});

describe('statusLabel', () => {
  it('maps known statuses to friendly text', () => {
    expect(statusLabel('pending')).toBe('Pending review');
    expect(statusLabel('approved')).toBe('Approved');
  });
  it('falls back to the raw value', () => {
    expect(statusLabel('mystery')).toBe('mystery');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for the current time', () => {
    expect(timeAgo(new Date().toISOString())).toBe('just now');
  });
  it('returns minutes for recent times', () => {
    const fiveMin = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(fiveMin)).toBe('5m ago');
  });
});
