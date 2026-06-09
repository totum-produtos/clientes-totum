// Primitiva de escrita segura — o ÚNICO jeito permitido de gravar dados.
//
// Por que existe: o Supabase NÃO retorna erro quando um UPDATE/UPSERT casa
// 0 linhas (registro inexistente ou bloqueado por RLS). Código que só checa
// `error` mostra "salvo" sem ter salvo nada — foi exatamente o bug que perdeu
// cadastros em silêncio.
//
// persistOrThrow confirma que ALGUMA linha foi realmente afetada (exige
// .select() na query), registra a falha em system_logs e LANÇA se nada foi
// gravado. Assim "não deu erro" deixa de ser confundido com "foi salvo", e
// toda falha vira barulho (exceção + log), nunca silêncio.
//
// Uso:
//   await persistOrThrow(
//     sb.from("portal_clients").update({ ... }).eq("id", id).select("id"),
//     { db: sb, source: "meu-cadastro:handleSave", metadata: { id } },
//   );

import { logEvent } from "./log-event";

type WriteResult<T> = { data: T[] | null; error: { message?: string } | null };

// Estrutura mínima compatível com o client do browser e o admin client.
type InsertableClient = {
  from: (table: string) => {
    insert: (rows: Record<string, unknown>) => PromiseLike<unknown>;
  };
};

export class PersistError extends Error {
  constructor(message: string, readonly kind: "db_error" | "zero_rows") {
    super(message);
    this.name = "PersistError";
  }
}

export async function persistOrThrow<T>(
  query: PromiseLike<WriteResult<T>>,
  ctx: { db: InsertableClient; source: string; metadata?: Record<string, unknown> },
): Promise<T[]> {
  const { data, error } = await query;

  if (error) {
    await logEvent(ctx.db, "error", ctx.source, error.message ?? "erro na escrita", {
      ...ctx.metadata,
      kind: "db_error",
    });
    throw new PersistError(error.message ?? "Falha ao salvar", "db_error");
  }

  // data null/vazio = 0 linhas afetadas (a query DEVE ter .select()).
  if (!data || data.length === 0) {
    await logEvent(ctx.db, "error", ctx.source, "escrita afetou 0 linhas", {
      ...ctx.metadata,
      kind: "zero_rows",
    });
    throw new PersistError(
      "Nada foi salvo: registro não encontrado ou sem permissão. Recarregue a página e tente novamente.",
      "zero_rows",
    );
  }

  return data;
}
