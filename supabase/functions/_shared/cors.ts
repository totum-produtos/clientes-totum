// CORS para Edge Functions.
// Restringe origens à allowlist (produção + previews Vercel + dev local).
// Reflete o Origin recebido se estiver na lista; bloqueia o resto.

const ALLOWED_ORIGINS = [
  "https://cliente.grupototum.com",
  "https://cliente-totum.vercel.app",
  "http://localhost:3000",
];

// Para previews da Vercel: aceita qualquer subdomínio
// `*-grupototum.vercel.app`. Ajuste o regex para o seu time/projeto.
const ALLOWED_ORIGIN_REGEX = /^https:\/\/[a-z0-9-]+-grupototum\.vercel\.app$/i;

function isAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (ALLOWED_ORIGIN_REGEX.test(origin)) return true;
  return false;
}

export function corsHeadersFor(origin: string | null): Record<string, string> {
  const allowed = isAllowed(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? (origin as string) : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// Mantido por retrocompatibilidade — usar `corsHeadersFor(origin)` quando possível.
export const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
};
