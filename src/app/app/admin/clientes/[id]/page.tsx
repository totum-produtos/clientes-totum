"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSPASassClient } from "@/lib/supabase/client";
import { logEvent } from "@/lib/log-event";
import {
  Check, ChevronRight, AlertCircle, X,
  Edit3, Save, ArrowLeft, Lock, KeyRound, Copy, Eye, EyeOff,
  RefreshCw, FolderOpen
} from "lucide-react";
import { STEPS, FormState, DEFAULT_FORM_STATE } from "@/lib/cliente-form-constants";
import { useClienteForm } from "@/hooks/useClienteForm";
import { ClienteFormSteps, validateStep } from "@/components/ClienteFormSteps";
import { LoadingSpinner, PageLoader } from "@/components/ui/LoadingSpinner";
import { useGlobal } from "@/lib/context/GlobalContext";

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");

  // Acesso do cliente
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Pasta do Google Drive (independente do wizard)
  const [driveUrl, setDriveUrl] = useState("");
  const [driveSaved, setDriveSaved] = useState("");
  const [driveSaving, setDriveSaving] = useState(false);

  const { user } = useGlobal();
  const isMaster = user?.role === "master" || user?.role === "admin";
  const { form, setForm, update, toggleArray, addPersona, removePersona, updatePersona } = useClienteForm();

  useEffect(() => {
    if (clientId) loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function loadClient() {
    setLoading(true);
    try {
      const supabase = await createSPASassClient();
      const { data, error: fetchError } = await supabase.getSupabaseClient()
        .from("portal_clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (fetchError || !data) {
        setError("Cliente não encontrado");
        setLoading(false);
        return;
      }

      const pd = (data.profile_data || {}) as Record<string, unknown>;
      setForm({
        ...DEFAULT_FORM_STATE,
        nome: (data.nome as string) || "",
        cnpj: (data.cnpj as string) || "",
        nome_responsavel: (data.nome_responsavel as string) || "",
        email_responsavel: (data.email_responsavel as string) || "",
        telefone: (data.telefone as string) || "",
        site: (data.site as string) || "",
        ramo_atuacao: (data.ramo_atuacao as string) || "",
        tempo_mercado: (data.tempo_mercado as string) || "",
        descricao_negocio: (data.descricao_negocio as string) || "",
        produtos_servicos: (data.produtos_servicos as string) || "",
        tamanho_empresa: (data.tamanho_empresa as string) || "",
        faturamento_mensal: (data.faturamento_mensal as string) || "",
        nicho_principal: (pd.nicho_principal as string) || "",
        dores_principais: (pd.dores_principais as string) || "",
        desejos_objetivos: (pd.desejos_objetivos as string) || "",
        faixa_etaria: (pd.faixa_etaria as number[]) || [18, 65],
        genero_alvo: (pd.genero_alvo as string) || "",
        localizacao_alvo: (pd.localizacao_alvo as string) || "",
        classe_social: (pd.classe_social as string[]) || [],
        tom_voz: (pd.tom_voz as string) || "",
        cor_primaria: (data.cor_primaria as string) || "#FF385C",
        cor_secundaria: (data.cor_secundaria as string) || "#1a1a2e",
        fontes: (pd.fontes as string) || "",
        key_visual_desc: (pd.key_visual_desc as string) || "",
        key_visual_images: (pd.key_visual_images as string[]) || [],
        personalidade_visual: (pd.personalidade_visual as string) || "",
        canais_atendimento: (pd.canais_atendimento as string[]) || [],
        crm_utilizado: (pd.crm_utilizado as string) || "",
        sla_resposta: (pd.sla_resposta as string) || "",
        horario_inicio: (pd.horario_inicio as string) || "08:00",
        horario_fim: (pd.horario_fim as string) || "18:00",
        dias_atendimento: (pd.dias_atendimento as string[]) || [],
        informacoes_adicionais: (pd.informacoes_adicionais as string) || "",
        personas: (pd.personas as FormState["personas"])?.length
          ? (pd.personas as FormState["personas"])
          : [{ nome: "", idade: "", ocupacao: "", objetivos: "", dores: "" }],
        circulo_dourado: (pd.circulo_dourado as FormState["circulo_dourado"]) || { porque: "", o_que: "", como: "" },
        caracteristicas_marca: (pd.caracteristicas_marca as FormState["caracteristicas_marca"]) || { missao: "", visao: "", valores: "", personalidade: "" },
        puv: (pd.puv as string) || "",
      });
      setDriveUrl((data.google_drive_folder_url as string) || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cliente");
    } finally {
      setLoading(false);
    }
  }

  const handleReenviarConvite = async () => {
    setAccessLoading(true); setAccessError(""); setAccessMessage(""); setInviteLink(""); setInviteCopied(false);
    try {
      const res = await fetch("/api/admin/clientes/acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reenviar-convite", clientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar link");
      setInviteLink(data.inviteLink);
      setAccessMessage(`Link gerado para ${data.email}`);
    } catch (err: unknown) {
      setAccessError(err instanceof Error ? err.message : "Erro ao gerar link de convite");
    } finally {
      setAccessLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleCriarSenha = async () => {
    if (!newPassword || newPassword.length < 6) {
      setAccessError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setAccessLoading(true); setAccessError(""); setAccessMessage(""); setInviteLink("");
    try {
      const res = await fetch("/api/admin/clientes/acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "criar-senha", clientId, senha: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao definir senha");
      setAccessMessage(`Senha definida para ${data.email}. Compartilhe as credenciais com o cliente.`);
      setShowPasswordForm(false);
      setNewPassword("");
    } catch (err: unknown) {
      setAccessError(err instanceof Error ? err.message : "Erro ao definir senha");
    } finally {
      setAccessLoading(false);
    }
  };

  const handleSaveDrive = async () => {
    setDriveSaving(true); setDriveSaved("");
    try {
      const supabase = await createSPASassClient();
      const { data: rows, error: e } = await supabase.getSupabaseClient()
        .from("portal_clients")
        .update({ google_drive_folder_url: driveUrl || null })
        .eq("id", clientId)
        .select("id");
      if (e) throw e;
      if (!rows || rows.length === 0) {
        throw new Error("registro não encontrado ou sem permissão");
      }
      setDriveSaved("Pasta atualizada com sucesso");
      setTimeout(() => setDriveSaved(""), 3000);
    } catch (err: unknown) {
      setDriveSaved("Erro: " + (err instanceof Error ? err.message : "falha ao salvar"));
    } finally {
      setDriveSaving(false);
    }
  };

  const goNextStep = () => {
    const { ok, missing } = validateStep(step, form);
    if (!ok) {
      setError(`Preencha os campos obrigatórios: ${missing.join(", ")}.`);
      return;
    }
    setError("");
    setStep(s => Math.min(STEPS.length, s + 1));
  };

  const handleSave = async () => {
    for (let s = 1; s <= STEPS.length; s++) {
      const { ok, missing } = validateStep(s, form);
      if (!ok) {
        setStep(s);
        setError(`Etapa ${s}: preencha os campos obrigatórios: ${missing.join(", ")}.`);
        return;
      }
    }
    setSaving(true); setError(""); setMessage("");
    try {
      const supabase = await createSPASassClient();
      const { data: updatedRows, error: updateError } = await supabase.getSupabaseClient().from("portal_clients").update({
        nome: form.nome,
        cnpj: form.cnpj,
        nome_responsavel: form.nome_responsavel,
        email_responsavel: form.email_responsavel,
        telefone: form.telefone,
        site: form.site,
        cor_primaria: form.cor_primaria,
        cor_secundaria: form.cor_secundaria,
        ramo_atuacao: form.ramo_atuacao,
        tempo_mercado: form.tempo_mercado,
        descricao_negocio: form.descricao_negocio,
        produtos_servicos: form.produtos_servicos,
        tamanho_empresa: form.tamanho_empresa,
        faturamento_mensal: form.faturamento_mensal,
        profile_data: {
          nicho_principal: form.nicho_principal,
          dores_principais: form.dores_principais,
          desejos_objetivos: form.desejos_objetivos,
          faixa_etaria: form.faixa_etaria,
          genero_alvo: form.genero_alvo,
          localizacao_alvo: form.localizacao_alvo,
          classe_social: form.classe_social,
          tom_voz: form.tom_voz,
          fontes: form.fontes,
          key_visual_desc: form.key_visual_desc,
          key_visual_images: form.key_visual_images,
          personalidade_visual: form.personalidade_visual,
          canais_atendimento: form.canais_atendimento,
          crm_utilizado: form.crm_utilizado,
          sla_resposta: form.sla_resposta,
          horario_inicio: form.horario_inicio,
          horario_fim: form.horario_fim,
          dias_atendimento: form.dias_atendimento,
          informacoes_adicionais: form.informacoes_adicionais,
          personas: form.personas,
          circulo_dourado: form.circulo_dourado,
          caracteristicas_marca: form.caracteristicas_marca,
          puv: form.puv,
        },
      }).eq("id", clientId).select("id");

      if (updateError) throw updateError;
      // Supabase NÃO retorna erro quando o UPDATE casa 0 linhas (registro
      // inexistente ou bloqueado por RLS). Sem este check, mostraríamos
      // "sucesso" sem ter salvo nada.
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(
          "Nada foi salvo: o cliente não foi encontrado ou você não tem permissão para editá-lo. Recarregue a página e tente novamente.",
        );
      }
      setMessage("Cliente atualizado com sucesso!");
      setEditMode(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar cliente";
      setError(msg);
      try {
        const sb = await createSPASassClient();
        await logEvent(sb.getSupabaseClient(), "error", "admin/clientes/[id]:handleSave", msg, {
          clientId, userId: user?.id,
        });
      } catch { /* logging não deve quebrar o fluxo */ }
    } finally {
      setSaving(false);
    }
  };

  const StepIcon = STEPS[step - 1].icon;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      {/* Header */}
      <div className="bg-canvas border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/app/gestao-clientes')} className="p-2 hover:bg-surface-strong rounded-md transition-colors">
              <ArrowLeft className="w-5 h-5 text-body" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-ink">EDITAR CLIENTE</h1>
              <p className="text-xs text-muted mt-0.5 uppercase tracking-wide">Visualize e edite os dados do cliente</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowAccessPanel(p => !p); setAccessError(""); setAccessMessage(""); setInviteLink(""); setShowPasswordForm(false); setNewPassword(""); }}
              className="flex items-center gap-2 px-5 py-2.5 border border-hairline text-body rounded-md text-sm font-medium hover:bg-surface-soft transition-all"
            >
              <KeyRound className="w-4 h-4" /> Acesso do Cliente
            </button>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-5 py-2.5 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-all shadow-airbnb">
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditMode(false); setMessage(""); setError(""); }} className="btn-ghost">
                  <X className="w-4 h-4" /> Cancelar Edição
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Painel de Acesso do Cliente */}
      {showAccessPanel && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-canvas border border-hairline rounded-lg p-6 shadow-airbnb">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-surface-soft flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-rausch" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Acesso do Cliente</h3>
                  <p className="text-xs text-muted">{form.email_responsavel || "Email não informado"}</p>
                </div>
              </div>
              <button onClick={() => setShowAccessPanel(false)} className="p-1.5 text-muted hover:text-body rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {accessError && (
              <div className="mb-4 p-3 bg-danger-bg border border-danger-bg rounded-md text-sm text-danger-text flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {accessError}
              </div>
            )}
            {accessMessage && (
              <div className="mb-4 p-3 bg-success-bg border border-success/20 rounded-md text-sm text-success-text flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                {accessMessage}
              </div>
            )}

            {/* Link copiável */}
            {inviteLink && (
              <div className="mb-4 p-3 bg-surface-soft border border-hairline rounded-md">
                <p className="text-xs font-medium text-ink mb-2">Link de convite gerado:</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={inviteLink}
                    className="flex-1 text-xs bg-canvas border border-hairline rounded px-3 py-2 text-body font-mono truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${inviteCopied ? "bg-success text-white" : "bg-rausch text-white hover:bg-rausch-active"}`}
                  >
                    {inviteCopied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">Envie este link para o cliente via WhatsApp ou Email. O link é de uso único.</p>
              </div>
            )}

            {/* Form senha */}
            {showPasswordForm && (
              <div className="mb-4 p-4 bg-surface-soft border border-hairline rounded-md">
                <p className="text-xs font-medium text-ink mb-3">Defina uma senha para o cliente acessar com email + senha:</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-canvas border border-hairline rounded-md px-3 py-2 pr-10 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-rausch focus:ring-2 focus:ring-rausch/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleCriarSenha}
                    disabled={accessLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active disabled:opacity-50 transition-all"
                  >
                    {accessLoading ? <LoadingSpinner size="sm" inverted /> : <><Check className="w-3.5 h-3.5" /> Definir</>}
                  </button>
                  <button onClick={() => { setShowPasswordForm(false); setNewPassword(""); setAccessError(""); }} className="px-3 py-2 text-body hover:text-ink text-sm rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">O cliente usará o email <strong>{form.email_responsavel}</strong> e esta senha para entrar.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleReenviarConvite}
                disabled={accessLoading}
                className="flex items-center gap-2 px-4 py-2.5 border border-hairline rounded-md text-sm font-medium text-body hover:bg-surface-soft hover:text-ink disabled:opacity-50 transition-all"
              >
                {accessLoading && !showPasswordForm ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                Reenviar link de convite
              </button>
              <button
                onClick={() => { setShowPasswordForm(p => !p); setAccessError(""); setInviteLink(""); setAccessMessage(""); setNewPassword(""); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-hairline rounded-md text-sm font-medium text-body hover:bg-surface-soft hover:text-ink transition-all"
              >
                <KeyRound className="w-4 h-4" />
                {showPasswordForm ? "Cancelar senha" : "Definir senha inicial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pasta do Google Drive */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <div className="bg-canvas border border-hairline rounded-lg p-5 shadow-airbnb">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-md bg-surface-soft flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-rausch" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Pasta no Google Drive</h3>
              <p className="text-xs text-muted">Destino dos arquivos que o cliente enviar. Aparece como atalho na página de Arquivos do cliente.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <input
              value={driveUrl}
              onChange={e => setDriveUrl(e.target.value)}
              onBlur={handleSaveDrive}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1 input-field"
            />
            {driveSaving && <div className="px-4 py-2 flex items-center justify-center"><LoadingSpinner size="sm" /></div>}
            {driveUrl && (
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-hairline text-body rounded-md text-sm font-medium hover:bg-surface-soft transition-colors"
              >
                <FolderOpen className="w-4 h-4" /> Abrir
              </a>
            )}
          </div>
          {driveSaved && (
            <p className={`text-xs mt-2 ${driveSaved.startsWith("Erro") ? "text-danger-text" : "text-success-text"}`}>{driveSaved}</p>
          )}
        </div>
      </div>

      {(error || message) && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          {error && <div className="p-4 bg-danger-bg border border-danger-bg rounded-md text-sm text-danger-text">{error}</div>}
          {message && <div className="p-4 bg-success-bg border border-success/20 rounded-md text-sm text-success-text flex items-center gap-2"><Check className="w-4 h-4" />{message}</div>}
        </div>
      )}

      {!editMode && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-surface-soft border border-hairline rounded-md p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-rausch" />
            <p className="text-sm text-rausch">Modo de visualização. Clique em <strong>Editar</strong> para alterar os dados.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Steps */}
          <div className="lg:col-span-4">
            <div className="bg-canvas rounded-lg border shadow-airbnb p-4 sticky top-6">
              <div className="space-y-1">
                {STEPS.map((s) => {
                  const isActive = s.id === step;
                  const isCompleted = s.id < step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm transition-all ${isActive ? "bg-rausch text-white shadow-airbnb" : isCompleted ? "text-success-text hover:bg-success-bg" : "text-body hover:bg-surface-soft"}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? "bg-canvas text-rausch" : isCompleted ? "bg-success text-white" : "bg-surface-strong text-muted"}`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                      </div>
                      <span className="font-medium">{s.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <div className="bg-canvas rounded-lg border shadow-airbnb p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-md bg-surface-soft flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-rausch" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink">{STEPS[step - 1].label}</h2>
                </div>
              </div>

              <ClienteFormSteps
                step={step}
                form={form}
                editMode={editMode}
                isMaster={isMaster}
                update={update}
                toggleArray={toggleArray}
                addPersona={addPersona}
                removePersona={removePersona}
                updatePersona={updatePersona}
                setForm={setForm}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-body hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
                </button>
                {step < STEPS.length ? (
                  <button type="button" onClick={editMode ? goNextStep : () => setStep(s => Math.min(STEPS.length, s + 1))} className="flex items-center gap-2 px-8 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active transition-all shadow-airbnb">
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-sm text-muted-soft">Última etapa</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra fixa inferior para Salvar (Sticky UX) */}
      {editMode && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-card border-t border-hairline z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center animate-in slide-in-from-bottom-5">
          <div className="w-full max-w-7xl flex items-center justify-between px-6">
            <span className="text-sm font-medium text-muted hidden md:block">Modo de edição ativo. Não esqueça de salvar.</span>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button onClick={() => { setEditMode(false); setMessage(""); setError(""); }} className="btn-ghost justify-center">
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-success text-white rounded-md text-sm font-medium hover:bg-success-text shadow-sm disabled:opacity-50 transition-colors">
                {saving ? <LoadingSpinner size="sm" inverted /> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
