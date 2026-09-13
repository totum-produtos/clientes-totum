// SSO bridge para zap.grupototum.com (painel Evolution API).
//
// O painel fica atrás de um forward-auth do Traefik (zap-auth-guard) que
// aceita um JWT HS256 assinado com o mesmo segredo deste app (ZAP_JWT_SECRET),
// enviado como cookie no domínio pai `.grupototum.com`.
//
// Este módulo é puro (sem Next, sem Supabase) para ser testável em unidade:
//   - generateZapToken: monta e assina o JWT no formato que o guard verifica
//   - resolveZapRedirect: só aceita destinos https em *.grupototum.com
//   - zapCookieOptions: atributos do cookie compartilhado entre subdomínios
//
// Fluxo completo: docs/ZAP_SSO_LOGIN.md

import { createHmac } from "node:crypto";

export const ZAP_COOKIE_NAME = "zap_token";
export const ZAP_DEFAULT_REDIRECT = "https://zap.grupototum.com";
export const ZAP_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60; // 7776000 = 90 dias
export const ZAP_COOKIE_DOMAIN = ".grupototum.com";
export const ZAP_ROOT_DOMAIN = "grupototum.com";

// Quem pode receber o token. O painel do WhatsApp é interno da agência:
// `master` = equipe Totum. `admin` e `cliente` são usuários dos clientes.
export const ZAP_ALLOWED_ROLES: readonly string[] = ["master"];

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export type ZapTokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

export function generateZapToken(
  userId: string,
  email: string,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string {
  if (!secret) throw new Error("ZAP_JWT_SECRET ausente");

  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload: ZapTokenPayload = {
    sub: userId,
    email,
    iat: nowSeconds,
    exp: nowSeconds + ZAP_TOKEN_TTL_SECONDS,
  };
  const signing = `${header}.${base64url(JSON.stringify(payload))}`;
  const signature = createHmac("sha256", secret).update(signing).digest("base64url");
  return `${signing}.${signature}`;
}

// Só https e só o domínio raiz ou subdomínios reais de grupototum.com.
// `evil-grupototum.com` e `grupototum.com.evil.com` são rejeitados.
export function isSafeZapRedirect(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return host === ZAP_ROOT_DOMAIN || host.endsWith(`.${ZAP_ROOT_DOMAIN}`);
  } catch {
    return false;
  }
}

// Destino final: o redirect_to validado, ou o painel do zap por padrão.
export function resolveZapRedirect(raw: string | null | undefined): string {
  return isSafeZapRedirect(raw) ? raw : ZAP_DEFAULT_REDIRECT;
}

// HttpOnly=true de propósito: o Traefik lê o cookie pelo header `Cookie`,
// que o browser envia mesmo para cookies HttpOnly. Só JS fica sem acesso,
// o que é exatamente o que queremos (XSS não rouba o token).
export function zapCookieOptions() {
  return {
    name: ZAP_COOKIE_NAME,
    domain: process.env.ZAP_COOKIE_DOMAIN || ZAP_COOKIE_DOMAIN,
    path: "/",
    maxAge: ZAP_TOKEN_TTL_SECONDS,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: true,
  };
}
