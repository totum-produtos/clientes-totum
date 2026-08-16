"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Brain,
  Building2,
  ChevronDown,
  Target,
  TrendingUp,
  Package,
  ClipboardList,
  Gauge,
  AlertTriangle,
} from "lucide-react";

import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { usePlanejamentos } from "@/hooks/usePlanejamentos";
import type { DiagnosticoComercial } from "@/lib/planejamento/schema";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible } from "@/components/ui/collapsible";
import { Timeline } from "@/components/ui/timeline";
import { PlanSection } from "@/components/planejamentos/PlanSection";

// Página interna de diagnóstico comercial por cliente. Cozinha, não vitrine:
// fica sob /app/inteligencia (exige login pelo middleware) e checa
// role === 'master' no front, mesmo padrão de central-conteudo/page.tsx.
// O dado vem de portal_client_plans.content.diagnostico_comercial, a mesma
// tabela e o mesmo schema jsonb da Central de Planejamentos, sem tabela nova
// e sem RLS nova.

type ClienteOpcao = {
  id: string;
  nome: string;
  status: string | null;
};

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "accent" | "warning" }> = {
  ativo: { label: "Ativo", variant: "success" },
  piloto: { label: "Piloto", variant: "accent" },
  prospecto: { label: "Prospecto", variant: "warning" },
};

function InteligenciaContent() {
  const { user, loading: globalLoading } = useGlobal();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clientes, setClientes] = useState<ClienteOpcao[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [tab, setTab] = useState("perfil");

  useEffect(() => {
    if (globalLoading) return;
    if (!user || user.role !== "master") {
      router.push("/app");
    }
  }, [user, globalLoading, router]);

  const fetchClientes = useCallback(async () => {
    const supabase = await createSPASassClient();
    const { data, error } = await supabase
      .getSupabaseClient()
      .from("portal_clients")
      .select("id, nome, status")
      .order("nome", { ascending: true });
    if (!error && data) setClientes(data);
    setLoadingClientes(false);
  }, []);

  useEffect(() => {
    if (globalLoading || !user || user.role !== "master") return;
    fetchClientes();
  }, [globalLoading, user, fetchClientes]);

  // ?cliente=<id> tem prioridade no primeiro carregamento. Depois disso o
  // dropdown manda, sem reescrever a URL a cada troca.
  useEffect(() => {
    if (clienteId || clientes.length === 0) return;
    const doUrl = searchParams.get("cliente");
    if (doUrl && clientes.some((c) => c.id === doUrl)) {
      setClienteId(doUrl);
    } else {
      setClienteId(clientes[0].id);
    }
  }, [clientes, clienteId, searchParams]);

  const { plans, loading: loadingPlans } = usePlanejamentos({
    clientId: clienteId,
    includeAllStatuses: true,
  });

  const clienteAtual = clientes.find((c) => c.id === clienteId) || null;

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter((c) => c.nome.toLowerCase().includes(termo));
  }, [clientes, busca]);

  // O diagnóstico comercial pode estar em qualquer plano do cliente; usa o
  // mais recente que efetivamente tenha a seção preenchida.
  const diagnostico: DiagnosticoComercial | null = useMemo(() => {
    for (const plan of plans) {
      const content = plan.content as { diagnostico_comercial?: DiagnosticoComercial } | null;
      if (content?.diagnostico_comercial) return content.diagnostico_comercial;
    }
    return null;
  }, [plans]);

  if (globalLoading || !user || user.role !== "master") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const statusBadge = clienteAtual?.status ? STATUS_BADGE[clienteAtual.status] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <PageHeader
        title="Inteligência Comercial"
        description="Diagnóstico, scores e plano de ação por cliente."
      />

      <div className="px-6 space-y-6">
        {/* Seletor de cliente */}
        <div className="relative max-w-sm">
          <button
            type="button"
            onClick={() => setDropdownAberto((v) => !v)}
            className="w-full flex items-center justify-between gap-3 rounded-lg border border-hairline bg-navy-card px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 shrink-0 text-muted" />
              <span className="truncate text-sm font-medium text-ink">
                {loadingClientes ? "Carregando..." : clienteAtual?.nome || "Selecione um cliente"}
              </span>
              {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${dropdownAberto ? "rotate-180" : ""}`} />
          </button>

          {dropdownAberto && (
            <div className="absolute z-10 mt-2 w-full rounded-lg border border-hairline bg-navy-card shadow-airbnb">
              <div className="p-2 border-b border-hairline">
                <input
                  autoFocus
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full rounded-md bg-surface-soft px-3 py-2 text-sm text-ink outline-none"
                />
              </div>
              <div className="max-h-64 overflow-auto py-1">
                {clientesFiltrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setClienteId(c.id);
                      setDropdownAberto(false);
                      setBusca("");
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-surface-soft ${c.id === clienteId ? "text-rausch" : "text-body"}`}
                  >
                    <span className="truncate">{c.nome}</span>
                    {c.status && STATUS_BADGE[c.status] && (
                      <Badge variant={STATUS_BADGE[c.status].variant}>{STATUS_BADGE[c.status].label}</Badge>
                    )}
                  </button>
                ))}
                {clientesFiltrados.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted">Nenhum cliente encontrado.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {loadingPlans ? (
          <div className="flex items-center justify-center min-h-[30vh]">
            <LoadingSpinner />
          </div>
        ) : !diagnostico ? (
          <EmptyState
            icon={Brain}
            variant="card"
            title="Nenhum diagnóstico comercial para este cliente"
            description="Cadastre a seção diagnostico_comercial no plano deste cliente pelo editor de Planejamentos."
          />
        ) : (
          <>
            {diagnostico.data_analise && (
              <p className="text-xs text-muted">
                Análise de {new Date(diagnostico.data_analise + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
            )}

            {/* Scores */}
            {diagnostico.scores && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-lg border border-hairline bg-navy-card p-6">
                <ScoreRing score={diagnostico.scores.fitGeral} label="Fit Geral" />
                <ScoreRing score={diagnostico.scores.urgencia} label="Urgência" />
                <ScoreRing score={diagnostico.scores.potencialReceita} label="Potencial de Receita" />
                <ScoreRing score={diagnostico.scores.maturidadeDigital} label="Maturidade Digital" />
              </div>
            )}

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="spin">SPIN</TabsTrigger>
                <TabsTrigger value="produto">Produto</TabsTrigger>
                <TabsTrigger value="plano">Plano</TabsTrigger>
                <TabsTrigger value="metricas">Métricas</TabsTrigger>
                <TabsTrigger value="gaps">Gaps</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="perfil">
                  {diagnostico.perfil ? (
                    <PlanSection icon={Building2} title="Perfil do cliente">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        {diagnostico.perfil.faturamentoAtual && (
                          <div>
                            <dt className="text-xs text-muted">Faturamento atual</dt>
                            <dd className="text-sm text-ink mt-0.5">{diagnostico.perfil.faturamentoAtual}</dd>
                          </div>
                        )}
                        {diagnostico.perfil.metaFaturamento && (
                          <div>
                            <dt className="text-xs text-muted">Meta de faturamento</dt>
                            <dd className="text-sm text-ink mt-0.5">{diagnostico.perfil.metaFaturamento}</dd>
                          </div>
                        )}
                        {diagnostico.perfil.ticketMedio && (
                          <div>
                            <dt className="text-xs text-muted">Ticket médio</dt>
                            <dd className="text-sm text-ink mt-0.5">{diagnostico.perfil.ticketMedio}</dd>
                          </div>
                        )}
                        {diagnostico.perfil.modelo && (
                          <div>
                            <dt className="text-xs text-muted">Modelo</dt>
                            <dd className="text-sm text-ink mt-0.5">{diagnostico.perfil.modelo}</dd>
                          </div>
                        )}
                        {diagnostico.perfil.volumeLeadsMes && (
                          <div>
                            <dt className="text-xs text-muted">Volume de leads/mês</dt>
                            <dd className="text-sm text-ink mt-0.5">{diagnostico.perfil.volumeLeadsMes}</dd>
                          </div>
                        )}
                        {diagnostico.perfil.crmAtual && (
                          <div>
                            <dt className="text-xs text-muted">CRM atual</dt>
                            <dd className="text-sm text-ink mt-0.5">{diagnostico.perfil.crmAtual}</dd>
                          </div>
                        )}
                        {(diagnostico.perfil.timeSizeComercial !== undefined ||
                          diagnostico.perfil.timeSizeOperacional !== undefined) && (
                          <div>
                            <dt className="text-xs text-muted">Time</dt>
                            <dd className="text-sm text-ink mt-0.5">
                              {diagnostico.perfil.timeSizeComercial ?? 0} comercial,{" "}
                              {diagnostico.perfil.timeSizeOperacional ?? 0} operacional
                            </dd>
                          </div>
                        )}
                      </dl>
                      {diagnostico.perfil.canaisEntrada && diagnostico.perfil.canaisEntrada.length > 0 && (
                        <div className="mt-4">
                          <dt className="text-xs text-muted mb-2">Canais de entrada</dt>
                          <div className="flex flex-wrap gap-2">
                            {diagnostico.perfil.canaisEntrada.map((canal) => (
                              <Badge key={canal} variant="default">{canal}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </PlanSection>
                  ) : (
                    <EmptyState title="Sem dados de perfil" variant="card" />
                  )}
                </TabsContent>

                <TabsContent value="spin">
                  {diagnostico.spin ? (
                    <div className="space-y-3">
                      {diagnostico.spin.situacao && (
                        <Collapsible title="S · Situação" defaultOpen>
                          <p className="text-sm text-muted">{diagnostico.spin.situacao}</p>
                        </Collapsible>
                      )}
                      {diagnostico.spin.problemas && diagnostico.spin.problemas.length > 0 && (
                        <Collapsible title="P · Problemas">
                          <ul className="space-y-2">
                            {diagnostico.spin.problemas.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-danger-text" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </Collapsible>
                      )}
                      {diagnostico.spin.implicacoes && diagnostico.spin.implicacoes.length > 0 && (
                        <Collapsible title="I · Implicações">
                          <ul className="space-y-2">
                            {diagnostico.spin.implicacoes.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-warning-text">
                                <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </Collapsible>
                      )}
                      {diagnostico.spin.necessidades && diagnostico.spin.necessidades.length > 0 && (
                        <Collapsible title="N · Necessidades">
                          <ul className="space-y-2">
                            {diagnostico.spin.necessidades.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-success-text">
                                <Target className="h-4 w-4 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </Collapsible>
                      )}
                    </div>
                  ) : (
                    <EmptyState title="Sem SPIN cadastrado" variant="card" />
                  )}
                </TabsContent>

                <TabsContent value="produto">
                  {diagnostico.produto_recomendado ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PlanSection icon={Package} title="Entrada">
                        <p className="text-sm text-ink font-medium">{diagnostico.produto_recomendado.entrada}</p>
                        {diagnostico.produto_recomendado.precoEntrada && (
                          <p className="text-sm text-muted mt-1">{diagnostico.produto_recomendado.precoEntrada}</p>
                        )}
                      </PlanSection>
                      {diagnostico.produto_recomendado.upsell && (
                        <PlanSection icon={TrendingUp} title="Upsell">
                          <p className="text-sm text-ink font-medium">{diagnostico.produto_recomendado.upsell}</p>
                          {diagnostico.produto_recomendado.precoUpsell && (
                            <p className="text-sm text-muted mt-1">{diagnostico.produto_recomendado.precoUpsell}</p>
                          )}
                        </PlanSection>
                      )}
                      {diagnostico.produto_recomendado.justificativa && (
                        <div className="sm:col-span-2">
                          <PlanSection icon={ClipboardList} title="Justificativa">
                            <p className="text-sm text-muted">{diagnostico.produto_recomendado.justificativa}</p>
                          </PlanSection>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState title="Sem produto recomendado" variant="card" />
                  )}
                </TabsContent>

                <TabsContent value="plano">
                  {diagnostico.plano_semanal && diagnostico.plano_semanal.length > 0 ? (
                    <Timeline semanas={diagnostico.plano_semanal} />
                  ) : (
                    <EmptyState title="Sem plano de ação semanal" variant="card" />
                  )}
                </TabsContent>

                <TabsContent value="metricas">
                  {diagnostico.metricas_comerciais && diagnostico.metricas_comerciais.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-hairline">
                      <table className="w-full text-sm">
                        <thead className="bg-surface-soft">
                          <tr className="text-left text-xs text-muted">
                            <th className="px-4 py-3 font-medium">Nome</th>
                            <th className="px-4 py-3 font-medium">Meta</th>
                            <th className="px-4 py-3 font-medium">Como medir</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diagnostico.metricas_comerciais.map((m, i) => (
                            <tr key={i} className="border-t border-hairline">
                              <td className="px-4 py-3 text-ink">{m.nome}</td>
                              <td className="px-4 py-3">
                                <Badge variant="accent">{m.meta}</Badge>
                              </td>
                              <td className="px-4 py-3 text-muted">{m.como || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState title="Sem métricas cadastradas" variant="card" />
                  )}
                </TabsContent>

                <TabsContent value="gaps">
                  {diagnostico.gaps && diagnostico.gaps.length > 0 ? (
                    <PlanSection icon={Gauge} title="Gaps identificados">
                      <ul className="space-y-2">
                        {diagnostico.gaps.map((gap, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-warning-text" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                      {diagnostico.observacoes && (
                        <p className="mt-4 pt-4 border-t border-hairline text-sm text-muted">
                          {diagnostico.observacoes}
                        </p>
                      )}
                    </PlanSection>
                  ) : (
                    <EmptyState title="Sem gaps registrados" variant="card" />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default function InteligenciaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      }
    >
      <InteligenciaContent />
    </Suspense>
  );
}
