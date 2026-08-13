"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PlanContent } from "@/lib/planejamento/schema";

export function PerformanceDash({ performance }: { performance: NonNullable<PlanContent["performance"]> }) {
  const {
    por_formato = [],
    padroes_temporais = [],
    temas = [],
    ctas = [],
    diagnostico,
    plano_crescimento = [],
  } = performance;

  const nadaAExibir =
    por_formato.length === 0 &&
    padroes_temporais.length === 0 &&
    temas.length === 0 &&
    ctas.length === 0 &&
    !diagnostico &&
    plano_crescimento.length === 0;

  if (nadaAExibir) return null;

  return (
    <div className="space-y-6">
      {por_formato.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">Desempenho por formato</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={por_formato}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f192a" />
                <XAxis dataKey="formato" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="engajamento" fill="#da2128" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {padroes_temporais.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">Padrões temporais</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {padroes_temporais.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2 text-sm">
                <span className="text-body">{p.dia} · {p.horario}</span>
                <span className="font-bold text-rausch">{p.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {temas.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">Temas mais engajantes</h4>
          <div className="space-y-1.5">
            {temas.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-body w-40 truncate">{t.tema}</span>
                <div className="flex-1 h-2 bg-surface-soft rounded-full overflow-hidden">
                  <div className="h-full bg-rausch rounded-full" style={{ width: `${Math.min(t.score, 100)}%` }} />
                </div>
                <span className="text-xs text-muted-soft w-10 text-right">{t.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ctas.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">Análise de CTAs</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {ctas.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2 text-sm">
                <span className="text-body">&ldquo;{c.cta}&rdquo;</span>
                <span className="font-bold text-rausch">{c.conversao}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {diagnostico && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">Diagnóstico</h4>
          <p className="text-sm text-body whitespace-pre-line">{diagnostico}</p>
        </div>
      )}

      {plano_crescimento.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">Plano de crescimento</h4>
          <ul className="space-y-1.5">
            {plano_crescimento.map((item, i) => (
              <li key={i} className="text-sm text-muted flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-rausch mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
