// src/lib/api-middleware.ts
import { NextResponse } from "next/server";
import { createSSRClient } from "@/lib/supabase/server";

export type ApiContext = {
    user: any;
    role: "master" | "cliente";
    clientId: string | null;
};

export function withAuth(
    handler: (req: Request, context: ApiContext) => Promise<NextResponse>,
    requireMaster: boolean = false
) {
    return async (req: Request) => {
        try {
            const supabase = await createSSRClient();
            
            // 1. Validar autenticação
            const { data: { user }, error: authErr } = await supabase.auth.getUser();
            if (authErr || !user) {
                return NextResponse.json({ error: "Não autenticado ou sessão expirada." }, { status: 401 });
            }

            // 2. Buscar Role do usuário
            const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .single();
            
            const role = roleData?.role || "cliente";

            // 3. Validar se master é exigido
            if (requireMaster && role !== "master") {
                return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
            }

            // 4. Buscar vínculo com o cliente (se for role cliente)
            let clientId = null;
            if (role === "cliente") {
                const { data: linkData } = await supabase
                    .from("portal_client_users")
                    .select("client_id")
                    .eq("user_id", user.id)
                    .single();
                
                if (linkData?.client_id) {
                    clientId = linkData.client_id;
                }
            }

            // Chamar o handler original com o contexto injetado
            return await handler(req, {
                user,
                role: role as "master" | "cliente",
                clientId
            });

        } catch (error: any) {
            console.error("API Middleware Error:", error);
            return NextResponse.json(
                { error: "Erro interno no servidor." },
                { status: 500 }
            );
        }
    };
}
