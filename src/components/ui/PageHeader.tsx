// Header padrão para topo de página. Substitui o bloco
// `<div className="bg-canvas border-b"> ... <h1>...</h1> ...`
// que se repete em ~6 páginas com pequenas variações.
//
// Uso:
//   <PageHeader title="Calendário" description="Gerencie seus posts" />
//   <PageHeader title="..." actions={<button>Novo</button>} />

import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Largura máxima do container interno. Default: max-w-7xl. */
  maxWidth?: string;
  /** Renderiza fora do bg-canvas (ex: dentro de um wrapper já estilizado). */
  bare?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  maxWidth = "max-w-7xl",
  bare = false,
}: PageHeaderProps) {
  const inner = (
    <div className={`${maxWidth} mx-auto px-6 py-5 flex items-center justify-between gap-4`}>
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-ink truncate">{title}</h1>
        {description && (
          <p className="text-sm text-muted mt-0.5 truncate">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );

  if (bare) return inner;
  return <div className="bg-canvas border-b border-hairline">{inner}</div>;
}
