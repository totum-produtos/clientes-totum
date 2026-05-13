import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exchangeCodeForTokens, saveTokens } from "@/lib/google-drive";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY!;

/**
 * GET /api/drive/oauth/callback
 * Google OAuth callback. Exchanges code for tokens and saves to database.
 * Query params: ?code={authorization_code}&state={client_id}
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${getSiteUrl()}/app/drive?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${getSiteUrl()}/app/drive?error=${encodeURIComponent("Authorization code missing")}`
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${getSiteUrl()}/app/drive?error=${encodeURIComponent("Failed to obtain access token")}`
      );
    }

    // We need the user_id from Supabase auth. Since this is a callback from Google,
    // the user should have a session cookie. We'll verify it.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the current user's session from the request cookies
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const jwt = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(jwt);
      userId = data.user?.id || null;
    }

    // Fallback: try to get user from cookie
    if (!userId) {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id || null;
    }

    if (!userId) {
      return NextResponse.redirect(
        `${getSiteUrl()}/app/drive?error=${encodeURIComponent("User not authenticated")}`
      );
    }

    // Save tokens
    await saveTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined,
      scope: tokens.scope || undefined,
    });

    return NextResponse.redirect(`${getSiteUrl()}/app/drive?connected=1`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "OAuth callback failed";
    return NextResponse.redirect(
      `${getSiteUrl()}/app/drive?error=${encodeURIComponent(message)}`
    );
  }
}

function getSiteUrl(): string {
  return process.env.SITE_URL || "https://cliente.grupototum.com";
}
