import { NextRequest, NextResponse } from "next/server";
import { listDriveFiles } from "@/lib/google-drive";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY!;

/**
 * GET /api/drive/files
 * Lists files from the connected Google Drive.
 * Query params: ?folderId={id}&pageSize={n}&q={search}
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId") || undefined;
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const query = searchParams.get("q") || undefined;

    const files = await listDriveFiles(userId, { folderId, pageSize, query });
    return NextResponse.json({ files });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list files";
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

  // Try cookie-based auth
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}
