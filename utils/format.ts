/**
 * Pasifika Campus — formatting helpers (pure, unit-tested).
 */
import type { Listing, PriceType } from '../types/database';

/** Format a price for display. Australian Dollar is Kiribati's currency. */
export function formatPrice(
  price: number | null | undefined,
  priceType: PriceType
): string {
  if (price == null) {
    return priceType === 'negotiable' ? 'Negotiable' : 'Contact for price';
  }
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
  return priceType === 'negotiable' ? `${formatted} (neg.)` : formatted;
}

/** Human location string from geography fields. */
export function formatLocation(l: Pick<Listing, 'community' | 'island' | 'country'>): string {
  return [l.community, l.island, l.country].filter(Boolean).join(', ');
}

/** Relative "time ago" for lists/chat. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Cart subtotal (payments are NOT part of V1 — this is display-only). */
export function cartSubtotal(
  items: { quantity: number; price: number | null }[]
): number {
  return items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
}

/** Human label for a listing/business/report status (never colour-only). */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending review',
    approved: 'Approved',
    rejected: 'Rejected',
    unavailable: 'Unavailable',
    removed: 'Removed',
    suspended: 'Suspended',
    open: 'Open',
    reviewing: 'Reviewing',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  };
  return map[status] ?? status;
}
