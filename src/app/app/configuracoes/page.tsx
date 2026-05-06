"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConfiguracoesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/perfil");
  }, [router]);
  return null;
}
