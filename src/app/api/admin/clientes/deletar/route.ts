// src/app/api/admin/clientes/deletar/route.ts
//
// Deleta um cliente e TUDO relacionado a ele, na ordem correta:
//   1. Dados do cliente (wanda_posts, tarefas, projetos, ad_campaigns,
//      client_profile_changes, client_invites, rag_documents, notifications)
//   2. Arquivos no Supabase Storage (bucket client_files)
//   3. portal_client_users (vínculo usuário ↔ cliente)
//   4. user_roles dos usuários exclusivos deste cliente
//   5. auth.users  dos usuários exclusivos deste cliente
//   6. portal_clients (o registro principal)
//
// Usuários que pertencem a OUTROS clientes além deste não são deletados
// do auth — apenas o vínculo deste cliente é removido.
//
// Requer: caller com role 'master'
// Usa: Supabase Admin API (service role key)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSSRClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

export async function DELETE(request: Request) {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "clientId é obrigatório" }, { status: 400 });
    }

    // 1. Verifica que quem chama é master
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
        { error: "Apenas usuários master podem deletar clientes" },
        { status: 403 },
      );
    }

    // 2. Confirma que o cliente existe
    const { data: client, error: clientErr } = await admin
      .from("portal_clients")
      .select("id, nome")
      .eq("id", clientId)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // 3. Coleta os user_ids vinculados a este cliente ANTES de deletar
    const { data: clientUsers } = await admin
      .from("portal_client_users")
      .select("user_id")
      .eq("client_id", clientId);

    const userIds: string[] = (clientUsers ?? []).map((r: { user_id: string }) => r.user_id);

    // 4. Para cada user, verifica se pertence a OUTROS clientes também
    //    (se sim, não apaga o auth user — só desvincula deste cliente)
    const usersToDeleteFromAuth: string[] = [];
    for (const uid of userIds) {
      const { data: otherLinks } = await admin
        .from("portal_client_users")
        .select("client_id")
        .eq("user_id", uid)
        .neq("client_id", clientId);

      if (!otherLinks || otherLinks.length === 0) {
        usersToDeleteFromAuth.push(uid);
      }
    }

    // 5. Deleta dados relacionados (order: sem FK dependência de portal_clients primeiro)
    await admin.from("wanda_posts").delete().eq("portal_client_id", clientId);
    await admin.from("tarefas").delete().eq("portal_client_id", clientId);
    await admin.from("projetos").delete().eq("portal_client_id", clientId);
    await admin.from("ad_campaigns").delete().eq("portal_client_id", clientId);
    await admin.from("client_profile_changes").delete().eq("portal_client_id", clientId);
    await admin.from("client_invites").delete().eq("client_id", clientId);
    await admin.from("rag_documents").delete().eq("client_id", clientId);

    // notifications: campo dentro de JSONB (sem FK real)
    await admin.from("notifications").delete().eq("data->>client_id" as never, clientId);

    // 6. Deleta arquivos do Storage (pasta raiz + subpastas)
    let storageWarning = false;
    try {
      const { data: rootFiles } = await admin.storage
        .from("client_files")
        .list(clientId, { limit: 1000 });

      if (rootFiles && rootFiles.length > 0) {
        // Verifica subpastas
        const allPaths: string[] = [];
        for (const item of rootFiles) {
          if (item.id === null) {
            // É uma pasta — lista conteúdo
            const { data: subFiles } = await admin.storage
              .from("client_files")
              .list(`${clientId}/${item.name}`, { limit: 1000 });
            if (subFiles) {
              subFiles.forEach((f) => allPaths.push(`${clientId}/${item.name}/${f.name}`));
            }
          } else {
            allPaths.push(`${clientId}/${item.name}`);
          }
        }
        if (allPaths.length > 0) {
          await admin.storage.from("client_files").remove(allPaths);
        }
      }
    } catch (storageErr) {
      // Log but don't block — client record will still be deleted
      console.warn('[deletar] Storage cleanup failed:', storageErr);
      storageWarning = true;
    }

    // 7. Remove vínculos portal_client_users
    await admin.from("portal_client_users").delete().eq("client_id", clientId);

    // 8. Remove user_roles e auth.users dos usuários exclusivos
    for (const uid of usersToDeleteFromAuth) {
      await admin.from("user_roles").delete().eq("user_id", uid);
      await admin.auth.admin.deleteUser(uid);
    }

    // 9. Deleta o portal_client
    const { error: deleteErr } = await admin
      .from("portal_clients")
      .delete()
      .eq("id", clientId);

    if (deleteErr) {
      throw new Error(deleteErr.message);
    }

    return NextResponse.json({
      success: true,
      nome: client.nome,
      authUsersDeleted: usersToDeleteFromAuth.length,
      ...(storageWarning && { storageWarning: true }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
