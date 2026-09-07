/**
 * Pasifika Campus — Businesses data service.
 */
import { supabase } from '../../lib/supabase';
import type { Business, ListingWithRelations } from '../../types/database';
import type { BusinessInput } from '../../lib/validation';

export async function getById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*, category:categories ( id, name, type )')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Business) ?? null;
}

/** The current user's business (V1 assumes one business per owner in the UI). */
export async function getMine(ownerId: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return (data as Business) ?? null;
}

export async function createBusiness(ownerId: string, input: BusinessInput) {
  const { data, error } = await supabase
    .from('businesses')
    .insert({ ...input, owner_id: ownerId, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data as Business;
}

export async function updateBusiness(id: string, patch: Partial<Business>) {
  const { data, error } = await supabase
    .from('businesses')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Business;
}

/** Owner toggles OPEN/CLOSED (manual — no automated hours logic in V1). */
export async function setOpen(id: string, isOpen: boolean) {
  return updateBusiness(id, { is_open: isOpen });
}

/** Approved listings belonging to a business (for the business page). */
export async function getBusinessListings(businessId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images ( id, storage_path, display_order )')
    .eq('business_id', businessId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ListingWithRelations[];
}
