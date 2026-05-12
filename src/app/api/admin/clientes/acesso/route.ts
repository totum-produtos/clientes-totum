// src/app/api/admin/clientes/acesso/route.ts
//
// Ações de acesso do cliente para o painel admin:
//   - reenviar-convite: gera novo magic link de convite (tipo 'invite')
//   - criar-senha: define senha diretamente para o usuário existente
//
// Requer: caller com role 'master'
// Usa: Supabase Admin API (service role key)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSSRClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

type Body =
  | { action: "reenviar-convite"; clientId: string }
  | { action: "criar-senha"; clientId: string; senha: string };

export async function POST(request: Request) {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = (await request.json()) as Body;

    if (!body.action || !body.clientId) {
      return NextResponse.json(
        { error: "action e clientId são obrigatórios" },
        { status: 400 },
      );
    }

    // Verifica que quem chama é master
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

    if (callerRole?.role !== "master") {
      return NextResponse.json(
        { error: "Apenas usuários master podem gerenciar o acesso de clientes" },
        { status: 403 },
      );
    }

    // Busca dados do cliente
    const { data: client, error: clientErr } = await admin
      .from("portal_clients")
      .select("id, email_responsavel, nome")
      .eq("id", body.clientId)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // ── Ação: reenviar convite ─────────────────────────────────────────────
    if (body.action === "reenviar-convite") {
      const origin =
        request.headers.get("origin") ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://cliente.grupototum.com";
      const redirectTo = `${origin}/auth/reset-password?invite=true`;

      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: "invite",
        email: client.email_responsavel,
        options: {
          redirectTo,
          data: {
            portal_client_id: body.clientId,
            must_change_password: true,
          },
        },
      });

      if (linkErr || !linkData?.properties?.action_link) {
        throw new Error(linkErr?.message || "Falha ao gerar link de convite");
      }

      return NextResponse.json({
        success: true,
        inviteLink: linkData.properties.action_link,
        email: client.email_responsavel,
      });
    }

    // ── Ação: criar senha ─────────────────────────────────────────────────
    if (body.action === "criar-senha") {
      if (!body.senha || body.senha.length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter pelo menos 6 caracteres" },
          { status: 400 },
        );
      }

      // Busca o auth user_id via portal_client_users
      const { data: link, error: linkErr } = await admin
        .from("portal_client_users")
        .select("user_id")
        .eq("client_id", body.clientId)
        .maybeSingle();

      if (linkErr || !link?.user_id) {
        return NextResponse.json(
          { error: "Usuário de acesso não encontrado para este cliente. Envie o convite primeiro." },
          { status: 404 },
        );
      }

      const { error: updateErr } = await admin.auth.admin.updateUserById(
        link.user_id,
        { password: body.senha },
      );

      if (updateErr) {
        throw new Error(updateErr.message);
      }

      return NextResponse.json({
        success: true,
        email: client.email_responsavel,
        message: "Senha definida com sucesso",
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
