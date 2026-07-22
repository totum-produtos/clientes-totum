import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type InviteRow = {
  id: string;
  client_id: string;
  email: string;
  expires_at: string | null;
  used_at: string | null;
  portal_clients: { nome: string } | null;
};

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.PRIVATE_SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function validateInvite(invite: InviteRow | null) {
  if (!invite) {
    return "Convite não encontrado. Solicite um novo convite.";
  }

  if (invite.used_at) {
    return "Este convite já foi utilizado. Faça login normalmente.";
  }

  const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;
  if (!expiresAt || expiresAt < new Date()) {
    return "Este convite expirou. Solicite um novo convite ao administrador.";
  }

  return null;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Token do convite é obrigatório" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("client_invites")
    .select("id, client_id, email, expires_at, used_at, portal_clients(nome)")
    .eq("token", token)
    .single<InviteRow>();

  if (error) {
    return NextResponse.json(
      { error: "Convite não encontrado. Solicite um novo convite." },
      { status: 404 },
    );
  }

  const validationError = validateInvite(data);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  return NextResponse.json({
    client_id: data.client_id,
    email: data.email,
    portal_clients: data.portal_clients,
    expires_at: data.expires_at,
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json(
      { error: "Token do convite é obrigatório" },
      { status: 400 },
    );
  }

  const jwt = authHeader.replace("Bearer ", "");
  const supabase = createAdminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);

  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const { data: invite, error: inviteError } = await supabase
    .from("client_invites")
    .select("id, client_id, email, expires_at, used_at, portal_clients(nome)")
    .eq("token", token)
    .single<InviteRow>();

  if (inviteError) {
    return NextResponse.json(
      { error: "Convite não encontrado. Solicite um novo convite." },
      { status: 404 },
    );
  }

  const validationError = validateInvite(invite);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (invite.email.toLowerCase() !== userData.user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Este convite pertence a outro email." },
      { status: 403 },
    );
  }

  const { error: linkError } = await supabase
    .from("portal_client_users")
    .upsert(
      {
        user_id: userData.user.id,
        client_id: invite.client_id,
        role: "cliente",
      },
      { onConflict: "user_id,client_id" },
    );

  if (linkError) {
    return NextResponse.json(
      { error: "Erro ao vincular ao cliente: " + linkError.message },
      { status: 500 },
    );
  }

  const { error: usedError } = await supabase
    .from("client_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (usedError) {
    return NextResponse.json(
      { error: "Conta criada, mas houve erro ao finalizar o convite." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
