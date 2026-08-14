import type { SupabaseClient } from '@supabase/supabase-js'

export function getUserRole(supabase: SupabaseClient, userId: string) {
  return supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
}

export function getClientUserRole(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('portal_client_users')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['master', 'admin'])
    .single()
}

export function upsertUserRole(supabase: SupabaseClient, payload: Record<string, unknown>, conflict?: string) {
  const opts = conflict ? { onConflict: conflict } : undefined
  return supabase.from('user_roles').upsert(payload, opts)
}

export function deleteUserRoles(supabase: SupabaseClient, userIds: string[]) {
  return supabase.from('user_roles').delete().in('user_id', userIds)
}

export function upsertProfile(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select('id')
}
