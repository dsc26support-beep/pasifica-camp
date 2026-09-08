/**
 * Pasifika Campus — Categories data service.
 * Categories are admin-managed reference data (never hard-coded across the UI).
 */
import { supabase } from '../../lib/supabase';
import type { Category, CategoryType } from '../../types/database';

export async function listCategories(type?: CategoryType): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}
