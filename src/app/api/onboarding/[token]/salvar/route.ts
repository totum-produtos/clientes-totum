// Auto-save do rascunho do briefing.
// Não cria portal_client nem usuário — só grava draft_data + current_step.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

type Body = {
  draft_data: Record<string, unknown>;
  current_step?: number;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  if (!body.draft_data || typeof body.draft_data !== "object") {
    return NextResponse.json({ error: "draft_data obrigatório" }, { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: invite, error: lookupErr } = await admin
    .from("client_onboarding_invites")
    .select("id, used_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (lookupErr) {
    return NextResponse.json({ error: lookupErr.message }, { status: 500 });
  }
  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }
  if (invite.used_at) {
    return NextResponse.json({ error: "Convite já utilizado" }, { status: 410 });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
  }

  const updates: Record<string, unknown> = {
    draft_data: body.draft_data,
  };
  if (typeof body.current_step === "number" && body.current_step >= 1 && body.current_step <= 20) {
    updates.current_step = body.current_step;
  }

  const { error: updateErr } = await admin
    .from("client_onboarding_invites")
    .update(updates)
    .eq("id", invite.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, saved_at: new Date().toISOString() });
}
