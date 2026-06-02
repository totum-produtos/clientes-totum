// Gera um link de auto-onboarding para um cliente novo.
// O cliente preenche o briefing completo via /onboarding/[token]
// antes mesmo de existir como portal_client.
//
// Apenas master/admin.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSSRClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

type Body = {
  email: string;
  nome_pre?: string;
};

export async function POST(request: Request) {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = (await request.json()) as Body;
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const ssr = await createSSRClient();
    const { data: userData, error: userErr } = await ssr.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (callerRole?.role !== "master" && callerRole?.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas master/admin podem gerar convites" },
        { status: 403 },
      );
    }

    // Invalida convites pendentes anteriores para esse email.
    await admin
      .from("client_onboarding_invites")
      .update({ used_at: new Date().toISOString() })
      .eq("email", email)
      .is("used_at", null);

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: invite, error: insertErr } = await admin
      .from("client_onboarding_invites")
      .insert({
        token,
        email,
        nome_pre: body.nome_pre?.trim() || null,
        expires_at: expiresAt,
        created_by: userData.user.id,
      })
      .select("id, token, expires_at")
      .single();

    if (insertErr || !invite) {
      throw new Error(insertErr?.message || "Falha ao criar convite");
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const url = `${origin}/onboarding/${invite.token}`;

    return NextResponse.json({
      success: true,
      invite_id: invite.id,
      token: invite.token,
      expires_at: invite.expires_at,
      url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
