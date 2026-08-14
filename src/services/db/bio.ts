import type { SupabaseClient } from '@supabase/supabase-js'

export function getBioProfileByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('bio_profiles').select('id').eq('client_id', clientId).maybeSingle()
}

export function getBioProfileFull(supabase: SupabaseClient, clientId: string) {
  return supabase.from('bio_profiles').select('*').eq('client_id', clientId).maybeSingle()
}

export function insertBioProfile(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('bio_profiles').insert(payload).select('id')
}

export function updateBioProfile(supabase: SupabaseClient, id: string, patch: Record<string, unknown>) {
  return supabase.from('bio_profiles').update(patch).eq('id', id).select('id')
}

export function upsertBioProfile(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('bio_profiles').upsert(payload).select('*').single()
}

export function getBioLinks(supabase: SupabaseClient, bioId: string) {
  return supabase.from('bio_links').select('*').eq('bio_id', bioId).order('ordem')
}

export function getBioLinksLabels(supabase: SupabaseClient, bioId: string) {
  return supabase.from('bio_links').select('id, label').eq('bio_id', bioId)
}

export function insertBioLink(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('bio_links').insert(payload).select('*').single()
}

export function updateBioLink(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  return supabase.from('bio_links').update(payload).eq('id', id).select('*').single()
}

export function deleteBioLink(supabase: SupabaseClient, id: string) {
  return supabase.from('bio_links').delete().eq('id', id)
}

export function getBioProducts(supabase: SupabaseClient, bioId: string) {
  return supabase.from('bio_products').select('*').eq('bio_id', bioId).order('ordem')
}

export function getBioProductsLabels(supabase: SupabaseClient, bioId: string) {
  return supabase.from('bio_products').select('id, nome').eq('bio_id', bioId)
}

export function getBioProductExists(supabase: SupabaseClient, id: string, bioId: string) {
  return supabase.from('bio_products').select('id').eq('id', id).eq('bio_id', bioId).maybeSingle()
}

export function insertBioProduct(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('bio_products').insert(payload).select('*').single()
}

export function updateBioProduct(supabase: SupabaseClient, id: string, payload: Record<string, unknown>) {
  return supabase.from('bio_products').update(payload).eq('id', id).select('*').single()
}

export function deleteBioProduct(supabase: SupabaseClient, id: string) {
  return supabase.from('bio_products').delete().eq('id', id)
}

export function getBioLeads(supabase: SupabaseClient, clientId: string) {
  return supabase
    .from('bio_leads')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(200)
}

export function insertBioLead(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('bio_leads').insert(payload)
}

export function getBioClickEvents(supabase: SupabaseClient, clientId: string, since: string) {
  return supabase
    .from('bio_click_events')
    .select('*')
    .eq('client_id', clientId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(3000)
}

export function insertBioClickEvent(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('bio_click_events').insert(payload)
}

export function getBioLinkExists(supabase: SupabaseClient, id: string, bioId: string) {
  return supabase
    .from('bio_links')
    .select('id')
    .eq('id', id)
    .eq('bio_id', bioId)
    .eq('is_active', true)
    .maybeSingle()
}

export function getBioProductActiveExists(supabase: SupabaseClient, id: string, bioId: string) {
  return supabase
    .from('bio_products')
    .select('id')
    .eq('id', id)
    .eq('bio_id', bioId)
    .eq('is_active', true)
    .maybeSingle()
}
