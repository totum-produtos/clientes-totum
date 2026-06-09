// Finaliza o onboarding: cria portal_client + usuario Supabase Auth,
// dispara email com credenciais e marca o convite como usado.
//
// Espelha src/app/api/admin/clientes/criar/route.ts mas dispensa
// autenticação porque o token do convite é a credencial.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { rateLimit } from "@/lib/rate-limit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cliente.grupototum.com";
const FROM_EMAIL = process.env.ONBOARDING_FROM_EMAIL || "Totum <contato@grupototum.com>";

function gerarSlug(nome: string) {
  return (
    nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `cliente-${Date.now()}`
  );
}

function gerarSenha() {
  // 12 chars, base64url, garante 1 dígito e 1 maiúscula por sufixo "A7"
  const raw = randomBytes(9).toString("base64url").slice(0, 10);
  return `${raw}A7`;
}

type Draft = Record<string, unknown>;

const PROFILE_KEYS = [
  "nicho_principal", "dores_principais", "desejos_objetivos", "faixa_etaria",
  "genero_alvo", "localizacao_alvo", "classe_social", "tom_voz", "fontes",
  "key_visual_desc", "key_visual_images", "personalidade_visual",
  "canais_atendimento", "crm_utilizado", "sla_resposta", "horario_inicio",
  "horario_fim", "dias_atendimento", "informacoes_adicionais", "personas",
  "circulo_dourado", "caracteristicas_marca", "puv",
  "modelo_negocio", "diferencial_competitivo", "produto_mais_forte",
  "produto_desejado_forte", "produto_mais_fraco", "ticket_medio_atual",
  "ticket_medio_ideal", "maior_objetivo_mkt", "principal_meta",
  "meta_mensuravel", "porcentagem_homens", "porcentagem_mulheres",
  "abrangencia_geografica", "cliente_ideal", "base_dados_clientes",
  "meses_alta_faturamento", "meses_baixa_faturamento", "periodo_forte_mes",
  "periodo_fraco_mes", "dias_fortes_semana", "dias_fracos_semana",
  "concorrentes_referencia", "concorrente_mais_forte",
  "pontos_fracos_concorrencia", "referencia_comunicacao", "visao_mercado",
  "canais_comunicacao_possuidos", "canal_maior_retorno",
  "canais_preferencia_contato", "monitoramento_canais", "acoes_passadas",
  "plano_marketing_existente", "trabalhou_agencia", "equipe_marketing",
  "processo_vendas_estruturado", "funil_vendas_conversao", "equipe_vendas",
  "canais_vendas", "custo_aquisicao_cac", "material_files",
  "material_file_names", "enviar_materiais_depois",
];

async function enviarCredenciais(opts: {
  nome: string;
  email: string;
  senha: string;
}) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY não configurada — email de credenciais NÃO enviado");
    return { sent: false, reason: "RESEND_API_KEY ausente" };
  }
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Seu acesso à plataforma Totum</title></head>
<body style="margin:0;padding:0;background:#F0EFED;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<div style="padding:40px 16px;background:#F0EFED;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:6px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.08);">
    <div style="background:#D93025;padding:44px 48px;text-align:center;">
      <img src="${SITE_URL}/logo.png" alt="Totum" style="height:52px;display:block;margin:0 auto;">
    </div>
    <div style="padding:44px 48px 40px;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#D93025;margin:0 0 18px;">Seu acesso está pronto</p>
      <h1 style="font-size:26px;font-weight:700;color:#111;line-height:1.3;margin:0 0 28px;letter-spacing:-.3px;">Obrigado, ${opts.nome}.</h1>
      <p style="font-size:15px;line-height:1.75;color:#444;margin:0 0 18px;">
        Recebemos seu briefing. Criamos sua conta na nossa plataforma — abaixo estão suas credenciais de acesso.
      </p>
      <div style="background:#FAF9F7;border-left:3px solid #D93025;border-radius:0 4px 4px 0;padding:22px 26px;margin:32px 0;">
        <p style="font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#D93025;margin:0 0 14px;">Credenciais</p>
        <p style="font-size:14px;color:#444;margin:0 0 8px;"><strong style="color:#111;">Login:</strong> ${opts.email}</p>
        <p style="font-size:14px;color:#444;margin:0;"><strong style="color:#111;">Senha temporária:</strong> <code style="background:#fff;padding:3px 8px;border-radius:4px;font-family:Courier New,monospace;color:#D93025;">${opts.senha}</code></p>
      </div>
      <div style="text-align:center;margin:36px 0 28px;">
        <a href="${SITE_URL}/auth/login" style="display:inline-block;background:#D93025;color:#FFF;text-decoration:none;font-size:15px;font-weight:600;padding:15px 40px;border-radius:4px;">Acessar minha conta</a>
        <p style="font-size:12px;color:#999;margin-top:10px;">No primeiro acesso, você será solicitado a trocar a senha.</p>
      </div>
      <p style="font-size:15px;line-height:1.75;color:#444;margin:18px 0 0;">Qualquer dúvida, responde este email mesmo.</p>
    </div>
    <div style="background:#F0EFED;border-top:1px solid #E5E4E2;padding:28px 48px;text-align:center;">
      <p style="font-size:13px;font-weight:600;color:#555;margin:0 0 6px;">Grupo Totum &mdash; Marketing para Resultados</p>
      <p style="font-size:12px;color:#999;margin:0;"><a href="mailto:hello@totum.com.br" style="color:#D93025;text-decoration:none;">hello@totum.com.br</a></p>
    </div>
  </div>
</div></body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: opts.email,
      subject: "Seu acesso à plataforma Totum está pronto ✅",
      html,
      headers: {
        "List-Unsubscribe": "<mailto:sair@totum.com.br>",
        "X-Mailer": "Totum Platform v1",
      },
    }),
  });
  if (!res.ok) {
    const errTxt = await res.text();
    console.error("Resend error:", errTxt);
    return { sent: false, reason: errTxt };
  }
  const j = await res.json();
  return { sent: true, id: j.id };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 400 });
  }

  // Finalização cria conta + dispara email. Limite apertado: 10/min por IP.
  const rl = rateLimit(request, { key: "onboarding-finalizar", limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento." },
      { status: 429, headers: rl.headers },
    );
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. valida convite
  const { data: invite, error: lookupErr } = await admin
    .from("client_onboarding_invites")
    .select("id, email, draft_data, used_at, expires_at")
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

  // 2. payload opcional pode incluir o draft mais recente (caso o cliente
  // tenha mudado algo na última etapa sem auto-save antes de finalizar)
  let bodyDraft: Draft | null = null;
  try {
    const body = await request.json();
    if (body && typeof body === "object" && body.draft_data) {
      bodyDraft = body.draft_data as Draft;
    }
  } catch {
    /* sem body, usa o que está no banco */
  }
  const draft: Draft = (bodyDraft || (invite.draft_data as Draft) || {}) as Draft;

  const nome = String(draft.nome || "").trim();
  const emailFromDraft = String(draft.email_responsavel || "").trim().toLowerCase();
  const email = emailFromDraft || invite.email;

  if (!nome) {
    return NextResponse.json(
      { error: "Nome da empresa não preenchido" },
      { status: 400 },
    );
  }
  if (!email) {
    return NextResponse.json({ error: "Email não preenchido" }, { status: 400 });
  }

  // 3. cria portal_client
  const profileData: Record<string, unknown> = {};
  for (const k of PROFILE_KEYS) {
    if (draft[k] !== undefined) profileData[k] = draft[k];
  }

  let createdClientId: string | null = null;
  try {
    const { data: client, error: insertErr } = await admin
      .from("portal_clients")
      .insert({
        nome,
        slug: gerarSlug(nome),
        email_responsavel: email,
        contato_principal: (draft.telefone as string) ?? null,
        status: "active",
        cnpj: (draft.cnpj as string) ?? null,
        nome_responsavel: (draft.nome_responsavel as string) ?? null,
        telefone: (draft.telefone as string) ?? null,
        site: (draft.site as string) ?? null,
        cor_primaria: (draft.cor_primaria as string) ?? null,
        cor_secundaria: (draft.cor_secundaria as string) ?? null,
        ramo_atuacao: (draft.ramo_atuacao as string) ?? null,
        tempo_mercado: (draft.tempo_mercado as string) ?? null,
        descricao_negocio: (draft.descricao_negocio as string) ?? null,
        produtos_servicos: (draft.produtos_servicos as string) ?? null,
        tamanho_empresa: (draft.tamanho_empresa as string) ?? null,
        faturamento_mensal: (draft.faturamento_mensal as string) ?? null,
        profile_data: profileData,
      })
      .select("id")
      .single();

    if (insertErr || !client) {
      throw new Error(insertErr?.message || "Falha ao criar portal_client");
    }
    createdClientId = client.id;

    // 4. cria usuário com senha aleatória
    const senha = gerarSenha();
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        portal_client_id: createdClientId,
        must_change_password: true,
      },
    });
    if (authErr || !authData?.user) {
      throw new Error(authErr?.message || "Falha ao criar usuário");
    }
    const newUserId = authData.user.id;

    // 5. vincula roles
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: newUserId, role: "cliente" }, { onConflict: "user_id" });
    if (roleErr) throw new Error(`Falha ao criar user_role: ${roleErr.message}`);

    const { error: linkErr } = await admin
      .from("portal_client_users")
      .insert({ user_id: newUserId, client_id: createdClientId, role: "cliente" });
    if (linkErr) throw new Error(`Falha ao vincular usuário: ${linkErr.message}`);

    // 6. marca convite como usado
    await admin
      .from("client_onboarding_invites")
      .update({
        used_at: new Date().toISOString(),
        created_portal_client_id: createdClientId,
        draft_data: draft,
      })
      .eq("id", invite.id);

    // 7. envia email com credenciais (não derruba a request se falhar)
    const mail = await enviarCredenciais({ nome, email, senha });

    return NextResponse.json({
      success: true,
      client_id: createdClientId,
      email,
      email_sent: mail.sent,
      // dev fallback: se o email não foi enviado, devolve a senha para o admin
      // copiar manualmente (não exposto ao cliente — só ao chamador da API).
      password_fallback: mail.sent ? undefined : senha,
    });
  } catch (err) {
    if (createdClientId) {
      await admin.from("portal_clients").delete().eq("id", createdClientId);
    }
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
