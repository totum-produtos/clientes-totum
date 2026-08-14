import type { SupabaseClient } from '@supabase/supabase-js'

export function getAdCampaigns(supabase: SupabaseClient, clientId: string) {
  return supabase.from('ad_campaigns').select('*').eq('portal_client_id', clientId)
}

export function getTarefas(supabase: SupabaseClient, clientId: string) {
  return supabase
    .from('tarefas')
    .select('id, titulo, status, prioridade, data_limite, departamento, descricao')
    .eq('portal_client_id', clientId)
    .order('created_at', { ascending: false })
}

export function deleteTarefasByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('tarefas').delete().eq('portal_client_id', clientId)
}

export function deleteProjectsByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('projetos').delete().eq('portal_client_id', clientId)
}

export function deleteCampaignsByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('ad_campaigns').delete().eq('portal_client_id', clientId)
}

export function deleteRagDocsByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('rag_documents').delete().eq('client_id', clientId)
}
