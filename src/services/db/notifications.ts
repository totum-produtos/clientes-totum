import type { SupabaseClient } from '@supabase/supabase-js'

export function getNotifications(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
}

export function getNotificationsAll(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export function markNotificationRead(supabase: SupabaseClient, id: string, userId: string) {
  return supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', userId)
}

export function markAllNotificationsRead(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false)
    .eq('user_id', userId)
}

export function deleteNotification(supabase: SupabaseClient, id: string, userId: string) {
  return supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

export function insertNotification(supabase: SupabaseClient, payload: Record<string, unknown>) {
  return supabase.from('notifications').insert(payload)
}

export function insertNotifications(supabase: SupabaseClient, payloads: Record<string, unknown>[]) {
  return supabase.from('notifications').insert(payloads)
}

export function deleteNotificationsByClientData(supabase: SupabaseClient, clientId: string) {
  return supabase.from('notifications').delete().eq('data->>client_id' as never, clientId)
}
