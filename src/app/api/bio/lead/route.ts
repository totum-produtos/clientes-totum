// Captura de lead da bio pública (nome + whatsapp/e-mail). Endpoint
// público, sem auth. Honeypot silencioso: se o campo armadilha vier
// preenchido, respondemos sucesso sem gravar nada (não denuncia pro bot).

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import type { Database } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

interface LeadBody {
  slug?: string;
  nome?: string;
  whatsapp?: string;
  email?: string;
  source_product_id?: string;
  // honeypot — input escondido no formulário; bots costumam preencher tudo
  empresa?: string;
}

const MAX_FIELD_LEN = 200;

function ok() {
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const rl = rateLimit(request, { key: "bio-lead", limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde um momento." },
      { status: 429, headers: rl.headers },
    );
  }

  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // Honeypot preenchido = bot. Finge sucesso, não grava nada.
  if (body.empresa) return ok();

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const nome = typeof body.nome === "string" ? body.nome.trim().slice(0, MAX_FIELD_LEN) : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim().slice(0, MAX_FIELD_LEN) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, MAX_FIELD_LEN) : "";
  const sourceProductId = typeof body.source_product_id === "string" ? body.source_product_id : undefined;

  if (!slug || !nome || (!whatsapp && !email)) {
    return NextResponse.json(
      { error: "Preencha o nome e pelo menos um contato (WhatsApp ou e-mail)." },
      { status: 400 },
    );
  }

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: client } = await admin
    .from("portal_clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!client) {
    return NextResponse.json({ error: "Não foi possível enviar." }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("bio_profiles")
    .select("id, is_active, lead_capture_enabled, display_name")
    .eq("client_id", client.id)
    .maybeSingle();
  if (!profile || !profile.is_active || !profile.lead_capture_enabled) {
    return NextResponse.json({ error: "Não foi possível enviar." }, { status: 400 });
  }

  let validProductId: string | null = null;
  if (sourceProductId) {
    const { data: product } = await admin
      .from("bio_products")
      .select("id")
      .eq("id", sourceProductId)
      .eq("bio_id", profile.id)
      .maybeSingle();
    if (product) validProductId = product.id;
  }

  const referrer = request.headers.get("referer") || null;

  const { error: leadError } = await admin.from("bio_leads").insert({
    client_id: client.id,
    nome,
    whatsapp: whatsapp || null,
    email: email || null,
    source_product_id: validProductId,
    referrer,
  });

  if (leadError) {
    return NextResponse.json({ error: "Não foi possível enviar. Tente novamente." }, { status: 500 });
  }

  await admin.from("bio_click_events").insert({
    client_id: client.id,
    target_type: "lead_submit",
    target_id: validProductId,
  });

  const { data: clientUsers } = await admin
    .from("portal_client_users")
    .select("user_id")
    .eq("client_id", client.id);

  if (clientUsers && clientUsers.length > 0) {
    await admin.from("notifications").insert(
      clientUsers.map((cu) => ({
        user_id: cu.user_id,
        type: "geral" as const,
        title: "Novo lead pelo Link na Bio",
        message: `${nome} deixou contato pela sua página de link na bio.`,
        data: { nome, whatsapp: whatsapp || null, email: email || null },
      })),
    );
  }

  return ok();
}
