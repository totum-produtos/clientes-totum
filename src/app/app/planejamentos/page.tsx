"use client";

import React from "react";
import Link from "next/link";
import { Target, ChevronRight } from "lucide-react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { usePlanejamentos } from "@/hooks/usePlanejamentos";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PlanejamentosPage() {
  const { client } = useGlobal();
  const { plans, loading } = usePlanejamentos({ clientId: client?.id ?? null });

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      <PageHeader
        title="Central de Planejamentos"
        description="Estratégia e plano de ação preparados pela Totum para o seu negócio"
      />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhum planejamento publicado"
            description="Assim que a Totum publicar o seu planejamento estratégico, ele aparece aqui."
            variant="card"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/app/planejamentos/${plan.id}`}
                className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5 hover:shadow-md transition-shadow flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-rausch">
                  <Target className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {plan.periodo_label || `Versão ${plan.versao}`}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-ink">{plan.titulo}</h3>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-soft">
                    {plan.published_at
                      ? `Publicado em ${new Date(plan.published_at).toLocaleDateString("pt-BR")}`
                      : "—"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-soft" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
