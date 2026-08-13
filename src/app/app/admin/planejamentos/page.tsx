"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Target, ChevronRight } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { persistOrThrow } from "@/lib/persist";
import { usePlanejamentos } from "@/hooks/usePlanejamentos";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

type ClienteOption = { id: string; nome: string };

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-warning-bg text-warning-text" },
  publicado: { label: "Publicado", className: "bg-success-bg text-success-text" },
  arquivado: { label: "Arquivado", className: "bg-surface-strong text-muted-soft" },
};

export default function AdminPlanejamentosPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [clientesLoading, setClientesLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { plans, loading: plansLoading } = usePlanejamentos({
    clientId: selectedClientId || null,
    includeAllStatuses: true,
  });

  const loadClientes = useCallback(async () => {
    setClientesLoading(true);
    try {
      const supabase = await createSPASassClient();
      const { data } = await supabase
        .getSupabaseClient()
        .from("portal_clients")
        .select("id, nome")
        .order("nome");
      setClientes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setClientesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  async function handleCreate() {
    if (!selectedClientId || !novoTitulo.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      const [row] = await persistOrThrow(
        sb
          .from("portal_client_plans")
          .insert({ client_id: selectedClientId, titulo: novoTitulo.trim(), status: "rascunho" })
          .select("id"),
        { db: sb, source: "admin/planejamentos:criar", metadata: { clientId: selectedClientId } },
      );
      setNovoTitulo("");
      router.push(`/app/admin/planejamentos/${row.id}/editar`);
    } catch (err) {
      console.error(err);
      setCreateError(err instanceof Error ? err.message : "Erro ao criar planejamento.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-16">
      <PageHeader
        title="Central de Planejamentos — Gestão"
        description="Crie e publique planejamentos estratégicos por cliente"
      />

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
            <div>
              <label className="block text-xs font-semibold text-muted-soft mb-1.5">Cliente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                disabled={clientesLoading}
                className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
              >
                <option value="">Selecione um cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-soft mb-1.5">Novo planejamento</label>
              <input
                type="text"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                placeholder="Título do planejamento"
                disabled={!selectedClientId}
                className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!selectedClientId || !novoTitulo.trim() || creating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {creating ? <LoadingSpinner size="sm" inverted /> : <Plus className="w-4 h-4" />}
              Criar
            </button>
          </div>
          {createError && <p className="text-sm text-danger-text mt-2">{createError}</p>}
        </div>

        {!selectedClientId ? (
          <EmptyState
            icon={Target}
            title="Selecione um cliente"
            description="Escolha um cliente acima para ver e gerenciar os planejamentos dele."
            variant="card"
          />
        ) : plansLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhum planejamento ainda"
            description="Crie o primeiro planejamento para este cliente usando o formulário acima."
            variant="card"
          />
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => {
              const status = STATUS_LABEL[plan.status] ?? STATUS_LABEL.rascunho;
              return (
                <Link
                  key={plan.id}
                  href={`/app/admin/planejamentos/${plan.id}/editar`}
                  className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-muted-soft">v{plan.versao}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink truncate">{plan.titulo}</h3>
                    {plan.periodo_label && <p className="text-xs text-muted-soft">{plan.periodo_label}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-soft shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
