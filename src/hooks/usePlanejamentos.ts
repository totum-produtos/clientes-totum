// src/hooks/usePlanejamentos.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/types";

export type PortalClientPlan = Tables<"portal_client_plans">;

interface UsePlanejamentosOptions {
  clientId: string | null;
  /** true = admin/master (vê rascunho/publicado/arquivado). false = visão do cliente (RLS já restringe a publicado). */
  includeAllStatuses?: boolean;
}

export function usePlanejamentos({ clientId, includeAllStatuses = false }: UsePlanejamentosOptions) {
  const [plans, setPlans] = useState<PortalClientPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = await createSPASassClient();
      let query = supabase
        .getSupabaseClient()
        .from("portal_client_plans")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (!includeAllStatuses) {
        query = query.eq("status", "publicado");
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setPlans(data || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao carregar planejamentos.");
    } finally {
      setLoading(false);
    }
  }, [clientId, includeAllStatuses]);

  useEffect(() => {
    load();
  }, [load]);

  return { plans, loading, error, reload: load };
}

export function usePlanejamento(id: string | null) {
  const [plan, setPlan] = useState<PortalClientPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setPlan(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = await createSPASassClient();
      const { data, error: err } = await supabase
        .getSupabaseClient()
        .from("portal_client_plans")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (err) throw err;
      setPlan(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao carregar planejamento.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { plan, loading, error, reload: load };
}
