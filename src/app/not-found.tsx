// Página 404 — rota não encontrada. Server component (sem estado).

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="totum-red-canvas min-h-screen flex items-center justify-center px-6">
      <div className="relative z-10 max-w-xl text-center">
        <span className="totum-kicker">Erro 404</span>
        <h1 className="totum-heading mt-5">Página não encontrada.</h1>
        <p className="mt-6 text-base text-white-soft leading-relaxed">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Link href="/app" className="totum-button-primary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
