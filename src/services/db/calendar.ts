import type { SupabaseClient } from '@supabase/supabase-js'

export function getPostsByClient(supabase: SupabaseClient, clientId: string) {
  return supabase
    .from('wanda_posts')
    .select('id, subject, tipo, published_at, views, likes, engagement_rate')
    .eq('portal_client_id', clientId)
    .order('published_at', { ascending: false })
}

export function getPostsForCampaigns(supabase: SupabaseClient, clientId: string) {
  return supabase
    .from('wanda_posts')
    .select('id, subject, tipo, views, likes, engagement_rate, conversion_rate, published_at')
    .eq('portal_client_id', clientId)
}

export function getPostsForFeed(supabase: SupabaseClient, clientId: string, inicio: string, fim: string) {
  return supabase
    .from('wanda_posts')
    .select('id, subject, tipo, published_at, views, likes, engagement_rate, conversion_rate, created_at')
    .eq('portal_client_id', clientId)
    .gte('published_at', inicio)
    .lte('published_at', fim)
    .order('published_at', { ascending: false })
}

export function updatePost(supabase: SupabaseClient, id: string | number, payload: Record<string, unknown>) {
  return supabase.from('wanda_posts').update(payload).eq('id', id).select('id')
}

export function insertPost(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('wanda_posts').insert(payload)
}

export function insertPosts(supabase: SupabaseClient, payloads: Record<string, unknown>[]) {
  return supabase.from('wanda_posts').insert(payloads)
}

export function deletePost(supabase: SupabaseClient, id: string | number) {
  return supabase.from('wanda_posts').delete().eq('id', id)
}

export function deletePostsByClient(supabase: SupabaseClient, clientId: string) {
  return supabase.from('wanda_posts').delete().eq('portal_client_id', clientId)
}
