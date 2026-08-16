"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SemanaPlano } from "@/lib/planejamento/schema";

// Esqueleto mais próximo no repositório era o stepper de
// admin/clientes/novo/page.tsx (bolinha numerada + Check). Adaptado aqui
// para lista vertical com status editável em memória, como o briefing pede:
// "Status por semana editável localmente (pendente/em andamento/concluído)
// via useState". O dado em si (semana, titulo, acoes) continua somente
// leitura, vindo do plano publicado.

type StatusSemana = "pendente" | "em_andamento" | "concluido";

const STATUS_LABEL: Record<StatusSemana, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

const STATUS_NEXT: Record<StatusSemana, StatusSemana> = {
  pendente: "em_andamento",
  em_andamento: "concluido",
  concluido: "pendente",
};

interface TimelineProps {
  semanas: SemanaPlano[];
  className?: string;
}

export function Timeline({ semanas, className }: TimelineProps) {
  const [status, setStatus] = React.useState<Record<number, StatusSemana>>({});

  function statusDe(semana: number): StatusSemana {
    return status[semana] ?? "pendente";
  }

  function avancar(semana: number) {
    setStatus((prev) => ({ ...prev, [semana]: STATUS_NEXT[statusDe(semana)] }));
  }

  return (
    <ol className={cn("space-y-3", className)}>
      {semanas.map((item) => {
        const s = statusDe(item.semana);
        const concluida = s === "concluido";
        const emAndamento = s === "em_andamento";
        return (
          <li
            key={item.semana}
            className="flex gap-3 rounded-lg border border-hairline bg-navy-card p-4"
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                concluida
                  ? "bg-success text-white"
                  : emAndamento
                    ? "bg-rausch text-white"
                    : "bg-surface-strong text-muted",
              )}
            >
              {concluida ? <Check className="h-3.5 w-3.5" /> : item.semana}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  Semana {item.semana}: {item.titulo}
                </p>
                <button
                  type="button"
                  onClick={() => avancar(item.semana)}
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-badge font-semibold transition-colors",
                    concluida
                      ? "bg-success-bg text-success-text"
                      : emAndamento
                        ? "bg-warning-bg text-warning-text"
                        : "bg-surface-soft text-muted",
                  )}
                >
                  {STATUS_LABEL[s]}
                </button>
              </div>
              {item.acoes.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {item.acoes.map((acao, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rausch" />
                      {acao}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
