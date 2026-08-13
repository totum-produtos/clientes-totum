// ⚠️ Server-only. Importe SÓ de Server Components ou Route Handlers
// (nunca de um arquivo "use client") — usa a service role key e nunca
// deve ser bundlado no cliente.
//
// portal_clients guarda tokens OAuth (google_refresh_token,
// meta_access_token...) em texto puro. A checagem de acesso (slug ativo)
// mora em resolveActiveBioProfile — este arquivo só busca links/produtos
// em cima do resultado, nunca reimplementa a checagem.

import { createBioAdminClient, resolveActiveBioProfile, type ActiveBioProfile } from "./resolve-active-profile";

export type PublicBioProfile = ActiveBioProfile["profile"];

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

export interface PublicBioData {
  client: ActiveBioProfile["client"];
  profile: PublicBioProfile;
  links: PublicBioLink[];
  products: PublicBioProduct[];
}

export async function getPublicBio(slug: string): Promise<PublicBioData | null> {
  const admin = createBioAdminClient();
  const resolved = await resolveActiveBioProfile(admin, slug);
  if (!resolved) return null;
  const { client, profile } = resolved;

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
    profile,
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
