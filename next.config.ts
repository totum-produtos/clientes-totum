import type { NextConfig } from "next";

// Origem do Supabase usada em produção (cloud *.supabase.co OU self-hosted,
// ex: https://supa.grupototum.com). Lida no build a partir de
// NEXT_PUBLIC_SUPABASE_URL para que o CSP libere o host correto.
// Sem isso o navegador bloqueia o fetch de login com "Failed to fetch".
function supabaseOrigins(): { https: string; wss: string } {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    if (url.protocol !== "https:") return { https: "", wss: "" };
    return { https: url.origin, wss: url.origin.replace(/^https:/, "wss:") };
  } catch {
    return { https: "", wss: "" };
  }
}
const supabase = supabaseOrigins();

const nextConfig: NextConfig = {
  // `output: 'standalone'` (e o output file tracing) servem ao deploy
  // Docker/Hostinger planejado. Na Vercel sao desnecessarios e quebram o
  // build do Next 16 com `ENOENT: .next/next-server.js.nft.json` no passo
  // de tracing do standalone. Habilita apenas FORA da Vercel (VERCEL=1 e
  // definido automaticamente no build da Vercel).
  ...(process.env.VERCEL
    ? {}
    : {
        output: 'standalone' as const,
        outputFileTracingRoot: process.cwd(),
        outputFileTracingExcludes: {
          "*": [
            ".claude/**/*",
            "clientes-totum/**/*",
            "coverage/**/*",
            "out/**/*",
          ],
        },
      }),
  images: {
    unoptimized: true,
  },
  // Next 16 desacoplou o ESLint do build (a chave `eslint` foi removida).
  // Lint roda via `npm run lint` / CI. Erros de tipo continuam barrando o build.
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      { source: '/novo', destination: '/app/admin/clientes/novo', permanent: false },
    ];
  },
  async headers() {
    // Cabeçalhos de segurança aplicados em todas as rotas.
    // Vercel já força HTTPS; o HSTS abaixo trava o navegador no HTTPS
    // por 2 anos. Não inclui preload (precisa de submissão manual em
    // hstspreload.org). includeSubDomains está ON.
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      // CSP intencionalmente leve. 'unsafe-inline' em script/style é
      // necessário enquanto Next 15 + Tailwind injetam estilos inline.
      // Permite iframes do Google Drive (usado em /app/drive).
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com",
          "style-src 'self' 'unsafe-inline'",
          `img-src 'self' data: blob: https://*.supabase.co ${supabase.https} https://*.googleusercontent.com https://lh3.googleusercontent.com`,
          "font-src 'self' data:",
          `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${supabase.https} ${supabase.wss} https://*.vercel-insights.com`,
          "frame-src 'self' https://drive.google.com https://docs.google.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ]
          .join("; ")
          .replace(/\s{2,}/g, " "),
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
