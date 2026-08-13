"use client";

// Dispara o beacon de tracking pra /api/bio/track. Best-effort: nunca
// deve impedir navegação nem lançar — se sendBeacon falhar, seguimos
// em frente sem o clique registrado.
export function sendBioTrackBeacon(payload: {
  slug: string;
  target_type: "page_view" | "link" | "product";
  target_id?: string;
}) {
  try {
    const body = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon("/api/bio/track", body);
  } catch {
    // silencioso — tracking não pode quebrar a experiência do visitante
  }
}
