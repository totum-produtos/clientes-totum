"use client";

import { useEffect } from "react";
import { sendBioTrackBeacon } from "./track-client";

// Registra 1 page_view por carregamento da bio pública. Componente
// invisível (retorna null) — só existe pra rodar o efeito no client.
export function BioPageViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    sendBioTrackBeacon({ slug, target_type: "page_view" });
  }, [slug]);

  return null;
}
