/**
 * Pasifika Campus — Favourites data service.
 * Duplicate favourites are prevented by a DB unique(user_id, listing_id).
 */
import { supabase } from '../../lib/supabase';
import type { ListingWithRelations } from '../../types/database';

export async function addFavourite(userId: string, listingId: string) {
  const { error } = await supabase
    .from('favourites')
    .upsert(
      { user_id: userId, listing_id: listingId },
      { onConflict: 'user_id,listing_id', ignoreDuplicates: true }
    );
  if (error) throw error;
}

export async function removeFavourite(userId: string, listingId: string) {
  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);
  if (error) throw error;
}

export async function isFavourited(userId: string, listingId: string) {
  const { count, error } = await supabase
    .from('favourites')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('listing_id', listingId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function listFavourites(userId: string) {
  const { data, error } = await supabase
    .from('favourites')
    .select(
      'listing:listings ( *, listing_images ( id, storage_path, display_order ), business:businesses ( id, name, logo_url, is_open ) )'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((r) => (r as unknown as { listing: ListingWithRelations | null }).listing)
    .filter((l): l is ListingWithRelations => !!l);
}
