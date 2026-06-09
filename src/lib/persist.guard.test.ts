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
// Regra: todo arquivo em src/ que contém `.update(` ou `.upsert(` precisa
// OU usar `persistOrThrow` OU estar no ALLOWLIST abaixo (com justificativa).
// Qualquer arquivo novo com escrita força uma decisão consciente e revisável.

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
};

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe("guard: escritas de dados usam persistOrThrow", () => {
  it("nenhum .update()/.upsert() inseguro fora do allowlist", () => {
    const srcRoot = join(process.cwd(), "src");
    const offenders: string[] = [];

    for (const file of walk(srcRoot)) {
      const rel = relative(srcRoot, file).split("\\").join("/");
      if (rel === "lib/persist.ts") continue; // o próprio helper
      const code = readFileSync(file, "utf8");
      const hasWrite = /\.update\(|\.upsert\(/.test(code);
      if (!hasWrite) continue;
      const isSafe = code.includes("persistOrThrow");
      const isAllowed = rel in ALLOWLIST;
      if (!isSafe && !isAllowed) offenders.push(rel);
    }

    expect(
      offenders,
      `Escrita insegura (.update/.upsert sem persistOrThrow). Use persistOrThrow ` +
        `de @/lib/persist, ou adicione ao ALLOWLIST em persist.guard.test.ts com ` +
        `justificativa. Arquivos:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });
});
