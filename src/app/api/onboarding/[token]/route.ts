// Endpoint público: valida token de onboarding e devolve o rascunho.
// Não requer auth. Usa SERVICE_ROLE_KEY (server-side) porque o
// próprio token funciona como credencial.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 400 });
  }

  const admin = adminClient();
  const { data: invite, error } = await admin
    .from("client_onboarding_invites")
    .select("token, email, nome_pre, draft_data, current_step, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado", code: "not_found" }, { status: 404 });
  }
  if (invite.used_at) {
    return NextResponse.json({ error: "Convite já utilizado", code: "used" }, { status: 410 });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Convite expirado", code: "expired" }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    invite: {
      email: invite.email,
      nome_pre: invite.nome_pre,
      draft_data: invite.draft_data ?? {},
      current_step: invite.current_step ?? 1,
      expires_at: invite.expires_at,
    },
  });
}
