import React from "react";
import { BmadBlock } from "@/lib/planejamento/schema";

const LABELS: Record<string, string> = {
  brand: "Brand — Identidade e Posicionamento",
  market: "Market — Análise de Mercado",
  audit: "Audit — Auditoria de Performance",
  direction: "Direction — Estratégia e Direção",
};

function scoreColor(score: number) {
  if (score >= 70) return "text-success-text bg-success-bg";
  if (score >= 40) return "text-amber-700 bg-amber-50";
  return "text-danger-text bg-danger-bg";
}

export function BmadScoreCard({ blockKey, block }: { blockKey: string; block: BmadBlock }) {
  const itens = Array.isArray(block.itens) ? block.itens : [];
  return (
    <div className="rounded-lg border border-hairline p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-ink">{LABELS[blockKey] || blockKey}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${scoreColor(block.score)}`}>
          {block.score}/100
        </span>
      </div>
      {block.resumo && <p className="text-sm text-muted">{block.resumo}</p>}
      {itens.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {itens.map((item, i) => (
            <li key={i} className="text-sm text-muted flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-rausch mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
