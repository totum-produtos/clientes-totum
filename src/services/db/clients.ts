import type { SupabaseClient } from '@supabase/supabase-js'

export function getClients(supabase: SupabaseClient) {
  return supabase.from('portal_clients').select('*')
}

export function getAllClientsIdNome(supabase: SupabaseClient) {
  return supabase.from('portal_clients').select('id, nome').order('nome')
}

export function getAllClientsIdNomeSlug(supabase: SupabaseClient) {
  return supabase.from('portal_clients').select('id, nome, slug').order('nome')
}

export function getClientsActive(supabase: SupabaseClient) {
  return supabase
    .from('portal_clients')
    .select('id, nome')
    .eq('status', 'active')
    .order('nome')
}

export function getClientsActiveWithSlug(supabase: SupabaseClient) {
  return supabase
    .from('portal_clients')
    .select('id, nome, slug')
    .eq('status', 'active')
    .order('nome', { ascending: true })
}

export function getClientsActiveForContent(supabase: SupabaseClient) {
  return supabase
    .from('portal_clients')
    .select('id, nome, slug, status, cor_primaria, cor_secundaria')
    .eq('status', 'active')
    .order('nome', { ascending: true })
}

export function getClientsActiveForPendencias(supabase: SupabaseClient) {
  return supabase
    .from('portal_clients')
    .select('id, nome, slug, drive_folder_cliente_id, profile_data')
    .eq('status', 'active')
    .order('nome')
}

export function getClientById(supabase: SupabaseClient, clientId: string) {
  return supabase.from('portal_clients').select('*').eq('id', clientId).single()
}

export function getClientNome(supabase: SupabaseClient, clientId: string) {
  return supabase.from('portal_clients').select('nome').eq('id', clientId).single()
}

export function getClientProfileData(supabase: SupabaseClient, clientId: string) {
  return supabase.from('portal_clients').select('profile_data').eq('id', clientId).single()
}

export function getClientDriveFolders(supabase: SupabaseClient, clientId: string) {
  return supabase
    .from('portal_clients')
    .select('drive_folder_id, drive_folder_cliente_id')
    .eq('id', clientId)
    .single()
}

export function insertClient(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('portal_clients').insert(payload).select('id').single()
}

export function updateClientStatus(supabase: SupabaseClient, id: string, status: string) {
  return supabase.from('portal_clients').update({ status }).eq('id', id).select('id')
}

export function updateClientDriveUrl(supabase: SupabaseClient, id: string, google_drive_folder_url: string | null) {
  return supabase.from('portal_clients').update({ google_drive_folder_url }).eq('id', id).select('id')
}

export function updateClientFields(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  return supabase.from('portal_clients').update(payload).eq('id', id).select('id')
}

export function updateClientProfileData(supabase: SupabaseClient, id: string, profile_data: unknown) {
  return supabase.from('portal_clients').update({ profile_data }).eq('id', id)
}

export function updateClientSingleField(supabase: SupabaseClient, id: string, field: string, value: unknown) {
  return supabase.from('portal_clients').update({ [field]: value }).eq('id', id)
}

export function updateClientDriveFolderCliente(supabase: SupabaseClient, id: string, drive_folder_cliente_id: string | null) {
  return supabase.from('portal_clients').update({ drive_folder_cliente_id }).eq('id', id).select('id')
}

export function updateClientMetaAds(supabase: SupabaseClient, id: string, meta_ad_account_id: string, meta_access_token: string) {
  return supabase.from('portal_clients').update({ meta_ad_account_id, meta_access_token }).eq('id', id).select('id')
}

export function updateClientGoogleAds(supabase: SupabaseClient, id: string, google_customer_id: string, google_developer_token: string) {
  return supabase.from('portal_clients').update({ google_customer_id, google_developer_token }).eq('id', id).select('id')
}

export function deleteClient(supabase: SupabaseClient, id: string) {
  return supabase.from('portal_clients').delete().eq('id', id)
}

export function getClientUsers(supabase: SupabaseClient) {
  return supabase.from('portal_client_users').select('*')
}

export function getClientUsersByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('portal_client_users').select('user_id').eq('client_id', clientId)
}

export function getClientUserByUser(supabase: SupabaseClient, userId: string) {
  return supabase.from('portal_client_users').select('client_id').eq('user_id', userId).single()
}

export function insertClientUser(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('portal_client_users').insert(payload)
}

export function upsertClientUser(supabase: SupabaseClient, payload: Record<string, unknown>, conflict: string) {
  return supabase.from('portal_client_users').upsert(payload, { onConflict: conflict })
}

export function deleteClientUsersByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('portal_client_users').delete().eq('client_id', clientId)
}

export function getClientsWithStats(supabase: SupabaseClient) {
  return supabase.rpc('get_clientes_com_stats')
}

export function getOtherClientsByUser(supabase: SupabaseClient, userId: string, excludeClientId: string) {
  return supabase
    .from('portal_client_users')
    .select('client_id')
    .eq('user_id', userId)
    .neq('client_id', excludeClientId)
}
