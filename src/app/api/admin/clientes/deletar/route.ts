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
import { getUserRole, deleteUserRoles } from "@/services/db/users";
import { getClientById, getClientUsersByClient, getOtherClientsByUser, deleteClientUsersByClient, deleteClient } from "@/services/db/clients";
import { deletePostsByClient } from "@/services/db/calendar";
import { deleteTarefasByClient, deleteProjectsByClient, deleteCampaignsByClient, deleteRagDocsByClient } from "@/services/db/content";
import { deleteProfileChangesByClient } from "@/services/db/admin";
import { deleteInvitesByClient } from "@/services/db/onboarding";
import { deleteNotificationsByClientData } from "@/services/db/notifications";
import { listClientFiles, removeClientFile } from "@/services/db/files";

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

    const { data: callerRole } = await getUserRole(admin, userData.user.id);

    if (callerRole?.role !== "master") {
      return NextResponse.json(
        { error: "Apenas usuários master podem deletar clientes" },
        { status: 403 },
      );
    }

    // 2. Confirma que o cliente existe
    const { data: client, error: clientErr } = await getClientById(admin, clientId);

    if (clientErr || !client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // 3. Coleta os user_ids vinculados a este cliente ANTES de deletar
    const { data: clientUsers } = await getClientUsersByClient(admin, clientId);

    const userIds: string[] = (clientUsers ?? []).map((r: { user_id: string }) => r.user_id);

    // 4. Para cada user, verifica se pertence a OUTROS clientes também
    //    (se sim, não apaga o auth user — só desvincula deste cliente)
    const usersToDeleteFromAuth: string[] = [];
    for (const uid of userIds) {
      const { data: otherLinks } = await getOtherClientsByUser(admin, uid, clientId);

      if (!otherLinks || otherLinks.length === 0) {
        usersToDeleteFromAuth.push(uid);
      }
    }

    // 5. Deleta dados relacionados (order: sem FK dependência de portal_clients primeiro)
    const cascadeSteps = [
      { table: "wanda_posts", result: deletePostsByClient(admin, clientId) },
      { table: "tarefas", result: deleteTarefasByClient(admin, clientId) },
      { table: "projetos", result: deleteProjectsByClient(admin, clientId) },
      { table: "ad_campaigns", result: deleteCampaignsByClient(admin, clientId) },
      { table: "client_profile_changes", result: deleteProfileChangesByClient(admin, clientId) },
      { table: "client_invites", result: deleteInvitesByClient(admin, clientId) },
      { table: "rag_documents", result: deleteRagDocsByClient(admin, clientId) },
      // notifications: campo dentro de JSONB (sem FK real)
      { table: "notifications", result: deleteNotificationsByClientData(admin, clientId) },
    ];

    const cascadeErrors: string[] = [];
    for (const step of cascadeSteps) {
      const { error } = await step.result;
      if (error) cascadeErrors.push(`${step.table}: ${error.message}`);
    }

    if (cascadeErrors.length > 0) {
      throw new Error(`Falha ao apagar dados relacionados: ${cascadeErrors.join("; ")}`);
    }

    // 6. Deleta arquivos do Storage (pasta raiz + subpastas)
    let storageWarning = false;
    try {
      const { data: rootFiles } = await listClientFiles(admin, clientId, { limit: 1000 });

      if (rootFiles && rootFiles.length > 0) {
        // Verifica subpastas
        const allPaths: string[] = [];
        for (const item of rootFiles) {
          if (item.id === null) {
            // É uma pasta — lista conteúdo
            const { data: subFiles } = await listClientFiles(admin, `${clientId}/${item.name}`, { limit: 1000 });
            if (subFiles) {
              subFiles.forEach((f) => allPaths.push(`${clientId}/${item.name}/${f.name}`));
            }
          } else {
            allPaths.push(`${clientId}/${item.name}`);
          }
        }
        if (allPaths.length > 0) {
          await removeClientFile(admin, allPaths);
        }
      }
    } catch (storageErr) {
      // Log but don't block — client record will still be deleted
      console.warn('[deletar] Storage cleanup failed:', storageErr);
      storageWarning = true;
    }

    // 7. Remove vínculos portal_client_users
    await deleteClientUsersByClient(admin, clientId);

    // 8. Remove user_roles e auth.users dos usuários exclusivos
    for (const uid of usersToDeleteFromAuth) {
      await deleteUserRoles(admin, [uid]);
      await admin.auth.admin.deleteUser(uid);
    }

    // 9. Deleta o portal_client
    const { error: deleteErr } = await deleteClient(admin, clientId);

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
