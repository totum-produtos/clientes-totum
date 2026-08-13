import React from "react";
import { Roteiro } from "@/lib/planejamento/schema";

export function ReelsRoteiros({ roteiros }: { roteiros: Roteiro[] }) {
  if (roteiros.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {roteiros.map((roteiro, i) => (
        <div key={i} className="rounded-lg border border-hairline p-4">
          <h4 className="text-sm font-semibold text-ink mb-1">{roteiro.titulo}</h4>
          <p className="text-sm text-body italic mb-2">&ldquo;{roteiro.gancho}&rdquo;</p>
          {roteiro.cenas && roteiro.cenas.length > 0 && (
            <ul className="space-y-1 mb-2">
              {roteiro.cenas.map((cena, j) => (
                <li key={j} className="text-xs text-muted flex gap-2">
                  <span className="text-muted-soft shrink-0">{j + 1}.</span>
                  {cena}
                </li>
              ))}
            </ul>
          )}
          {roteiro.cta && <p className="text-xs font-medium text-rausch">CTA: {roteiro.cta}</p>}
        </div>
      ))}
    </div>
  );
}
