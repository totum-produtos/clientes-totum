import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// GUARD ANTI-REGRESSÃO
// ────────────────────────────────────────────────────────────────────────
// Garante que NENHUMA escrita de dados do lado do cliente (.update/.upsert
// via Supabase com sessão do usuário, sujeita a RLS) escape do persistOrThrow.
// Sem confirmação de linhas, um UPDATE que casa 0 linhas é "salvo" falso —
// foi o bug que perdeu cadastros. Este teste falha o CI se alguém reintroduzir
// o padrão inseguro.
//
// Duas regras (ambas aceitam `persistOrThrow` no arquivo OU entrada no
// ALLOWLIST abaixo, com justificativa):
//
// 1. ESCRITA CRUA — arquivo fora da DAL que contém `.update(` ou `.upsert(`.
//    Toda query deveria estar em `src/services/db/*` (CLAUDE.md — DAL), mas se
//    alguém escrever direto, o guard exige a confirmação de linhas.
//
// 2. CHAMADA DE ESCRITA DA DAL — arquivo que importa de `@/services/db/*` e
//    chama uma função de escrita da DAL. Os wrappers da DAL são finos e
//    retornam o query builder; quem confirma as linhas é o CONSUMIDOR, no call
//    site. As funções de escrita são descobertas automaticamente: toda
//    `export function` de `src/services/db/*` cujo corpo tem `.update(` ou
//    `.upsert(`. Nova função de escrita na DAL entra no guard sem manutenção.
//
// A própria DAL não é checada: ela só monta a query.

// Caminhos relativos a src/. Cada entrada PRECISA de uma razão.
const ALLOWLIST: Record<string, string> = {
  // Escritas server-side com admin client (service role) — service role
  // bypassa RLS, então não há filtro silencioso de linhas. Erros já tratados.
  "app/api/admin/clientes/criar/route.ts": "service role (bypassa RLS) + rollback logado",
  "app/api/admin/clientes/acesso/route.ts": "service role; upsert de role/link",
  "app/api/admin/onboarding/criar-convite/route.ts": "service role; update used_at",
  "app/api/onboarding/[token]/finalizar/route.ts": "service role; upsert role + used_at",
  "app/api/onboarding/[token]/salvar/route.ts": "service role; autosave de draft do convite",
  "app/api/client/briefing/complete/route.ts": "service role; flag de briefing",
  "app/api/send-invite/route.ts": "service role; update used_at do convite",
  "app/api/invite/route.ts": "service role; upsert/update de convite",
  // Escritas benignas: flag de 'lida' em notificação. Perda é cosmética e
  // auto-recupera no próximo carregamento; não é dado de negócio.
  "app/app/notificacoes/page.tsx": "read-flag de notificação (cosmético)",
  "components/NotificationBell.tsx": "read-flag de notificação (cosmético)",
  // Template/demo, não grava dados de cliente.
  "lib/supabase/unified.ts": "demo todo_list do template",
  // Falso positivo: `createHmac(...).update(...)` do node:crypto. Não toca banco.
  "lib/zap-token.ts": "Hmac.update do node:crypto (assinatura JWT), não é escrita no Supabase",
};

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) acc.push(full);
  }
  return acc;
}

const WRITE = /\.update\(|\.upsert\(/;
const srcRoot = join(process.cwd(), "src");
const dalRoot = join(srcRoot, "services", "db");

// Nomes das funções exportadas pela DAL que fazem .update/.upsert.
function dalWriteFunctions(): string[] {
  const names: string[] = [];
  for (const file of walk(dalRoot)) {
    const code = readFileSync(file, "utf8");
    for (const chunk of code.split(/(?=export (?:async )?function )/)) {
      const m = chunk.match(/^export (?:async )?function (\w+)/);
      if (m && WRITE.test(chunk)) names.push(m[1]);
    }
  }
  return names;
}

describe("guard: escritas de dados usam persistOrThrow", () => {
  const writeFns = dalWriteFunctions();
  const callRes = writeFns.map((n) => ({ name: n, re: new RegExp(`\\b${n}\\s*\\(`) }));

  it("descobre as funções de escrita da DAL (sanidade do próprio guard)", () => {
    // Se a detecção quebrar (ex.: refactor da DAL muda o padrão de export),
    // a regra 2 ficaria vazia e passaria sempre. Isto impede o falso verde.
    expect(writeFns.length).toBeGreaterThan(0);
  });

  it("nenhuma escrita insegura fora do allowlist (crua ou via DAL)", () => {
    const offenders: string[] = [];

    for (const file of walk(srcRoot)) {
      const rel = relative(srcRoot, file).split("\\").join("/");
      if (rel === "lib/persist.ts") continue; // o próprio helper
      if (rel.startsWith("services/db/")) continue; // a DAL só monta a query

      const code = readFileSync(file, "utf8");
      if (code.includes("persistOrThrow") || rel in ALLOWLIST) continue;

      if (WRITE.test(code)) {
        offenders.push(`${rel} (escrita crua)`);
        continue;
      }
      if (/from ["']@\/services\/db\//.test(code)) {
        const called = callRes.filter(({ re }) => re.test(code)).map(({ name }) => name);
        if (called.length) offenders.push(`${rel} (DAL: ${called.join(", ")})`);
      }
    }

    expect(
      offenders,
      `Escrita sem persistOrThrow. Envolva a chamada em persistOrThrow ` +
        `(@/lib/persist) ou adicione ao ALLOWLIST em persist.guard.test.ts com ` +
        `justificativa. Arquivos:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });
});
