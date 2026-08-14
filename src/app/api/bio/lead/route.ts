// Captura de lead da bio pública (nome + whatsapp/e-mail). Endpoint
// público, sem auth. Honeypot silencioso: se o campo armadilha vier
// preenchido, respondemos sucesso sem gravar nada (não denuncia pro bot).

import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logEvent } from "@/lib/log-event";
import { createBioAdminClient, resolveActiveBioProfile } from "@/lib/bio/resolve-active-profile";
import { getBioProductExists, insertBioLead, insertBioClickEvent } from "@/services/db/bio";
import { getClientUsersByClient } from "@/services/db/clients";
import { insertNotifications } from "@/services/db/notifications";

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

  const admin = createBioAdminClient();
  const resolved = await resolveActiveBioProfile(admin, slug);
  if (!resolved || !resolved.profile.lead_capture_enabled) {
    return NextResponse.json({ error: "Não foi possível enviar." }, { status: 400 });
  }
  const { client, profile } = resolved;

  let validProductId: string | null = null;
  if (sourceProductId) {
    const { data: product } = await getBioProductExists(admin, sourceProductId, profile.id);
    if (product) validProductId = product.id;
  }

  const referrer = request.headers.get("referer") || null;

  const { error: leadError } = await insertBioLead(admin, {
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

  const { error: eventError } = await insertBioClickEvent(admin, {
    client_id: client.id,
    target_type: "lead_submit",
    target_id: validProductId,
  });
  if (eventError) {
    await logEvent(admin, "error", "api/bio/lead", eventError.message, {
      clientId: client.id,
      targetId: validProductId,
    });
  }

  const { data: clientUsers } = await getClientUsersByClient(admin, client.id);

  if (clientUsers && clientUsers.length > 0) {
    await insertNotifications(
      admin,
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
