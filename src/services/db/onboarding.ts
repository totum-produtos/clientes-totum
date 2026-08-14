import type { SupabaseClient } from '@supabase/supabase-js'

export function getInviteByToken(supabase: SupabaseClient, token: string) {
  return supabase
    .from('client_invites')
    .select('id, client_id, email, expires_at, used_at, portal_clients(nome)')
    .eq('token', token)
    .single()
}

export function markInviteUsed(supabase: SupabaseClient, id: string, used_at: string) {
  return supabase.from('client_invites').update({ used_at }).eq('id', id)
}

export function invalidatePendingInvites(supabase: SupabaseClient, clientId: string, email: string, used_at: string) {
  return supabase
    .from('client_invites')
    .update({ used_at })
    .eq('client_id', clientId)
    .eq('email', email)
    .is('used_at', null)
}

export function insertInvite(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('client_invites').insert(payload)
}

export function getOnboardingInviteByToken(supabase: SupabaseClient, token: string) {
  return supabase
    .from('client_onboarding_invites')
    .select('token, email, nome_pre, draft_data, current_step, expires_at, used_at')
    .eq('token', token)
    .maybeSingle()
}

export function getOnboardingInviteForFinalize(supabase: SupabaseClient, token: string) {
  return supabase
    .from('client_onboarding_invites')
    .select('id, email, draft_data, used_at, expires_at')
    .eq('token', token)
    .maybeSingle()
}

export function getOnboardingInviteForSave(supabase: SupabaseClient, token: string) {
  return supabase
    .from('client_onboarding_invites')
    .select('id, used_at, expires_at')
    .eq('token', token)
    .maybeSingle()
}

export function updateOnboardingInviteDraft(supabase: SupabaseClient, id: string, draft_data: unknown, current_step: unknown) {
  return supabase
    .from('client_onboarding_invites')
    .update({ draft_data, current_step })
    .eq('id', id)
}

export function updateOnboardingInviteUsed(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  return supabase.from('client_onboarding_invites').update(payload).eq('id', id)
}

export function invalidatePendingOnboardingInvites(supabase: SupabaseClient, email: string, used_at: string) {
  return supabase
    .from('client_onboarding_invites')
    .update({ used_at })
    .eq('email', email)
    .is('used_at', null)
}

export function insertOnboardingInvite(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('client_onboarding_invites').insert(payload).select('id, token, expires_at').single()
}

export function deleteInvitesByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('client_invites').delete().eq('client_id', clientId)
}
