// ⚠️ Server-only. Importe SÓ de Server Components ou Route Handlers
// (nunca de um arquivo "use client") — usa a service role key e nunca
// deve ser bundlado no cliente.
//
// portal_clients guarda tokens OAuth (google_refresh_token,
// meta_access_token...) em texto puro. Este é o ÚNICO lugar do projeto
// autorizado a ler portal_clients para servir dado público — e por isso
// SEMPRE seleciona colunas explícitas, nunca select('*').

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

function adminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.PRIVATE_SUPABASE_SERVICE_KEY || "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export interface PublicBioLink {
  id: string;
  label: string;
  url: string;
  icone: string | null;
  ordem: number;
}

export interface PublicBioProduct {
  id: string;
  nome: string;
  descricao: string | null;
  preco_label: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  ordem: number;
}

export interface PublicBioProfile {
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
}

export interface PublicBioData {
  client: { id: string; nome: string; slug: string };
  profile: PublicBioProfile;
  links: PublicBioLink[];
  products: PublicBioProduct[];
}

export async function getPublicBio(slug: string): Promise<PublicBioData | null> {
  if (!slug) return null;
  const admin = adminClient();

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

  const [{ data: links }, { data: products }] = await Promise.all([
    admin
      .from("bio_links")
      .select("id, label, url, icone, ordem")
      .eq("bio_id", profile.id)
      .eq("is_active", true)
      .order("ordem"),
    admin
      .from("bio_products")
      .select("id, nome, descricao, preco_label, image_url, cta_label, cta_url, ordem")
      .eq("bio_id", profile.id)
      .eq("is_active", true)
      .order("ordem"),
  ]);

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
    links: links || [],
    products: products || [],
  };
}

export interface PublicBioProductPage {
  client: PublicBioData["client"];
  profile: PublicBioProfile;
  product: PublicBioProduct;
}

export async function getPublicBioProduct(
  slug: string,
  productId: string,
): Promise<PublicBioProductPage | null> {
  const bio = await getPublicBio(slug);
  if (!bio) return null;
  const product = bio.products.find((p) => p.id === productId);
  if (!product) return null;
  return { client: bio.client, profile: bio.profile, product };
}
