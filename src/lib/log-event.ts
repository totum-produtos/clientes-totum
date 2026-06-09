// Logging estruturado em system_logs.
//
// Objetivo: parar de perder rastro quando um save falha. Toda falha de
// gravação passa a registrar level/source/message/metadata no banco, para
// que problemas como "salvei e não salvou" sejam diagnosticáveis depois.
//
// Funciona tanto com o client do browser quanto com o admin client (server).
// NUNCA lança — logging não pode quebrar o fluxo principal.

type Level = "info" | "warn" | "error";

// Estrutura mínima compatível tanto com o client do browser quanto com o
// admin client. O .insert() do Supabase retorna um builder thenable, então
// usamos PromiseLike (não Promise) para casar com ambos.
type InsertableClient = {
  from: (table: string) => {
    insert: (rows: Record<string, unknown>) => PromiseLike<unknown>;
  };
};

export async function logEvent(
  db: InsertableClient,
  level: Level,
  source: string,
  message: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.from("system_logs").insert({ level, source, message, metadata });
  } catch {
    /* silencioso por design — nunca derruba o fluxo de negócio */
  }
}
