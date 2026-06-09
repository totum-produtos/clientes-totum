// Rate limiting leve, em memória (janela fixa), sem dependências externas.
//
// Limitação conhecida: em serverless (Vercel) cada instância tem seu próprio
// mapa, então o limite é POR INSTÂNCIA, não global. Isso já barra o caso mais
// comum (uma origem martelando uma rota), mas para enforcement distribuído
// rigoroso troque por Upstash Ratelimit + Redis.
//
// Uso:
//   const rl = rateLimit(req, { key: "onboarding-salvar", limit: 120, windowMs: 60_000 });
//   if (!rl.ok) return NextResponse.json({ error: "..." }, { status: 429, headers: rl.headers });

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

// Limpeza preguiçosa: remove buckets expirados quando o mapa cresce.
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [k, b] of store) {
    if (b.resetAt <= now) store.delete(k);
  }
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(
  req: Request,
  opts: { key: string; limit: number; windowMs: number; identifier?: string },
): { ok: boolean; remaining: number; headers: Record<string, string> } {
  const now = Date.now();
  sweep(now);

  const id = opts.identifier || clientIp(req);
  const bucketKey = `${opts.key}:${id}`;

  let bucket = store.get(bucketKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + opts.windowMs };
    store.set(bucketKey, bucket);
  }
  bucket.count += 1;

  const remaining = Math.max(0, opts.limit - bucket.count);
  const ok = bucket.count <= opts.limit;
  const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);

  return {
    ok,
    remaining,
    headers: {
      "X-RateLimit-Limit": String(opts.limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
      ...(ok ? {} : { "Retry-After": String(retryAfterSec) }),
    },
  };
}
