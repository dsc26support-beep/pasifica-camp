/**
 * Pasifika Campus — Tips data service.
 * Public reads see only published, unexpired tips (enforced by RLS). Admin
 * management lives in features/admin.
 */
import { supabase } from '../../lib/supabase';
import type { Tip } from '../../types/database';

export async function listPublishedTips(): Promise<Tip[]> {
  const { data, error } = await supabase
    .from('tips')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Tip[];
}

export async function getTip(id: string): Promise<Tip | null> {
  const { data, error } = await supabase
    .from('tips')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as Tip) ?? null;
}
