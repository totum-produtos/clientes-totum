import { NextRequest, NextResponse } from "next/server";
import { uploadDriveFile } from "@/lib/google-drive";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY!;

/**
 * POST /api/drive/upload
 * Uploads a file to Google Drive.
 * Form data: file (File), folderId (optional string)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = (formData.get("folderId") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadDriveFile(
      userId,
      buffer,
      file.name,
      file.type || "application/octet-stream",
      folderId
    );

    return NextResponse.json({ file: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload file";
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
