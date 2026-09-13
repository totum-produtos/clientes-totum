// src/app/login/page.tsx
//
// Ponte de SSO para zap.grupototum.com. O zap-auth-guard (Traefik) manda
// quem não tem cookie para cá:
//   /login?redirect_to=https://zap.grupototum.com
//
//   - com sessão Supabase → /api/auth/zap-token (seta o cookie e redireciona)
//   - sem sessão          → /auth/login?redirect_to=<url> (login normal;
//                            ao terminar, o login volta para cá)
//
// Página server-side sem UI: Server Components não podem gravar cookies,
// por isso a emissão do token fica na route handler.
// Fluxo completo: docs/ZAP_SSO_LOGIN.md

import { redirect } from "next/navigation";
import { createSSRClient } from "@/lib/supabase/server";
import { resolveZapRedirect } from "@/lib/zap-token";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ redirect_to?: string | string[] }>;
};

export default async function ZapLoginBridge({ searchParams }: Props) {
  const params = await searchParams;
  const raw = Array.isArray(params.redirect_to) ? params.redirect_to[0] : params.redirect_to;
  const target = resolveZapRedirect(raw);

  const supabase = await createSSRClient();
  const { data } = await supabase.auth.getUser();

  const next = data?.user ? "/api/auth/zap-token" : "/auth/login";
  redirect(`${next}?redirect_to=${encodeURIComponent(target)}`);
}
