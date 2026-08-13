import React from "react";
import { Funil } from "@/lib/planejamento/schema";

export function FunilSteps({ funis }: { funis: Funil[] }) {
  if (funis.length === 0) return null;
  return (
    <div className="space-y-5">
      {funis.map((funil, i) => (
        <div key={i}>
          <h4 className="text-sm font-semibold text-ink mb-2">{funil.nome}</h4>
          <ol className="flex flex-wrap items-center gap-2">
            {funil.etapas.map((etapa, j) => (
              <li key={j} className="flex items-center gap-2">
                <div className="rounded-md border border-hairline bg-surface-soft px-3 py-1.5">
                  <span className="text-xs font-medium text-ink">{etapa.passo}</span>
                  {etapa.kpi && <span className="block text-[11px] text-muted-soft">{etapa.kpi}</span>}
                </div>
                {j < funil.etapas.length - 1 && <span className="text-muted-soft">→</span>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
