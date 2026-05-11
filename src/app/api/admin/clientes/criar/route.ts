// src/app/api/admin/clientes/criar/route.ts
//
// Cria um novo cliente do portal + usuário de acesso (via Supabase Admin)
// e devolve um link de convite único (magic link de uso único).
//
// Fluxo:
//   1. Verifica que o usuário chamando é master.
//   2. Cria o portal_client.
//   3. Gera invite link via auth.admin.generateLink({ type: 'invite' }) —
//      isso já cria o auth.user e retorna a action_link.
//   4. Vincula em user_roles (role: cliente) e portal_client_users.
//   5. Em caso de erro após criar o client, faz rollback (DELETE).
//
// O admin copia o link retornado e envia ao cliente (WhatsApp/email).
// Ao clicar, o cliente cai em /auth/reset-password?invite=true para
// criar a senha e em seguida é redirecionado para /app/meu-cadastro.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSSRClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

type Body = {
  nome: string;
  cnpj?: string;
  nome_responsavel?: string;
  email_responsavel: string;
  telefone?: string;
  site?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  ramo_atuacao?: string;
  tempo_mercado?: string;
  descricao_negocio?: string;
  produtos_servicos?: string;
  tamanho_empresa?: string;
  faturamento_mensal?: string;
  profile_data?: Record<string, unknown>;
};

function gerarSlug(nome: string) {
  return (
    nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `cliente-${Date.now()}`
  );
}

export async function POST(request: Request) {
  let createdClientId: string | null = null;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = (await request.json()) as Body;

    if (!body.nome?.trim()) {
      return NextResponse.json({ error: "Nome da empresa é obrigatório" }, { status: 400 });
    }
    if (!body.email_responsavel?.trim()) {
      return NextResponse.json({ error: "Email do responsável é obrigatório" }, { status: 400 });
    }

    // 1. Verifica que quem chama é master
    const ssr = await createSSRClient();
    const { data: userData, error: userErr } = await ssr.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const callerId = userData.user.id;

    const { data: callerRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .maybeSingle();

    if (callerRole?.role !== "master") {
      return NextResponse.json(
        { error: "Apenas usuários master podem criar clientes" },
        { status: 403 },
      );
    }

    // 2. Cria portal_client
    const { data: client, error: insertErr } = await admin
      .from("portal_clients")
      .insert({
        nome: body.nome,
        slug: gerarSlug(body.nome),
        email_responsavel: body.email_responsavel,
        contato_principal: body.telefone ?? null,
        status: "ativo",
        cnpj: body.cnpj ?? null,
        nome_responsavel: body.nome_responsavel ?? null,
        telefone: body.telefone ?? null,
        site: body.site ?? null,
        cor_primaria: body.cor_primaria ?? null,
        cor_secundaria: body.cor_secundaria ?? null,
        ramo_atuacao: body.ramo_atuacao ?? null,
        tempo_mercado: body.tempo_mercado ?? null,
        descricao_negocio: body.descricao_negocio ?? null,
        produtos_servicos: body.produtos_servicos ?? null,
        tamanho_empresa: body.tamanho_empresa ?? null,
        faturamento_mensal: body.faturamento_mensal ?? null,
        profile_data: body.profile_data ?? {},
      })
      .select("id")
      .single();

    if (insertErr || !client) {
      throw new Error(insertErr?.message || "Falha ao criar portal_client");
    }
    createdClientId = client.id;

    // 3. Gera invite link (cria auth.user + retorna action_link)
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://apps.grupototum.com";
    const redirectTo = `${origin}/api/auth/callback?next=${encodeURIComponent(
      "/auth/reset-password?invite=true",
    )}`;

    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "invite",
      email: body.email_responsavel,
      options: {
        redirectTo,
        data: {
          portal_client_id: createdClientId,
          must_change_password: true,
        },
      },
    });

    if (linkErr || !linkData?.user) {
      throw new Error(linkErr?.message || "Falha ao gerar link de convite");
    }

    const newUserId = linkData.user.id;
    const actionLink = linkData.properties?.action_link;

    if (!actionLink) {
      throw new Error("Supabase não retornou action_link");
    }

    // 4. Vincula em user_roles + portal_client_users
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: newUserId, role: "cliente" }, { onConflict: "user_id" });

    if (roleErr) {
      throw new Error(`Falha ao criar user_role: ${roleErr.message}`);
    }

    const { error: linkUserErr } = await admin.from("portal_client_users").insert({
      user_id: newUserId,
      client_id: createdClientId,
      role: "cliente",
    });

    if (linkUserErr) {
      throw new Error(`Falha ao vincular usuário ao cliente: ${linkUserErr.message}`);
    }

    return NextResponse.json({
      success: true,
      clientId: createdClientId,
      userId: newUserId,
      inviteLink: actionLink,
    });
  } catch (err) {
    // Rollback: se o portal_client foi criado mas algo depois falhou, remove
    if (createdClientId) {
      await admin.from("portal_clients").delete().eq("id", createdClientId);
    }
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
