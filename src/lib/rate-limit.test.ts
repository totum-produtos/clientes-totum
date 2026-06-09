import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

function reqFrom(ip: string): Request {
  return new Request("https://x.test/api", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  it("permite requisições abaixo do limite", () => {
    const req = reqFrom("1.1.1.1");
    for (let i = 0; i < 5; i++) {
      const rl = rateLimit(req, { key: "t-abaixo", limit: 5, windowMs: 60_000 });
      expect(rl.ok).toBe(true);
    }
  });

  it("bloqueia ao ultrapassar o limite", () => {
    const req = reqFrom("2.2.2.2");
    let last = rateLimit(req, { key: "t-bloqueia", limit: 3, windowMs: 60_000 });
    rateLimit(req, { key: "t-bloqueia", limit: 3, windowMs: 60_000 });
    rateLimit(req, { key: "t-bloqueia", limit: 3, windowMs: 60_000 });
    last = rateLimit(req, { key: "t-bloqueia", limit: 3, windowMs: 60_000 });
    expect(last.ok).toBe(false);
    expect(last.headers["Retry-After"]).toBeDefined();
  });

  it("isola contadores por IP", () => {
    const a = reqFrom("3.3.3.3");
    const b = reqFrom("4.4.4.4");
    rateLimit(a, { key: "t-iso", limit: 1, windowMs: 60_000 });
    const aBlocked = rateLimit(a, { key: "t-iso", limit: 1, windowMs: 60_000 });
    const bAllowed = rateLimit(b, { key: "t-iso", limit: 1, windowMs: 60_000 });
    expect(aBlocked.ok).toBe(false);
    expect(bAllowed.ok).toBe(true);
  });

  it("isola contadores por key (rota)", () => {
    const req = reqFrom("5.5.5.5");
    rateLimit(req, { key: "rota-A", limit: 1, windowMs: 60_000 });
    const sameRoute = rateLimit(req, { key: "rota-A", limit: 1, windowMs: 60_000 });
    const otherRoute = rateLimit(req, { key: "rota-B", limit: 1, windowMs: 60_000 });
    expect(sameRoute.ok).toBe(false);
    expect(otherRoute.ok).toBe(true);
  });

  it("reseta após a janela expirar", () => {
    const req = reqFrom("6.6.6.6");
    const first = rateLimit(req, { key: "t-reset", limit: 1, windowMs: 1 });
    expect(first.ok).toBe(true);
    // janela de 1ms já expirou na próxima checagem síncrona seguinte
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const afterWindow = rateLimit(req, { key: "t-reset", limit: 1, windowMs: 1 });
        expect(afterWindow.ok).toBe(true);
        resolve();
      }, 5);
    });
  });

  it("expõe headers X-RateLimit-*", () => {
    const req = reqFrom("7.7.7.7");
    const rl = rateLimit(req, { key: "t-headers", limit: 10, windowMs: 60_000 });
    expect(rl.headers["X-RateLimit-Limit"]).toBe("10");
    expect(rl.headers["X-RateLimit-Remaining"]).toBe("9");
    expect(rl.headers["X-RateLimit-Reset"]).toBeDefined();
  });
});
