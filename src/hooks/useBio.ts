// src/hooks/useBio.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types";
import {
  getBioProfileByClient,
  getBioLeads,
  getBioClickEvents,
  getBioLinksLabels,
  getBioProductsLabels,
} from "@/services/db/bio";

export type BioLead = Tables<"bio_leads">;
export type BioClickEvent = Tables<"bio_click_events">;

export interface BioAnalyticsSummary {
  pageViews: number;
  linkClicks: number;
  productClicks: number;
  leadSubmits: number;
  topLinks: { id: string; label: string; clicks: number }[];
  topProducts: { id: string; nome: string; clicks: number }[];
}

const WINDOW_DAYS = 30;

export function useBio(clientId: string | null) {
  const [leads, setLeads] = useState<BioLead[]>([]);
  const [events, setEvents] = useState<BioClickEvent[]>([]);
  const [linkLabels, setLinkLabels] = useState<Record<string, string>>({});
  const [productLabels, setProductLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setLeads([]);
      setEvents([]);
      setLinkLabels({});
      setProductLabels({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const { data: profile } = await getBioProfileByClient(sb, clientId);

      const [leadsRes, eventsRes, linksRes, productsRes] = await Promise.all([
        getBioLeads(sb, clientId),
        getBioClickEvents(sb, clientId, since),
        profile
          ? getBioLinksLabels(sb, profile.id)
          : Promise.resolve({ data: [] as { id: string; label: string }[] }),
        profile
          ? getBioProductsLabels(sb, profile.id)
          : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setLeads(leadsRes.data || []);
      setEvents(eventsRes.data || []);
      setLinkLabels(Object.fromEntries((linksRes.data || []).map((l) => [l.id, l.label])));
      setProductLabels(Object.fromEntries((productsRes.data || []).map((p) => [p.id, p.nome])));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados da bio.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const summary: BioAnalyticsSummary = useMemo(() => {
    const countByTarget = (targetType: string) => {
      const map = new Map<string, number>();
      for (const e of events) {
        if (e.target_type !== targetType || !e.target_id) continue;
        map.set(e.target_id, (map.get(e.target_id) || 0) + 1);
      }
      return map;
    };

    const linkCounts = countByTarget("link");
    const productCounts = countByTarget("product");

    const topLinks = [...linkCounts.entries()]
      .map(([id, clicks]) => ({ id, label: linkLabels[id] || "Link removido", clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    const topProducts = [...productCounts.entries()]
      .map(([id, clicks]) => ({ id, nome: productLabels[id] || "Produto removido", clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      pageViews: events.filter((e) => e.target_type === "page_view").length,
      linkClicks: linkCounts.size > 0 ? [...linkCounts.values()].reduce((a, b) => a + b, 0) : 0,
      productClicks: productCounts.size > 0 ? [...productCounts.values()].reduce((a, b) => a + b, 0) : 0,
      leadSubmits: events.filter((e) => e.target_type === "lead_submit").length,
      topLinks,
      topProducts,
    };
  }, [events, linkLabels, productLabels]);

  return { leads, events, summary, loading, error, reload: load };
}
