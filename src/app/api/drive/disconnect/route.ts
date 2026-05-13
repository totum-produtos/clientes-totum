import { NextRequest, NextResponse } from "next/server";
import { disconnectDrive } from "@/lib/google-drive";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY!;

/**
 * POST /api/drive/disconnect
 * Revokes Google Drive access and removes stored tokens.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await disconnectDrive(userId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to disconnect";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function authenticateUser(req: NextRequest): Promise<string | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const jwt = authHeader.replace("Bearer ", "");
    const { data } = await supabase.auth.getUser(jwt);
    return data.user?.id || null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}
