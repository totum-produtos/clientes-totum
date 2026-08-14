import type { SupabaseClient } from '@supabase/supabase-js'

export function getPendingProfileChanges(supabase: SupabaseClient) {
  return supabase.from('client_profile_changes').select('*').eq('status', 'pendente')
}

export function getPendingProfileChangesCount(supabase: SupabaseClient, clientId: string) {
  return supabase
    .from('client_profile_changes')
    .select('*', { count: 'exact', head: true })
    .eq('portal_client_id', clientId)
    .eq('status', 'pendente')
}

export function approveProfileChange(supabase: SupabaseClient, id: string, status: string) {
  return supabase
    .from('client_profile_changes')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
}

export function insertProfileChange(supabase: SupabaseClient, payloads: Record<string, unknown>[]) {
  return supabase.from('client_profile_changes').insert(payloads)
}

export function insertSystemLog(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('system_logs').insert(payload)
}

export function deleteProfileChangesByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('client_profile_changes').delete().eq('portal_client_id', clientId)
}
