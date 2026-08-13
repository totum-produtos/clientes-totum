// Tracking de cliques/page views da bio pública. Endpoint público, sem
// auth — chamado via navigator.sendBeacon (ver TrackedLink). Sempre
// responde 204 (mesmo em slug/target inválido) pra não vazar, via
// diferença de resposta, se um slug existe ou não.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";
import type { Database } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY || "";

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

  const admin = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: client } = await admin
    .from("portal_clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!client) return noContent();

  const { data: profile } = await admin
    .from("bio_profiles")
    .select("id, is_active")
    .eq("client_id", client.id)
    .maybeSingle();
  if (!profile || !profile.is_active) return noContent();

  if (targetType === "link") {
    if (!targetId) return noContent();
    const { data: link } = await admin
      .from("bio_links")
      .select("id")
      .eq("id", targetId)
      .eq("bio_id", profile.id)
      .maybeSingle();
    if (!link) return noContent();
  } else if (targetType === "product") {
    if (!targetId) return noContent();
    const { data: product } = await admin
      .from("bio_products")
      .select("id")
      .eq("id", targetId)
      .eq("bio_id", profile.id)
      .maybeSingle();
    if (!product) return noContent();
  }

  await admin.from("bio_click_events").insert({
    client_id: client.id,
    target_type: targetType,
    target_id: targetType === "page_view" ? null : targetId,
  });

  return noContent();
}
