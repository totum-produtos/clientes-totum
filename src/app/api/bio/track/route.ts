// Tracking de cliques/page views da bio pública. Endpoint público, sem
// auth — chamado via navigator.sendBeacon (ver TrackedLink). Sempre
// responde 204 (mesmo em slug/target inválido) pra não vazar, via
// diferença de resposta, se um slug existe ou não.

import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { logEvent } from "@/lib/log-event";
import { createBioAdminClient, resolveActiveBioProfile } from "@/lib/bio/resolve-active-profile";

type TrackTargetType = "page_view" | "link" | "product";
const VALID_TARGET_TYPES: TrackTargetType[] = ["page_view", "link", "product"];

interface TrackBody {
  slug?: string;
  target_type?: string;
  target_id?: string;
}

function noContent() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: Request) {
  const rl = rateLimit(request, { key: "bio-track", limit: 60, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde um momento." },
      { status: 429, headers: rl.headers },
    );
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return noContent();
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const targetType = body.target_type as TrackTargetType;
  const targetId = typeof body.target_id === "string" ? body.target_id : undefined;

  if (!slug || !VALID_TARGET_TYPES.includes(targetType)) {
    return noContent();
  }

  const admin = createBioAdminClient();
  const resolved = await resolveActiveBioProfile(admin, slug);
  if (!resolved) return noContent();
  const { client, profile } = resolved;

  if (targetType === "link") {
    if (!targetId) return noContent();
    const { data: link } = await admin
      .from("bio_links")
      .select("id")
      .eq("id", targetId)
      .eq("bio_id", profile.id)
      .eq("is_active", true)
      .maybeSingle();
    if (!link) return noContent();
  } else if (targetType === "product") {
    if (!targetId) return noContent();
    const { data: product } = await admin
      .from("bio_products")
      .select("id")
      .eq("id", targetId)
      .eq("bio_id", profile.id)
      .eq("is_active", true)
      .maybeSingle();
    if (!product) return noContent();
  }

  const { error } = await admin.from("bio_click_events").insert({
    client_id: client.id,
    target_type: targetType,
    target_id: targetType === "page_view" ? null : targetId,
  });
  if (error) {
    await logEvent(admin, "error", "api/bio/track", error.message, {
      clientId: client.id,
      targetType,
      targetId,
    });
  }

  return noContent();
}
