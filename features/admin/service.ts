/**
 * Pasifika Campus — Admin moderation service.
 * Every call here is additionally gated by RLS (is_admin()) on the server — a
 * non-admin calling these will simply get zero rows / permission errors.
 */
import { supabase } from '../../lib/supabase';
import type {
  AdminStats,
} from '../../types';
import type {
  Business,
  Category,
  Listing,
  Report,
  Tip,
} from '../../types/database';

export async function getStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_dashboard_stats');
  if (error) throw error;
  return data as AdminStats;
}

// ---- Listings moderation ----------------------------------------------------
export async function pendingListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function approveListing(id: string) {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id);
  if (error) throw error;
}

export async function rejectListing(id: string, reason: string) {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', id);
  if (error) throw error;
}

export async function featureListing(id: string, featured: boolean) {
  const { error } = await supabase
    .from('listings')
    .update({ is_featured: featured })
    .eq('id', id);
  if (error) throw error;
}

// ---- Business moderation ----------------------------------------------------
export async function setBusinessStatus(id: string, status: Business['status']) {
  const { error } = await supabase.from('businesses').update({ status }).eq('id', id);
  if (error) throw error;
}

// ---- User moderation --------------------------------------------------------
export async function setUserStatus(id: string, status: 'active' | 'suspended') {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
  if (error) throw error;
}

// ---- Reports ----------------------------------------------------------------
export async function openReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .in('status', ['open', 'reviewing'])
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function resolveReport(id: string, note: string, dismiss = false) {
  const { error } = await supabase
    .from('reports')
    .update({
      status: dismiss ? 'dismissed' : 'resolved',
      admin_note: note,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

// ---- Categories -------------------------------------------------------------
export async function upsertCategory(cat: Partial<Category> & { name: string; type: Category['type'] }) {
  const { error } = await supabase.from('categories').upsert(cat);
  if (error) throw error;
}

// ---- Tips -------------------------------------------------------------------
export async function upsertTip(tip: Partial<Tip> & { title: string }) {
  const { error } = await supabase.from('tips').upsert(tip);
  if (error) throw error;
}

export async function deleteTip(id: string) {
  const { error } = await supabase.from('tips').delete().eq('id', id);
  if (error) throw error;
}
