"use client";

// Error boundary do segmento /app e demais rotas. Diferente do
// global-error, aqui o root layout ainda está intacto, então usamos o
// design system Totum.

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registro no console para diagnóstico (sem expor stack ao usuário).
    console.error("Erro de renderização:", error);
  }, [error]);

  return (
    <div className="totum-red-canvas min-h-screen flex items-center justify-center px-6">
      <div className="relative z-10 max-w-xl text-center">
        <span className="totum-kicker">Erro inesperado</span>
        <h1 className="totum-heading mt-5">Algo deu errado.</h1>
        <p className="mt-6 text-base text-white-soft leading-relaxed">
          Tivemos um problema ao carregar esta página. Tente novamente — se o
          problema continuar, fale com o seu contato na Totum.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button type="button" onClick={() => reset()} className="totum-button-primary">
            Tentar novamente
          </button>
          <a href="/app" className="totum-button-ghost">
            Voltar ao início
          </a>
        </div>
        {error?.digest && (
          <p className="mt-12 text-xs uppercase tracking-[0.22em] text-muted-soft">
            Código do erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
