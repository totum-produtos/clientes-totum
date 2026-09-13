import { describe, expect, it } from "vitest";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ZAP_DEFAULT_REDIRECT,
  ZAP_TOKEN_TTL_SECONDS,
  generateZapToken,
  isSafeZapRedirect,
  resolveZapRedirect,
  zapCookieOptions,
} from "./zap-token";

const SECRET = "segredo-de-teste-nao-e-o-real";

// Réplica fiel do verifyJwt do zap-auth-guard (/opt/zap-auth/server.js).
// Se este verificador aceitar o token, o guard em produção também aceita.
function guardVerifyJwt(token: string, secret: string, nowMs = Date.now()): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
  if (header.alg !== "HS256") return false;
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  if (payload.exp && nowMs / 1000 > payload.exp) return false;
  const signing = parts[0] + "." + parts[1];
  const expected = createHmac("sha256", secret).update(signing).digest("base64url");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]));
}

describe("generateZapToken", () => {
  it("gera um JWT que o zap-auth-guard aceita", () => {
    const token = generateZapToken("user-123", "a@b.com", SECRET);
    expect(guardVerifyJwt(token, SECRET)).toBe(true);
  });

  it("começa com eyJ (o guard só olha cookies com esse prefixo)", () => {
    expect(generateZapToken("u", "e", SECRET).startsWith("eyJ")).toBe(true);
  });

  it("carrega sub, email, iat e exp = iat + 90 dias", () => {
    const now = 1_700_000_000;
    const token = generateZapToken("user-123", "a@b.com", SECRET, now);
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    expect(payload).toEqual({
      sub: "user-123",
      email: "a@b.com",
      iat: now,
      exp: now + ZAP_TOKEN_TTL_SECONDS,
    });
    expect(ZAP_TOKEN_TTL_SECONDS).toBe(7776000);
  });

  it("é rejeitado com outro segredo", () => {
    const token = generateZapToken("u", "e", SECRET);
    expect(guardVerifyJwt(token, "outro-segredo")).toBe(false);
  });

  it("é rejeitado depois de expirar", () => {
    const now = 1_700_000_000;
    const token = generateZapToken("u", "e", SECRET, now);
    const afterExpiry = (now + ZAP_TOKEN_TTL_SECONDS + 1) * 1000;
    expect(guardVerifyJwt(token, SECRET, afterExpiry)).toBe(false);
  });

  it("falha alto se o segredo estiver vazio", () => {
    expect(() => generateZapToken("u", "e", "")).toThrow(/ZAP_JWT_SECRET/);
  });
});

describe("isSafeZapRedirect", () => {
  it.each([
    "https://zap.grupototum.com",
    "https://zap.grupototum.com/manager?x=1",
    "https://n8n.grupototum.com",
    "https://grupototum.com",
    "https://ZAP.GRUPOTOTUM.COM",
  ])("aceita %s", (url) => {
    expect(isSafeZapRedirect(url)).toBe(true);
  });

  it.each([
    "http://zap.grupototum.com",
    "https://evil-grupototum.com",
    "https://grupototum.com.evil.com",
    "https://evil.com/?u=zap.grupototum.com",
    "https://evil.com#zap.grupototum.com",
    "javascript:alert(1)",
    "//zap.grupototum.com",
    "/app",
    "",
    null,
    undefined,
  ])("rejeita %s", (url) => {
    expect(isSafeZapRedirect(url)).toBe(false);
  });
});

describe("resolveZapRedirect", () => {
  it("usa o redirect_to quando é seguro", () => {
    expect(resolveZapRedirect("https://n8n.grupototum.com/x")).toBe("https://n8n.grupototum.com/x");
  });

  it("cai no painel do zap quando é inseguro ou ausente", () => {
    expect(resolveZapRedirect("https://evil.com")).toBe(ZAP_DEFAULT_REDIRECT);
    expect(resolveZapRedirect(null)).toBe(ZAP_DEFAULT_REDIRECT);
  });
});

describe("zapCookieOptions", () => {
  it("compartilha o cookie entre subdomínios, HttpOnly e Secure", () => {
    expect(zapCookieOptions()).toMatchObject({
      name: "zap_token",
      domain: ".grupototum.com",
      path: "/",
      maxAge: 7776000,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  });
});
