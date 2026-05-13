/**
 * Google Drive API utilities
 * Handles token refresh, file listing, upload, and revocation.
 */

import { google, drive_v3 } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI!;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.PRIVATE_SUPABASE_SERVICE_KEY!;

// ─── OAuth2 Client ───────────────────────────────────────────────────────────

export function getOAuthClient() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

// ─── Authorization URL ───────────────────────────────────────────────────────

export function generateAuthUrl(state: string): string {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    state,
  });
}

// ─── Token Exchange ──────────────────────────────────────────────────────────

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// ─── Token Refresh ───────────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

// ─── Revoke Token ────────────────────────────────────────────────────────────

export async function revokeToken(accessToken: string) {
  const oauth2Client = getOAuthClient();
  await oauth2Client.revokeToken(accessToken);
}

// ─── Supabase Admin Client ───────────────────────────────────────────────────

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ─── Get Valid Token (with auto-refresh) ─────────────────────────────────────

export async function getValidToken(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("google_drive_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Google Drive not connected");
  }

  const expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : 0;
  const now = Date.now();
  const bufferMs = 60_000; // 1 minute buffer

  // Token still valid
  if (expiresAt > now + bufferMs) {
    return data.access_token;
  }

  // Token expired — refresh it
  if (!data.refresh_token) {
    throw new Error("Refresh token missing. Please reconnect Google Drive.");
  }

  const credentials = await refreshAccessToken(data.refresh_token);

  const newAccessToken = credentials.access_token!;
  const newRefreshToken = credentials.refresh_token || data.refresh_token;
  const newExpiry = credentials.expiry_date
    ? new Date(credentials.expiry_date).toISOString()
    : new Date(now + 3600_000).toISOString();

  await supabase
    .from("google_drive_tokens")
    .update({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_at: newExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return newAccessToken;
}

// ─── Drive Client ────────────────────────────────────────────────────────────

export async function getDriveClient(userId: string): Promise<drive_v3.Drive> {
  const accessToken = await getValidToken(userId);
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

// ─── List Files ──────────────────────────────────────────────────────────────

export async function listDriveFiles(
  userId: string,
  options: {
    folderId?: string;
    pageSize?: number;
    query?: string;
  } = {}
) {
  const drive = await getDriveClient(userId);

  const pageSize = options.pageSize || 50;
  const folderId = options.folderId || "root";
  const searchQuery = options.query?.trim();

  let q = `'${folderId}' in parents and trashed = false`;
  if (searchQuery) {
    q = `name contains '${searchQuery.replace(/'/g, "\\'")}' and trashed = false`;
  }

  const res = await drive.files.list({
    q,
    pageSize,
    fields:
      "nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, modifiedTime, size, iconLink)",
    orderBy: "folder,name",
  });

  return res.data.files || [];
}

// ─── Upload File ─────────────────────────────────────────────────────────────

export async function uploadDriveFile(
  userId: string,
  file: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
) {
  const drive = await getDriveClient(userId);

  const metadata: drive_v3.Schema$File = {
    name: fileName,
    mimeType,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const res = await drive.files.create({
    requestBody: metadata,
    media: {
      mimeType,
      body: file,
    },
    fields: "id, name, mimeType, webViewLink, webContentLink, thumbnailLink",
  });

  return res.data;
}

// ─── Disconnect / Remove Token ───────────────────────────────────────────────

export async function disconnectDrive(userId: string) {
  const supabase = getSupabaseAdmin();

  // Try to revoke token first
  try {
    const { data } = await supabase
      .from("google_drive_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .single();

    if (data?.access_token) {
      await revokeToken(data.access_token);
    }
  } catch {
    // Ignore revocation errors (token may already be invalid)
  }

  // Remove from database
  await supabase.from("google_drive_tokens").delete().eq("user_id", userId);
}

// ─── Save Tokens ─────────────────────────────────────────────────────────────

export async function saveTokens(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
    scope?: string;
  }
) {
  const supabase = getSupabaseAdmin();

  await supabase.from("google_drive_tokens").upsert(
    {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : new Date(Date.now() + 3600_000).toISOString(),
      scope: tokens.scope || "https://www.googleapis.com/auth/drive.file",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
