// src/app/api/auth/zap-token/route.ts
//
// Emite o cookie `zap_token` (JWT HS256) que libera o acesso ao painel
// zap.grupototum.com via zap-auth-guard (Traefik forwardAuth).
//
//   GET  /api/auth/zap-token?redirect_to=<url>  → seta o cookie e redireciona
//        (usado pelo fluxo de browser: /login → aqui → zap)
//   POST /api/auth/zap-token                    → seta o cookie e responde JSON
//        (uso programático)
//
// Requer: sessão Supabase válida + role `master` (equipe Totum).
// Env:    ZAP_JWT_SECRET (mesmo segredo do guard na VPS)
// Fluxo:  docs/ZAP_SSO_LOGIN.md

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSSRClient } from "@/lib/supabase/server";
import { getUserRole } from "@/services/db/users";
import { rateLimit } from "@/lib/rate-limit";
import {
  ZAP_ALLOWED_ROLES,
  generateZapToken,
  resolveZapRedirect,
  zapCookieOptions,
} from "@/lib/zap-token";

type IssueResult =
  | { ok: true; token: string }
  | { ok: false; status: 401 | 403 | 429 | 500; error: string };

async function issueToken(request: Request): Promise<IssueResult> {
  const secret = process.env.ZAP_JWT_SECRET;
  if (!secret) {
    console.error("zap-token: ZAP_JWT_SECRET não configurado");
    return { ok: false, status: 500, error: "SSO do zap não configurado" };
  }

  const ssr = await createSSRClient();
  const { data: userData, error: userErr } = await ssr.auth.getUser();
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Não autenticado" };
  }
  const user = userData.user;

  const rl = rateLimit(request, {
    key: "zap-token",
    limit: 30,
    windowMs: 60_000,
    identifier: user.id,
  });
  if (!rl.ok) {
    return { ok: false, status: 429, error: "Muitas tentativas, aguarde um minuto" };
  }

  // Mesmo padrão das routes de admin: service role só para ler a role
  // (user_roles pode estar restrita por RLS para a sessão do usuário).
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.PRIVATE_SUPABASE_SERVICE_KEY || "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: roleData, error: roleErr } = await getUserRole(admin, user.id);
  if (roleErr) {
    console.error("zap-token: falha ao ler role", { userId: user.id, message: roleErr.message });
    return { ok: false, status: 500, error: "Falha ao verificar permissão" };
  }
  if (!roleData?.role || !ZAP_ALLOWED_ROLES.includes(roleData.role)) {
    return { ok: false, status: 403, error: "Sem permissão para acessar o painel do zap" };
  }

  return { ok: true, token: generateZapToken(user.id, user.email ?? "", secret) };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = resolveZapRedirect(url.searchParams.get("redirect_to"));
  const result = await issueToken(request);

  if (!result.ok) {
    if (result.status === 401) {
      const login = new URL("/auth/login", request.url);
      login.searchParams.set("redirect_to", target);
      return NextResponse.redirect(login);
    }
    const dest = new URL("/app", request.url);
    dest.searchParams.set(
      "zap_error",
      result.status === 403 ? "forbidden" : result.status === 429 ? "rate_limited" : "unconfigured",
    );
    return NextResponse.redirect(dest);
  }

  const res = NextResponse.redirect(target);
  res.cookies.set({ ...zapCookieOptions(), value: result.token });
  return res;
}

export async function POST(request: Request) {
  const result = await issueToken(request);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...zapCookieOptions(), value: result.token });
  return res;
}
