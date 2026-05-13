import { NextRequest, NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/google-drive";

/**
 * GET /api/drive/oauth/url
 * Returns the Google OAuth authorization URL.
 * Query param: ?client_id={portal_client_id} (optional, passed as state)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("client_id") || "";

    const url = generateAuthUrl(clientId);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate auth URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
