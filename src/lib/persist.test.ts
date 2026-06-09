import { describe, it, expect } from "vitest";
import { persistOrThrow, PersistError } from "./persist";

// db falso que captura inserts em system_logs (para checar o logging).
function fakeDb() {
  const logs: Record<string, unknown>[] = [];
  return {
    logs,
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        logs.push(row);
        return Promise.resolve({ error: null });
      },
    }),
  };
}

describe("persistOrThrow", () => {
  it("retorna as linhas quando a escrita afeta >= 1 linha", async () => {
    const db = fakeDb();
    const query = Promise.resolve({ data: [{ id: "abc" }], error: null });
    const rows = await persistOrThrow(query, { db, source: "teste" });
    expect(rows).toEqual([{ id: "abc" }]);
    expect(db.logs.length).toBe(0); // sucesso não loga
  });

  it("LANÇA quando a escrita afeta 0 linhas (perda silenciosa)", async () => {
    const db = fakeDb();
    const query = Promise.resolve({ data: [], error: null });
    await expect(
      persistOrThrow(query, { db, source: "teste:zero", metadata: { id: "x" } }),
    ).rejects.toBeInstanceOf(PersistError);
    // registrou a falha em system_logs
    expect(db.logs.length).toBe(1);
    expect(db.logs[0]).toMatchObject({ level: "error", source: "teste:zero" });
    expect((db.logs[0].metadata as { kind: string }).kind).toBe("zero_rows");
  });

  it("LANÇA quando data vem null (sem .select())", async () => {
    const db = fakeDb();
    const query = Promise.resolve({ data: null, error: null });
    await expect(persistOrThrow(query, { db, source: "teste:null" })).rejects.toBeInstanceOf(
      PersistError,
    );
  });

  it("LANÇA e loga quando o banco retorna erro", async () => {
    const db = fakeDb();
    const query = Promise.resolve({ data: null, error: { message: "permission denied" } });
    await expect(persistOrThrow(query, { db, source: "teste:err" })).rejects.toThrow(
      "permission denied",
    );
    expect((db.logs[0].metadata as { kind: string }).kind).toBe("db_error");
  });

  it("kind correto na exceção", async () => {
    const db = fakeDb();
    try {
      await persistOrThrow(Promise.resolve({ data: [], error: null }), { db, source: "t" });
    } catch (e) {
      expect((e as PersistError).kind).toBe("zero_rows");
    }
  });
});
