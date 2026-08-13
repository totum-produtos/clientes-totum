"use client";

import React from "react";
import { Eye, MousePointerClick, ShoppingBag, UserPlus, Link2, Package } from "lucide-react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { useBio } from "@/hooks/useBio";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-4">
      <div className="flex items-center gap-2 text-muted-soft mb-1.5">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

export default function BioAnalyticsPage() {
  const { client } = useGlobal();
  const { leads, summary, loading } = useBio(client?.id ?? null);

  return (
    <div className="min-h-screen bg-surface-soft pb-16">
      <PageHeader title="Link na Bio — Leads & Analytics" description="Últimos 30 dias" />

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Eye} label="Visitas" value={summary.pageViews} />
              <StatCard icon={MousePointerClick} label="Cliques em links" value={summary.linkClicks} />
              <StatCard icon={ShoppingBag} label="Cliques em produtos" value={summary.productClicks} />
              <StatCard icon={UserPlus} label="Leads capturados" value={summary.leadSubmits} />
            </div>

            {(summary.topLinks.length > 0 || summary.topProducts.length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {summary.topLinks.length > 0 && (
                  <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-3 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" /> Links mais clicados
                    </h3>
                    <div className="space-y-2">
                      {summary.topLinks.map((l) => (
                        <div key={l.id} className="flex items-center justify-between text-sm">
                          <span className="text-body truncate">{l.label}</span>
                          <span className="font-bold text-rausch shrink-0 ml-2">{l.clicks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {summary.topProducts.length > 0 && (
                  <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-3 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Produtos mais clicados
                    </h3>
                    <div className="space-y-2">
                      {summary.topProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <span className="text-body truncate">{p.nome}</span>
                          <span className="font-bold text-rausch shrink-0 ml-2">{p.clicks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-3">Leads</h3>
              {leads.length === 0 ? (
                <EmptyState icon={UserPlus} title="Nenhum lead ainda" description="Assim que alguém deixar contato pela sua bio, aparece aqui." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-soft border-b border-hairline">
                        <th className="pb-2 font-medium">Nome</th>
                        <th className="pb-2 font-medium">WhatsApp</th>
                        <th className="pb-2 font-medium">E-mail</th>
                        <th className="pb-2 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-hairline last:border-0">
                          <td className="py-2 text-ink font-medium">{lead.nome}</td>
                          <td className="py-2 text-muted">{lead.whatsapp || "—"}</td>
                          <td className="py-2 text-muted">{lead.email || "—"}</td>
                          <td className="py-2 text-muted-soft text-xs">
                            {new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
