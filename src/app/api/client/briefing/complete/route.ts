import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.PRIVATE_SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jwt = authHeader.replace("Bearer ", "");
  const supabase = createAdminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  // Find the client linked to this user
  const { data: pcUser, error: pcUserError } = await supabase
    .from("portal_client_users")
    .select("client_id")
    .eq("user_id", userData.user.id)
    .single();

  if (pcUserError || !pcUser) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const { data: client, error: clientError } = await supabase
    .from("portal_clients")
    .select("profile_data")
    .eq("id", pcUser.client_id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Dados do cliente não encontrados" }, { status: 404 });
  }

  const profileData = client.profile_data || {};
  profileData.briefing_completed = true;

  const { error: updateError } = await supabase
    .from("portal_clients")
    .update({ profile_data: profileData })
    .eq("id", pcUser.client_id);

  if (updateError) {
    return NextResponse.json({ error: "Erro ao atualizar briefing" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
