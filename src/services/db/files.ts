import type { SupabaseClient } from '@supabase/supabase-js'

export function listClientFiles(supabase: SupabaseClient, path: string, options?: Record<string, unknown>) {
  return supabase.storage.from('client_files').list(path, options)
}

export function uploadClientFile(supabase: SupabaseClient, path: string, file: File) {
  return supabase.storage.from('client_files').upload(path, file)
}

export function createSignedUrl(supabase: SupabaseClient, path: string, expiresIn: number) {
  return supabase.storage.from('client_files').createSignedUrl(path, expiresIn)
}

export function removeClientFile(supabase: SupabaseClient, paths: string[]) {
  return supabase.storage.from('client_files').remove(paths)
}

export function uploadBioAsset(supabase: SupabaseClient, path: string, file: File | Blob, options?: Record<string, unknown>) {
  return supabase.storage.from('bio_assets').upload(path, file, options)
}

export function getBioAssetPublicUrl(supabase: SupabaseClient, path: string) {
  return supabase.storage.from('bio_assets').getPublicUrl(path)
}

export function uploadAvatar(supabase: SupabaseClient, path: string, file: File | Blob, options?: Record<string, unknown>) {
  return supabase.storage.from('avatars').upload(path, file, options)
}

export function getAvatarPublicUrl(supabase: SupabaseClient, path: string) {
  return supabase.storage.from('avatars').getPublicUrl(path)
}
