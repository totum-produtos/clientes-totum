"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Check, ChevronRight, Save, AlertCircle, Copy } from "lucide-react";
import { STEPS, DEFAULT_FORM_STATE, FormState } from "@/lib/cliente-form-constants";
import { ClienteFormSteps, validateStep } from "@/components/ClienteFormSteps";
import { useClienteForm } from "@/hooks/useClienteForm";

type InviteInfo = {
  email: string;
  nome_pre: string | null;
  draft_data: Partial<FormState>;
  current_step: number;
  expires_at: string;
};

type FinishResult = {
  success: boolean;
  email: string;
  password_fallback?: string;
  email_sent: boolean;
};

export default function OnboardingPage() {
  const params = useParams();
  const token = params.token as string;

  const [phase, setPhase] = useState<"loading" | "form" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [stepError, setStepError] = useState("");

  const { form, setForm, update, toggleArray, addPersona, removePersona, updatePersona } = useClienteForm();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  // 1) Carrega convite
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/onboarding/${token}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setErrorMsg(data.error || "Convite inválido");
          setErrorCode(data.code || null);
          setPhase("error");
          return;
        }
        const inv = data.invite as InviteInfo;
        setForm({
          ...DEFAULT_FORM_STATE,
          ...inv.draft_data,
          email_responsavel: (inv.draft_data?.email_responsavel as string) || inv.email,
          nome: (inv.draft_data?.nome as string) || inv.nome_pre || "",
        });
        setStep(Math.min(STEPS.length, Math.max(1, inv.current_step || 1)));
        initialized.current = true;
        setPhase("form");
      } catch {
        if (!cancelled) {
          setErrorMsg("Falha ao carregar convite");
          setPhase("error");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token, setForm]);

  // 2) Auto-save (debounced)
  useEffect(() => {
    if (!initialized.current || phase !== "form") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch(`/api/onboarding/${token}/salvar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft_data: form, current_step: step }),
        });
        if (res.ok) setSavedAt(new Date());
      } catch { /* ignora silenciosamente */ }
      finally { setSaving(false); }
    }, 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form, step, token, phase]);

  const goNext = () => {
    const { ok, missing } = validateStep(step, form);
    if (!ok) {
      setStepError(`Preencha os campos obrigatórios: ${missing.join(", ")}.`);
      return;
    }
    setStepError("");
    setStep(s => Math.min(STEPS.length, s + 1));
  };

  const handleSubmit = async () => {
    // valida só as etapas com campos obrigatórios (steps 1..5 e 8 — as
    // demais são pintadas pelo time Totum depois)
    for (const s of [1, 2, 3, 4, 5, 8]) {
      const { ok, missing } = validateStep(s, form);
      if (!ok) {
        setStep(s);
        setStepError(`Etapa ${s}: preencha os campos obrigatórios: ${missing.join(", ")}.`);
        return;
      }
    }
    setStepError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/${token}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_data: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStepError(data.error || "Falha ao finalizar cadastro");
        return;
      }
      setResult(data as FinishResult);
      setPhase("done");
    } catch (err) {
      setStepError(err instanceof Error ? err.message : "Erro ao finalizar");
    } finally {
      setSubmitting(false);
    }
  };

  const copiarSenha = async () => {
    if (!result?.password_fallback) return;
    await navigator.clipboard.writeText(result.password_fallback);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const StepIcon = STEPS[step - 1].icon;
  const progressPct = useMemo(() => Math.round((step / STEPS.length) * 100), [step]);

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === "error") {
    const headline = errorCode === "expired"
      ? "Este link expirou"
      : errorCode === "used"
      ? "Este convite já foi utilizado"
      : "Não foi possível abrir o convite";
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-canvas rounded-lg border shadow-airbnb p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-danger-bg mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-danger-text" />
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">{headline}</h1>
          <p className="text-sm text-body">{errorMsg}</p>
          <p className="text-xs text-muted mt-4">Entre em contato com o time Totum para receber um novo link.</p>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-canvas rounded-lg border shadow-airbnb p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center">
              <Check className="w-8 h-8 text-success-text" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink text-center mb-2">Pronto! Cadastro finalizado.</h1>
          <p className="text-sm text-body text-center mb-6">
            {result.email_sent
              ? `Enviamos suas credenciais para ${result.email}. Pode fechar essa janela.`
              : "Suas credenciais de acesso estão abaixo. Guarde com você."}
          </p>
          {result.password_fallback && (
            <div className="bg-warning-bg border border-warning-bg rounded-md p-4 mb-6">
              <p className="text-xs uppercase tracking-wide text-warning-text font-semibold mb-2">Senha temporária</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-canvas border border-hairline rounded px-3 py-2 text-sm font-mono text-ink">{result.password_fallback}</code>
                <button onClick={copiarSenha} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-rausch text-white text-xs font-medium hover:bg-rausch-active">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="text-xs text-warning-text mt-2">Você será solicitado a trocar a senha no primeiro acesso.</p>
            </div>
          )}
          <a href="/auth/login" className="block w-full text-center px-6 py-3 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active">
            Acessar minha conta
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      <div className="bg-canvas border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Briefing inicial · Totum</h1>
            <p className="text-xs text-muted mt-0.5 uppercase tracking-wide">Etapa {step} de {STEPS.length}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            {saving ? (
              <span className="flex items-center gap-1.5"><Save className="w-3.5 h-3.5 animate-pulse" /> Salvando…</span>
            ) : savedAt ? (
              <span className="flex items-center gap-1.5 text-success-text"><Check className="w-3.5 h-3.5" /> Salvo automaticamente</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-canvas rounded-lg border shadow-airbnb p-4 sticky top-6">
              <div className="space-y-1">
                {STEPS.map(s => {
                  const isActive = s.id === step;
                  const isCompleted = s.id < step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setStepError(""); setStep(s.id); }}
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
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                  <span>Progresso</span>
                  <span className="font-medium">{progressPct}%</span>
                </div>
                <div className="h-2 bg-surface-strong rounded-full overflow-hidden">
                  <div className="h-full bg-rausch rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-muted mt-3">Você pode fechar e voltar mais tarde — o progresso fica salvo neste link por 7 dias.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-canvas rounded-lg border shadow-airbnb p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-md bg-surface-soft flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-rausch" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink">{STEPS[step - 1].label}</h2>
                  <p className="text-sm text-muted">Preencha o que souber. Você pode revisar depois.</p>
                </div>
              </div>

              {stepError && (
                <div className="mb-6 p-4 bg-danger-bg border border-danger-bg rounded-md text-sm text-danger-text">{stepError}</div>
              )}

              <ClienteFormSteps
                step={step}
                form={form}
                editMode={true}
                isMaster={false}
                update={update}
                toggleArray={toggleArray}
                addPersona={addPersona}
                removePersona={removePersona}
                updatePersona={updatePersona}
                setForm={setForm}
              />

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button type="button" onClick={() => { setStepError(""); setStep(s => Math.max(1, s - 1)); }} disabled={step === 1} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-body hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
                </button>
                {step < STEPS.length ? (
                  <button type="button" onClick={goNext} className="flex items-center gap-2 px-8 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active transition-all shadow-airbnb">
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active disabled:opacity-50 transition-all shadow-airbnb">
                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Finalizar cadastro</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
