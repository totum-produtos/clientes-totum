"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePlanejamento } from "@/hooks/usePlanejamentos";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageError } from "@/components/ui/PageError";
import { PlanContentRenderer } from "@/components/planejamentos/PlanContentRenderer";
import { PlanContent } from "@/lib/planejamento/schema";

export default function PlanejamentoViewerPage() {
  const params = useParams<{ id: string }>();
  const { plan, loading, error } = usePlanejamento(params.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <PageError
        title="Planejamento não encontrado"
        description={error || "Este planejamento não existe ou ainda não foi publicado para você."}
        action={
          <Link
            href="/app/planejamentos"
            className="block w-full py-3 bg-rausch text-white font-medium rounded-md hover:bg-rausch-active text-center transition-colors"
          >
            Voltar para Planejamentos
          </Link>
        }
      />
    );
  }

  const content = (plan.content || {}) as PlanContent;

  return (
    <div className="min-h-screen bg-surface-soft pb-16">
      <PageHeader
        title={plan.titulo}
        description={plan.periodo_label || undefined}
        actions={
          <Link
            href="/app/planejamentos"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        }
      />

      <div className="max-w-4xl mx-auto px-6 py-6">
        <PlanContentRenderer content={content} />
      </div>
    </div>
  );
}
