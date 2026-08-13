import React from "react";
import { SemanaEditorial } from "@/lib/planejamento/schema";

export function CalendarioEditorial({ semanas }: { semanas: SemanaEditorial[] }) {
  if (semanas.length === 0) return null;
  return (
    <div className="space-y-6">
      {semanas.map((semana, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-ink">{semana.label}</h4>
            {semana.meta && (
              <span className="text-xs font-bold text-rausch bg-surface-soft px-2 py-1 rounded-full">
                {semana.meta}
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {semana.dias.map((dia, j) => (
              <div key={j} className="rounded-lg border border-hairline p-3">
                <h5 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">{dia.dia}</h5>
                <div className="space-y-2">
                  {dia.posts.map((post, k) => (
                    <div key={k} className="text-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase text-rausch">{post.formato}</span>
                        {post.horario && <span className="text-[10px] text-muted-soft">{post.horario}</span>}
                      </div>
                      <p className="text-body">{post.hook}</p>
                      {post.cta && <p className="text-muted-soft text-xs mt-0.5">CTA: {post.cta}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
