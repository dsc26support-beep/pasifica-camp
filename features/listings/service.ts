/**
 * Pasifika Campus — Listings data service.
 * -------------------------------------------------------------------------
 * All reads/writes go through this module so the rest of the app never touches
 * raw table names. Search is routed through the `search_listings` RPC, which is
 * the swappable boundary (PostgreSQL now, a dedicated engine later — spec §18).
 */
import { supabase } from '../../lib/supabase';
import { AppConfig } from '../../constants/config';
import type {
  Listing,
  ListingType,
  ListingWithRelations,
} from '../../types/database';
import type { SearchParams } from '../../types';

const LISTING_SELECT = `
  *,
  listing_images ( id, listing_id, storage_path, display_order, created_at ),
  owner:profiles!listings_owner_id_fkey ( id, full_name, avatar_url ),
  business:businesses ( id, name, logo_url, is_open ),
  category:categories ( id, name, type )
`;

/** Keyword + filter search via the swappable RPC. */
export async function searchListings(params: SearchParams): Promise<Listing[]> {
  const { data, error } = await supabase.rpc('search_listings', {
    p_query: params.query ?? null,
    p_listing_type: params.listingType ?? null,
    p_category_id: params.categoryId ?? null,
    p_country: params.country ?? null,
    p_island: params.island ?? null,
    p_community: params.community ?? null,
    p_price_min: params.priceMin ?? null,
    p_price_max: params.priceMax ?? null,
    p_price_type: params.priceType ?? null,
    p_available: params.available ?? null,
    p_limit: params.limit ?? AppConfig.pageSize,
    p_offset: params.offset ?? 0,
  });
  if (error) throw error;
  return (data ?? []) as Listing[];
}

/** Home rails. Each is a small, paginated query (never load hundreds). */
export async function getFeatured(limit = AppConfig.homeSectionSize) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'approved')
    .eq('availability_status', 'available')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ListingWithRelations[];
}

export async function getRecent(limit = AppConfig.homeSectionSize) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'approved')
    .eq('availability_status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ListingWithRelations[];
}

export async function getByType(
  listingType: ListingType,
  limit = AppConfig.pageSize,
  offset = 0
) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'approved')
    .eq('availability_status', 'available')
    .eq('listing_type', listingType)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as ListingWithRelations[];
}

export async function getById(id: string): Promise<ListingWithRelations | null> {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as ListingWithRelations) ?? null;
}

/** Listings owned by the current user (any status — for "My Listings"). */
export async function getMine(ownerId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('owner_id', ownerId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ListingWithRelations[];
}

export type CreateListingInput = Partial<Listing> &
  Pick<Listing, 'listing_type' | 'title' | 'price_type'>;

export async function createListing(
  ownerId: string,
  input: CreateListingInput
): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .insert({ ...input, owner_id: ownerId, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

export async function updateListing(id: string, patch: Partial<Listing>) {
  const { data, error } = await supabase
    .from('listings')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

/** Seller toggles availability (allowed by RLS; cannot self-approve). */
export async function setAvailability(id: string, available: boolean) {
  return updateListing(id, {
    availability_status: available ? 'available' : 'unavailable',
    status: available ? 'approved' : 'unavailable',
  });
}

/** Soft-remove (owner). */
export async function removeListing(id: string) {
  return updateListing(id, { status: 'removed' });
}

/** Attach image storage paths to a listing (ordered). */
export async function addListingImages(
  listingId: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  const rows = paths.slice(0, AppConfig.maxImagesPerListing).map((p, i) => ({
    listing_id: listingId,
    storage_path: p,
    display_order: i,
  }));
  const { error } = await supabase.from('listing_images').insert(rows);
  if (error) throw error;
}
