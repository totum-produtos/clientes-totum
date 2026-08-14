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
import { getUserRole, upsertUserRole } from "@/services/db/users";
import { insertClient, insertClientUser, deleteClient } from "@/services/db/clients";
import { insertSystemLog } from "@/services/db/admin";

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

function gerarSenhaTemporaria() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64url")
    .replace(/[-_]/g, "A")
    .slice(0, 18);
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

    const { data: callerRole } = await getUserRole(admin, callerId);

    if (callerRole?.role !== "master") {
      return NextResponse.json(
        { error: "Apenas usuários master podem criar clientes" },
        { status: 403 },
      );
    }

    // 2. Cria portal_client
    const { data: client, error: insertErr } = await insertClient(admin, {
      nome: body.nome,
      slug: gerarSlug(body.nome),
      email_responsavel: body.email_responsavel,
      contato_principal: body.telefone ?? null,
      status: "active",
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
    });

    if (insertErr || !client) {
      throw new Error(insertErr?.message || "Falha ao criar portal_client");
    }
    createdClientId = client.id;

    // 3. Cria usuário com senha temporária única
    const senhaTemporaria = gerarSenhaTemporaria();
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: body.email_responsavel,
      password: senhaTemporaria,
      email_confirm: true,
      user_metadata: {
        portal_client_id: createdClientId,
        must_change_password: true,
      }
    });

    if (authErr || !authData?.user) {
      throw new Error(authErr?.message || "Falha ao criar usuário de acesso");
    }

    const newUserId = authData.user.id;

    // 4. Vincula em user_roles + portal_client_users
    const { error: roleErr } = await upsertUserRole(admin, { user_id: newUserId, role: "cliente" }, "user_id");

    if (roleErr) {
      throw new Error(`Falha ao criar user_role: ${roleErr.message}`);
    }

    const { error: linkUserErr } = await insertClientUser(admin, {
      user_id: newUserId,
      client_id: createdClientId,
      role: "cliente",
    });

    if (linkUserErr) {
      throw new Error(`Falha ao vincular usuário ao cliente: ${linkUserErr.message}`);
    }

    const welcomeMessage = `Olá, ${body.nome}! Seu acesso à nossa plataforma foi criado com sucesso.

Acesse: https://cliente.grupototum.com
Login: ${body.email_responsavel}
Senha temporária: ${senhaTemporaria}

Ao acessar pela primeira vez, o sistema exigirá que você redefina esta senha para uma de sua preferência. Estamos ansiosos para começar!`;

    return NextResponse.json({
      success: true,
      clientId: createdClientId,
      userId: newUserId,
      welcomeMessage: welcomeMessage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    // Registra o motivo da falha ANTES do rollback — senão a criação some
    // sem deixar rastro (era a origem do "criei e sumiu"). Protegido para
    // que uma falha de logging não impeça o rollback.
    try {
      await insertSystemLog(admin, {
        level: "error",
        source: "api/admin/clientes/criar",
        message,
        metadata: { createdClientId, rolledBack: Boolean(createdClientId) },
      });
    } catch { /* logging não deve quebrar o rollback */ }
    // Rollback: se o portal_client foi criado mas algo depois falhou, remove
    if (createdClientId) {
      await deleteClient(admin, createdClientId);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
