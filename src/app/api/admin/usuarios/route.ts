// src/app/api/admin/usuarios/route.ts
// Lista usuários do Supabase Auth usando service role (server-side)
// Requer: caller com role 'master'

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSSRClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

export async function GET() {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
        // Verifica autenticação
        const ssr = await createSSRClient();
        const { data: userData, error: userErr } = await ssr.auth.getUser();
        if (userErr || !userData?.user) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        // Verifica se é master
        const { data: roleData } = await admin
            .from("user_roles")
            .select("role")
            .eq("user_id", userData.user.id)
            .maybeSingle();

        if (roleData?.role !== "master") {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        // Lista todos os usuários
        const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
        if (error) throw new Error(error.message);

        const users = data.users.map((u) => ({
            id: u.id,
            email: u.email || "",
            created_at: u.created_at,
        }));

        return NextResponse.json({ users });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
