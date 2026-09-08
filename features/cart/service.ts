/**
 * Pasifika Campus — Cart data service (LIGHTWEIGHT).
 * No payments, no delivery, no checkout gateway. The cart is a shortlist; the
 * user contacts the seller to arrange purchase/payment (spec §33).
 */
import { supabase } from '../../lib/supabase';
import type { ListingWithRelations } from '../../types/database';

export interface CartRow {
  id: string;
  quantity: number;
  listing: ListingWithRelations;
}

export async function getCart(userId: string): Promise<CartRow[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select(
      'id, quantity, listing:listings ( *, listing_images ( id, storage_path, display_order ), owner:profiles!listings_owner_id_fkey ( id, full_name ) )'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .filter((r) => (r as { listing: unknown }).listing)
    .map((r) => r as unknown as CartRow);
}

export async function addToCart(userId: string, listingId: string, quantity = 1) {
  const { error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, listing_id: listingId, quantity },
      { onConflict: 'user_id,listing_id' }
    );
  if (error) throw error;
}

export async function updateQuantity(itemId: string, quantity: number) {
  const q = Math.max(1, Math.min(999, quantity));
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity: q })
    .eq('id', itemId);
  if (error) throw error;
}

export async function removeFromCart(itemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
  if (error) throw error;
}
