// Estado de erro para páginas inteiras. Substitui os blocos
// ad-hoc com <AlertCircle> + mensagem + botão "Voltar".
//
// Uso:
//   <PageError title="Erro ao carregar" description={err} />
//   <PageError ... action={<button onClick={reload}>Tentar novamente</button>} />

import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export interface PageErrorProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Default: link "Voltar ao Início". Passe `null` pra esconder. */
  defaultBack?: React.ReactNode;
}

export function PageError({
  title = "Algo deu errado",
  description,
  action,
  defaultBack = (
    <Link
      href="/app"
      className="block w-full py-3 bg-rausch text-white font-medium rounded-md hover:bg-rausch-active text-center transition-colors"
    >
      Voltar ao Início
    </Link>
  ),
}: PageErrorProps) {
  return (
    <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-canvas border border-hairline p-8 rounded-xl shadow-airbnb max-w-md w-full">
        <AlertCircle className="w-12 h-12 text-rausch mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink mb-2">{title}</h2>
        {description && (
          <p className="text-muted text-sm mb-6 whitespace-pre-line">{description}</p>
        )}
        {action || defaultBack}
      </div>
    </div>
  );
}
