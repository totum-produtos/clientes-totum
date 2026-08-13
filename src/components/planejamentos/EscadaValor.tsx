import React from "react";
import { ProdutoDegrau } from "@/lib/planejamento/schema";

export function EscadaValor({ produtos }: { produtos: ProdutoDegrau[] }) {
  if (produtos.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {produtos.map((produto, i) => (
        <div key={i} className="rounded-lg border border-hairline p-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-ink">{produto.nome}</h4>
            <span className="text-xs font-bold text-rausch shrink-0">{produto.faixa_preco}</span>
          </div>
          <p className="text-xs text-muted-soft mb-2">{produto.publico}</p>
          <p className="text-sm text-muted">{produto.promessa}</p>
        </div>
      ))}
    </div>
  );
}
