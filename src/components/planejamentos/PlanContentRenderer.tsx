import React from "react";
import {
  FileText,
  Gauge,
  Layers,
  Repeat,
  TrendingUp,
  Wrench,
  ListChecks,
  CalendarDays,
  Film,
  Megaphone,
  Users,
  Target,
  BarChart3,
} from "lucide-react";
import { PlanSection } from "@/components/planejamentos/PlanSection";
import { BmadScoreCard } from "@/components/planejamentos/BmadScoreCard";
import { EscadaValor } from "@/components/planejamentos/EscadaValor";
import { FunilSteps } from "@/components/planejamentos/FunilSteps";
import { ProjecaoChart } from "@/components/planejamentos/ProjecaoChart";
import { CalendarioEditorial } from "@/components/planejamentos/CalendarioEditorial";
import { ReelsRoteiros } from "@/components/planejamentos/ReelsRoteiros";
import { PerformanceDash } from "@/components/planejamentos/PerformanceDash";
import { BmadBlock, PlanContent } from "@/lib/planejamento/schema";

// Renderiza um PlanContent seção a seção — usado no viewer do cliente
// (src/app/app/planejamentos/[id]/page.tsx) e no preview do editor admin
// (src/app/app/admin/planejamentos/[id]/editar/page.tsx). Cada seção é
// tolerante à ausência das demais.
export function PlanContentRenderer({ content }: { content: PlanContent }) {
  const bmadBlocks: [string, BmadBlock][] = content.bmad
    ? (Object.entries(content.bmad).filter(([, v]) => Boolean(v)) as [string, BmadBlock][])
    : [];

  const hasAnySection = Object.keys(content).length > 0;

  return (
    <div className="space-y-6">
      {content.resumo_executivo && (
        <PlanSection icon={FileText} title="Resumo Executivo">
          <p className="text-sm text-body whitespace-pre-line">{content.resumo_executivo.texto}</p>
          {content.resumo_executivo.destaques && content.resumo_executivo.destaques.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {content.resumo_executivo.destaques.map((d, i) => (
                <li key={i} className="text-sm text-muted flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-rausch mt-2 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          )}
        </PlanSection>
      )}

      {bmadBlocks.length > 0 && (
        <PlanSection icon={Gauge} title="Diagnóstico BMAD" description="Brand · Market · Audit · Direction">
          <div className="grid gap-4 sm:grid-cols-2">
            {bmadBlocks.map(([key, block]) => (
              <BmadScoreCard key={key} blockKey={key} block={block} />
            ))}
          </div>
        </PlanSection>
      )}

      {content.escada_valor && content.escada_valor.produtos.length > 0 && (
        <PlanSection icon={Layers} title="Escada de Valor" description="Produtos e faixas de preço">
          <EscadaValor produtos={content.escada_valor.produtos} />
        </PlanSection>
      )}

      {content.funis && content.funis.length > 0 && (
        <PlanSection icon={Target} title="Funis de Venda">
          <FunilSteps funis={content.funis} />
        </PlanSection>
      )}

      {content.recorrencia && (
        <PlanSection icon={Repeat} title="Estratégia de Recorrência (MRR)">
          <p className="text-sm text-body whitespace-pre-line">{content.recorrencia.estrategia}</p>
          {content.recorrencia.metas_mrr && content.recorrencia.metas_mrr.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 mt-3">
              {content.recorrencia.metas_mrr.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2 text-sm">
                  <span className="text-muted">{m.label}</span>
                  <span className="font-bold text-ink">{m.valor}</span>
                </div>
              ))}
            </div>
          )}
        </PlanSection>
      )}

      {content.projecao && content.projecao.cenarios.length > 0 && (
        <PlanSection icon={TrendingUp} title="Projeção de Faturamento" description="Conservador · Realista · Agressivo">
          <ProjecaoChart cenarios={content.projecao.cenarios} />
        </PlanSection>
      )}

      {content.stack && content.stack.ferramentas.length > 0 && (
        <PlanSection icon={Wrench} title="Stack Tecnológico">
          <div className="grid gap-2 sm:grid-cols-2">
            {content.stack.ferramentas.map((f, i) => (
              <div key={i} className="rounded-lg border border-hairline px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{f.nome}</span>
                  {f.custo && <span className="text-xs text-muted-soft">{f.custo}</span>}
                </div>
                <span className="text-xs text-muted-soft">{f.categoria}</span>
              </div>
            ))}
          </div>
        </PlanSection>
      )}

      {content.plano_acao && (
        <PlanSection icon={ListChecks} title="Plano de Ação" description="Próximos 30 e 90 dias">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">30 dias</h4>
              <ul className="space-y-2">
                {content.plano_acao.d30.map((acao, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium text-ink">{acao.titulo}</span>
                    {acao.descricao && <p className="text-muted mt-0.5">{acao.descricao}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-2">90 dias</h4>
              <ul className="space-y-2">
                {content.plano_acao.d90.map((acao, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium text-ink">{acao.titulo}</span>
                    {acao.descricao && <p className="text-muted mt-0.5">{acao.descricao}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PlanSection>
      )}

      {content.calendario_editorial && content.calendario_editorial.semanas.length > 0 && (
        <PlanSection icon={CalendarDays} title="Calendário Editorial">
          <CalendarioEditorial semanas={content.calendario_editorial.semanas} />
        </PlanSection>
      )}

      {content.reels && content.reels.roteiros.length > 0 && (
        <PlanSection icon={Film} title="Estratégia de Reels">
          <ReelsRoteiros roteiros={content.reels.roteiros} />
        </PlanSection>
      )}

      {content.trafego_pago && (
        <PlanSection icon={Megaphone} title="Tráfego Pago">
          {content.trafego_pago.orcamento_mensal && (
            <p className="text-sm text-body mb-3">
              Orçamento mensal: <span className="font-bold">{content.trafego_pago.orcamento_mensal}</span>
            </p>
          )}
          {content.trafego_pago.publicos && content.trafego_pago.publicos.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-1.5">Públicos-alvo</h4>
              <ul className="space-y-1">
                {content.trafego_pago.publicos.map((p, i) => (
                  <li key={i} className="text-sm text-muted">{p.descricao}</li>
                ))}
              </ul>
            </div>
          )}
          {content.trafego_pago.posts_impulsionar && content.trafego_pago.posts_impulsionar.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-1.5">Posts para impulsionar</h4>
              <ul className="space-y-1">
                {content.trafego_pago.posts_impulsionar.map((p, i) => (
                  <li key={i} className="text-sm text-muted">{p.titulo}{p.motivo ? ` — ${p.motivo}` : ""}</li>
                ))}
              </ul>
            </div>
          )}
        </PlanSection>
      )}

      {content.collabs && content.collabs.perfis.length > 0 && (
        <PlanSection icon={Users} title="Collabs">
          <div className="grid gap-2 sm:grid-cols-2">
            {content.collabs.perfis.map((c, i) => (
              <div key={i} className="rounded-lg border border-hairline px-3 py-2">
                <span className="text-sm font-medium text-ink">{c.handle}</span>
                <p className="text-xs text-muted-soft">{c.motivo}</p>
              </div>
            ))}
          </div>
        </PlanSection>
      )}

      {content.metricas && content.metricas.kpis.length > 0 && (
        <PlanSection icon={Target} title="Métricas e KPIs">
          <div className="grid gap-2 sm:grid-cols-2">
            {content.metricas.kpis.map((k, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2 text-sm">
                <span className="text-muted">{k.nome}</span>
                <span className="font-bold text-ink">
                  {k.atual ? `${k.atual} → ` : ""}
                  {k.meta}
                </span>
              </div>
            ))}
          </div>
        </PlanSection>
      )}

      {content.performance && (
        <PlanSection icon={BarChart3} title="Performance">
          <PerformanceDash performance={content.performance} />
        </PlanSection>
      )}

      {!hasAnySection && (
        <p className="text-sm text-muted-soft text-center py-12">
          Este planejamento ainda não tem conteúdo.
        </p>
      )}
    </div>
  );
}
