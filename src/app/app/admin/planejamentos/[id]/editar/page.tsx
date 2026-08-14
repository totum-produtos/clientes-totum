"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2, Archive, Undo2, AlertTriangle } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { persistOrThrow } from "@/lib/persist";
import { usePlanejamento } from "@/hooks/usePlanejamentos";
import { PageHeader } from "@/components/ui/PageHeader";
import { updatePlanContent, updatePlanStatus } from "@/services/db/plans";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageError } from "@/components/ui/PageError";
import { PlanContentRenderer } from "@/components/planejamentos/PlanContentRenderer";
import { PlanContent, validatePlanContent } from "@/lib/planejamento/schema";
import type { Json } from "@/lib/types";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-warning-bg text-warning-text" },
  publicado: { label: "Publicado", className: "bg-success-bg text-success-text" },
  arquivado: { label: "Arquivado", className: "bg-surface-strong text-muted-soft" },
};

export default function EditarPlanejamentoPage() {
  const params = useParams<{ id: string }>();
  const { plan, loading, error, reload } = usePlanejamento(params.id);

  const [titulo, setTitulo] = useState("");
  const [periodoLabel, setPeriodoLabel] = useState("");
  const [contentText, setContentText] = useState("{}");
  const [validation, setValidation] = useState<{ ok: boolean; errors: string[] } | null>(null);
  const [previewContent, setPreviewContent] = useState<PlanContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) return;
    setTitulo(plan.titulo);
    setPeriodoLabel(plan.periodo_label || "");
    const json = JSON.stringify(plan.content ?? {}, null, 2);
    setContentText(json);
    const result = validatePlanContent(plan.content ?? {});
    setValidation(result);
    setPreviewContent(result.ok ? ((plan.content ?? {}) as PlanContent) : null);
  }, [plan]);

  function handleValidate() {
    try {
      const parsed = JSON.parse(contentText);
      const result = validatePlanContent(parsed);
      setValidation(result);
      setPreviewContent(result.ok ? (parsed as PlanContent) : null);
    } catch {
      setValidation({ ok: false, errors: ["JSON inválido — verifique a sintaxe (vírgulas, chaves, aspas)."] });
      setPreviewContent(null);
    }
  }

  async function handleSave() {
    if (!plan) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(contentText);
    } catch {
      setValidation({ ok: false, errors: ["JSON inválido — verifique a sintaxe (vírgulas, chaves, aspas)."] });
      return;
    }
    const result = validatePlanContent(parsed);
    setValidation(result);
    if (!result.ok) return;

    setSaving(true);
    setSaveError(null);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      await persistOrThrow(
        updatePlanContent(sb, plan.id, { titulo: titulo.trim(), periodo_label: periodoLabel.trim() || null, content: parsed as Json }),
        { db: sb, source: "admin/planejamentos/editar:salvar", metadata: { planId: plan.id } },
      );
      await reload();
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: "rascunho" | "publicado" | "arquivado") {
    if (!plan) return;
    setStatusChanging(true);
    setSaveError(null);
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      await persistOrThrow(
        updatePlanStatus(sb, plan.id, newStatus, newStatus === "publicado" ? new Date().toISOString() : plan.published_at),
        { db: sb, source: "admin/planejamentos/editar:status", metadata: { planId: plan.id, newStatus } },
      );
      await reload();
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Erro ao mudar status.");
    } finally {
      setStatusChanging(false);
    }
  }

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
        description={error || "Este planejamento não existe."}
        action={
          <Link
            href="/app/admin/planejamentos"
            className="block w-full py-3 bg-rausch text-white font-medium rounded-md hover:bg-rausch-active text-center transition-colors"
          >
            Voltar para Gestão de Planejamentos
          </Link>
        }
      />
    );
  }

  const status = STATUS_LABEL[plan.status] ?? STATUS_LABEL.rascunho;

  return (
    <div className="min-h-screen bg-surface-soft pb-16">
      <PageHeader
        title="Editar Planejamento"
        actions={
          <Link
            href="/app/admin/planejamentos"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-6 grid gap-6 lg:grid-cols-2">
        {/* Coluna esquerda: metadados + edição JSON */}
        <div className="space-y-4">
          <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.className}`}>
                {status.label}
              </span>
              <span className="text-xs text-muted-soft">versão {plan.versao}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-soft mb-1.5">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-soft mb-1.5">Período (ex: Ago–Out 2026)</label>
              <input
                type="text"
                value={periodoLabel}
                onChange={(e) => setPeriodoLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-sm text-ink"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-hairline">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors disabled:opacity-50"
              >
                {saving ? <LoadingSpinner size="sm" inverted /> : <Save className="w-4 h-4" />}
                Salvar
              </button>

              {plan.status !== "publicado" && (
                <button
                  onClick={() => handleStatusChange("publicado")}
                  disabled={statusChanging}
                  className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Publicar
                </button>
              )}

              {plan.status === "publicado" && (
                <button
                  onClick={() => handleStatusChange("rascunho")}
                  disabled={statusChanging}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-strong text-ink rounded-md text-sm font-medium hover:bg-surface-soft transition-colors disabled:opacity-50"
                >
                  <Undo2 className="w-4 h-4" /> Despublicar
                </button>
              )}

              {plan.status !== "arquivado" && (
                <button
                  onClick={() => handleStatusChange("arquivado")}
                  disabled={statusChanging}
                  className="flex items-center gap-2 px-4 py-2 border border-hairline text-muted rounded-md text-sm font-medium hover:bg-surface-soft transition-colors disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" /> Arquivar
                </button>
              )}
            </div>

            {saveError && <p className="text-sm text-danger-text">{saveError}</p>}
          </div>

          <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-soft">Conteúdo (colar JSON)</label>
              <button
                onClick={handleValidate}
                className="text-xs font-medium text-rausch hover:underline"
              >
                Validar
              </button>
            </div>
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={24}
              spellCheck={false}
              className="w-full px-3 py-2 rounded-md border border-hairline bg-surface-soft text-xs font-mono text-ink resize-y"
            />
            {validation && !validation.ok && (
              <div className="mt-2 rounded-md bg-danger-bg border border-danger/30 p-3">
                <div className="flex items-center gap-1.5 text-danger-text text-xs font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Corrija antes de salvar
                </div>
                <ul className="space-y-0.5">
                  {validation.errors.map((e, i) => (
                    <li key={i} className="text-xs text-danger-text">{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation && validation.ok && (
              <p className="mt-2 text-xs text-success-text">JSON válido — preview atualizado ao lado.</p>
            )}
          </div>
        </div>

        {/* Coluna direita: preview usando os mesmos componentes do viewer do cliente */}
        <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-soft mb-4">
            Preview (como o cliente vê)
          </h3>
          {previewContent ? (
            <PlanContentRenderer content={previewContent} />
          ) : (
            <p className="text-sm text-muted-soft py-8 text-center">
              Corrija o JSON e clique em &ldquo;Validar&rdquo; para ver o preview.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
