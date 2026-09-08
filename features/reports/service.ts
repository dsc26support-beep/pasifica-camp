/**
 * Pasifika Campus — Reports data service.
 */
import { supabase } from '../../lib/supabase';
import type { ReportInput } from '../../lib/validation';
import type { Report } from '../../types/database';

export async function createReport(reporterId: string, input: ReportInput) {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      target_type: input.target_type,
      target_id: input.target_id,
      reason: input.reason,
      description: input.description || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Report;
}
