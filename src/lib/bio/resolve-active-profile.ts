// ⚠️ Server-only. Importe SÓ de Server Components ou Route Handlers.
//
// Único ponto de checagem de acesso público da bio: slug → portal_clients
// → bio_profiles → is_active. Como as tabelas bio_* negam acesso a anon
// por padrão na RLS, esta checagem É a única camada de controle de acesso
// — getPublicBio, /api/bio/track e /api/bio/lead usam este helper em vez
// de reimplementar a mesma sequência cada um por conta própria.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

export function createBioAdminClient() {
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type BioAdminClient = ReturnType<typeof createBioAdminClient>;

export interface ActiveBioProfile {
  client: { id: string; nome: string; slug: string };
  profile: {
    id: string;
    display_name: string;
    headline: string | null;
    avatar_url: string | null;
    logo_url: string | null;
    cor_primaria: string | null;
    cor_secundaria: string | null;
    cor_fundo: string | null;
    lead_capture_enabled: boolean;
    lead_capture_titulo: string | null;
  };
}

export async function resolveActiveBioProfile(
  admin: BioAdminClient,
  slug: string,
): Promise<ActiveBioProfile | null> {
  if (!slug) return null;

  const { data: client } = await admin
    .from("portal_clients")
    .select("id, nome, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!client) return null;

  const { data: profile } = await admin
    .from("bio_profiles")
    .select(
      "id, display_name, headline, avatar_url, logo_url, cor_primaria, cor_secundaria, cor_fundo, lead_capture_enabled, lead_capture_titulo, is_active",
    )
    .eq("client_id", client.id)
    .maybeSingle();
  if (!profile || !profile.is_active) return null;

  return {
    client,
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      headline: profile.headline,
      avatar_url: profile.avatar_url,
      logo_url: profile.logo_url,
      cor_primaria: profile.cor_primaria,
      cor_secundaria: profile.cor_secundaria,
      cor_fundo: profile.cor_fundo,
      lead_capture_enabled: profile.lead_capture_enabled,
      lead_capture_titulo: profile.lead_capture_titulo,
    },
  };
}
