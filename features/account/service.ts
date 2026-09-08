/**
 * Pasifika Campus — Account / profile data service.
 */
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types/database';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

/**
 * Update the current user's own profile. role/status are intentionally omitted
 * from the allowed patch — they are admin-only (and DB-guarded).
 */
export async function updateProfile(
  userId: string,
  patch: Partial<
    Pick<
      Profile,
      'full_name' | 'phone' | 'avatar_url' | 'country' | 'island' | 'community'
    >
  >
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
