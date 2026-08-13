// Wrapper padrão para cada seção do viewer de planejamento.
// Renderiza null quando não há conteúdo — mantém o viewer tolerante
// a seções ausentes no JSON (ver src/lib/planejamento/schema.ts).

import React from "react";
import { LucideIcon } from "lucide-react";

export interface PlanSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function PlanSection({ icon: Icon, title, description, children }: PlanSectionProps) {
  return (
    <section className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-rausch" />
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted mb-4">{description}</p>}
      <div className={description ? "" : "mt-4"}>{children}</div>
    </section>
  );
}
