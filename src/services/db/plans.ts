import type { SupabaseClient } from '@supabase/supabase-js'

export function getPlansByClient(supabase: SupabaseClient, clientId: string, includeAllStatuses: boolean) {
  let query = supabase
    .from('portal_client_plans')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (!includeAllStatuses) {
    query = query.eq('status', 'publicado')
  }

  return query
}

export function getPlanById(supabase: SupabaseClient, id: string) {
  return supabase
    .from('portal_client_plans')
    .select('*')
    .eq('id', id)
    .maybeSingle()
}

export function insertPlan(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('portal_client_plans').insert(payload).select('id')
}

export function updatePlanContent(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  return supabase.from('portal_client_plans').update(payload).eq('id', id).select('id')
}

export function updatePlanStatus(supabase: SupabaseClient, id: string, status: string, published_at: string | null) {
  return supabase.from('portal_client_plans').update({ status, published_at }).eq('id', id).select('id')
}
