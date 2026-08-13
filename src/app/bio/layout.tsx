// Layout da bio pública. O root layout (src/app/layout.tsx) fixa
// <html class="dark"> + tema Totum vermelho para toda a área logada —
// aqui isso é sobrescrito visualmente com um wrapper claro em tela
// cheia (min-h-screen cobre o fundo escuro herdado do body).
// Cores de marca do cliente entram via CSS vars, aplicadas pelas
// páginas filhas (page.tsx / produto/[productId]/page.tsx).

import React from "react";

export default function BioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ colorScheme: "light" }}>
      {children}
    </div>
  );
}
