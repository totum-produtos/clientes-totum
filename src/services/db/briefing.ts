import type { SupabaseClient } from '@supabase/supabase-js'

export function getClientUserForBriefing(supabase: SupabaseClient, userId: string) {
  return supabase.from('portal_client_users').select('client_id').eq('user_id', userId).single()
}

export function getClientProfileForBriefing(supabase: SupabaseClient, clientId: string) {
  return supabase.from('portal_clients').select('profile_data').eq('id', clientId).single()
}

export function updateClientProfileForBriefing(supabase: SupabaseClient, clientId: string, profile_data: unknown) {
  return supabase.from('portal_clients').update({ profile_data }).eq('id', clientId)
}
