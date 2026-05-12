// src/app/api/admin/clientes/acesso/route.ts
//
// Ações de acesso do cliente para o painel admin:
//   - reenviar-convite: gera link de acesso para o cliente
//       - usuário novo  → type:'invite'
//       - usuário já existe no auth → type:'recovery' (reset de senha)
//       Em ambos os casos: garante portal_client_users vinculado.
//   - criar-senha: define senha diretamente para o auth user
//       - busca user_id via portal_client_users OU pelo email no auth
//       - se encontrado por email mas sem vínculo → cria o vínculo antes
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

/**
 * Encontra um auth user pelo email (comparação case-insensitive).
 * Necessário porque portal_client pode ter "Biofuturas@gmail.com"
 * enquanto auth.users registrou "biofuturas@gmail.com".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findAuthUserByEmail(admin: any, email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return null;
  const normalized = email.toLowerCase().trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.users as any[]).find((u) => u.email?.toLowerCase().trim() === normalized) ?? null;
}

/** Garante que portal_client_users e user_roles existem para o par (userId, clientId). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureClientLink(admin: any, userId: string, clientId: string) {
  await admin
    .from("user_roles")
    .upsert({ user_id: userId, role: "cliente" }, { onConflict: "user_id" });

  await admin
    .from("portal_client_users")
    .upsert({ user_id: userId, client_id: clientId, role: "cliente" }, {
      onConflict: "user_id,client_id",
    });
}

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

    const email = client.email_responsavel;

    // ── Ação: reenviar convite ─────────────────────────────────────────────
    if (body.action === "reenviar-convite") {
      const origin =
        request.headers.get("origin") ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://cliente.grupototum.com";
      const redirectTo = `${origin}/auth/reset-password?invite=true`;

      // Tenta 'invite'. Se o usuário já existe no auth, usa 'recovery'.
      let actionLink: string | undefined;

      const { data: inviteData, error: inviteErr } = await admin.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo, data: { portal_client_id: body.clientId, must_change_password: true } },
      });

      if (!inviteErr && inviteData?.properties?.action_link) {
        // Usuário novo — garante vínculo
        await ensureClientLink(admin, inviteData.user.id, body.clientId);
        actionLink = inviteData.properties.action_link;
      } else {
        // Usuário já existe → usa recovery (link de redefinição de senha)
        const existingUser = await findAuthUserByEmail(admin, email);
        if (!existingUser) {
          throw new Error(inviteErr?.message || "Não foi possível gerar o link de acesso");
        }

        // Garante vínculo mesmo que tenha sido perdido
        await ensureClientLink(admin, existingUser.id, body.clientId);

        // Usa o email exato do auth (pode diferir em maiúsculas do portal_client)
        const { data: recoveryData, error: recoveryErr } = await admin.auth.admin.generateLink({
          type: "recovery",
          email: existingUser.email,
          options: { redirectTo },
        });

        if (recoveryErr || !recoveryData?.properties?.action_link) {
          throw new Error(recoveryErr?.message || "Falha ao gerar link de recuperação");
        }
        actionLink = recoveryData.properties.action_link;
      }

      return NextResponse.json({
        success: true,
        inviteLink: actionLink,
        email,
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

      // 1. Tenta encontrar via portal_client_users
      let userId: string | null = null;

      const { data: link } = await admin
        .from("portal_client_users")
        .select("user_id")
        .eq("client_id", body.clientId)
        .maybeSingle();

      if (link?.user_id) {
        userId = link.user_id;
      } else {
        // 2. Fallback: busca o auth user pelo email (case-insensitive)
        const existingUser = await findAuthUserByEmail(admin, email);
        if (existingUser) {
          userId = existingUser.id as string;
          // Recria o vínculo perdido
          await ensureClientLink(admin, userId, body.clientId);
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: "Nenhum usuário encontrado com o email deste cliente. Envie o link de convite primeiro." },
          { status: 404 },
        );
      }

      const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
        password: body.senha,
      });

      if (updateErr) throw new Error(updateErr.message);

      return NextResponse.json({
        success: true,
        email,
        message: "Senha definida com sucesso",
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
