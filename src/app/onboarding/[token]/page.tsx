"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Check, AlertCircle, Copy, ArrowLeft, ArrowRight } from "lucide-react";
import { STEPS, DEFAULT_FORM_STATE, FormState } from "@/lib/cliente-form-constants";
import { ClienteFormSteps, validateStep } from "@/components/ClienteFormSteps";
import { useClienteForm } from "@/hooks/useClienteForm";

// Descrições editoriais por etapa — voz curta, profissional, calorosa.
const STEP_INTROS: Record<number, string> = {
  1: "Os essenciais sobre a empresa. CNPJ, contato, segmento — o que precisamos pra abrir sua ficha.",
  2: "Como o negócio gera receita. Modelo, diferencial, produtos âncora, ticket atual.",
  3: "O destino. Que objetivo de marketing você persegue, e como vamos saber que chegamos lá.",
  4: "Pra quem vamos falar. O perfil do cliente ideal, dor, base de contatos.",
  5: "O cenário. Concorrência, referências de comunicação, canais que já funcionam.",
  6: "O motor de vendas. Processo, CRM, equipe, CAC.",
  7: "Identidade visual. Cores, fontes e o que a marca evoca quando alguém vê.",
  8: "Operação. Canais de atendimento, SLA, horário, dias úteis.",
  9: "Personas. Quem é essa pessoa que sua marca conversa — nome, idade, dores, sonhos.",
  10: "Círculo Dourado de Sinek. Por quê. O quê. Como. Esta seção é trabalhada com você depois.",
  11: "Marca. Tom, missão, visão, valores, personalidade.",
  12: "PUV — Proposta Única de Valor. A frase que separa a sua empresa de qualquer outra.",
};

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
      } catch { /* silencioso */ }
      finally { setSaving(false); }
    }, 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form, step, token, phase]);

  const goNext = () => {
    const { ok, missing } = validateStep(step, form);
    if (!ok) {
      setStepError(`Faltam preencher: ${missing.join(", ")}.`);
      return;
    }
    setStepError("");
    setStep(s => Math.min(STEPS.length, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStepError("");
    setStep(s => Math.max(1, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (s: number) => {
    setStepError("");
    setStep(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    for (const s of [1, 2, 3, 4, 5, 8]) {
      const { ok, missing } = validateStep(s, form);
      if (!ok) {
        setStep(s);
        setStepError(`Etapa ${s}: faltam preencher: ${missing.join(", ")}.`);
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

  const progressPct = useMemo(() => Math.round((step / STEPS.length) * 100), [step]);
  const savedLabel = useMemo(() => {
    if (saving) return "Salvando…";
    if (!savedAt) return "";
    return `Salvo · ${savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }, [saving, savedAt]);

  /* ---------- LOADING ---------- */
  if (phase === "loading") {
    return (
      <div className="editorial-canvas min-h-screen flex items-center justify-center">
        <div className="relative z-10 text-center">
          <span className="editorial-eyebrow text-rausch animate-pulse">Preparando seu briefing</span>
        </div>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (phase === "error") {
    const headline = errorCode === "expired"
      ? "Este link expirou."
      : errorCode === "used"
      ? "Este convite já foi utilizado."
      : "Não conseguimos abrir este link.";
    return (
      <div className="editorial-canvas min-h-screen flex items-center justify-center px-6">
        <div className="relative z-10 max-w-xl">
          <span className="editorial-eyebrow text-rausch">Convite indisponível</span>
          <h1 className="editorial-headline text-6xl md:text-7xl mt-5">{headline}</h1>
          <p className="mt-6 text-base text-ink/65 font-light leading-relaxed">{errorMsg}</p>
          <p className="mt-12 text-xs font-mono uppercase tracking-[0.22em] text-ink/40">
            Entre em contato com o seu ponto de contato na Totum para receber um novo link.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- DONE ---------- */
  if (phase === "done" && result) {
    return (
      <div className="editorial-canvas min-h-screen flex items-center justify-center px-6 py-16">
        <div className="relative z-10 max-w-2xl w-full">
          <span className="editorial-eyebrow text-rausch">Cadastro concluído</span>
          <h1 className="editorial-headline text-6xl md:text-8xl mt-5">Pronto.</h1>
          <p className="mt-8 text-lg text-ink/70 font-light leading-relaxed max-w-xl">
            {result.email_sent
              ? `Enviamos suas credenciais para `
              : "Suas credenciais de acesso estão abaixo. Anote em um lugar seguro."}
            {result.email_sent && <span className="text-ink">{result.email}</span>}
            {result.email_sent && "."}
          </p>

          {result.password_fallback && (
            <div className="mt-12 border border-ink/12 bg-white/70 backdrop-blur-sm rounded-md p-6">
              <span className="editorial-eyebrow text-ink/50">Senha temporária</span>
              <div className="mt-4 flex items-center gap-3">
                <code className="flex-1 font-mono text-base text-ink tracking-tight">
                  {result.password_fallback}
                </code>
                <button
                  type="button"
                  onClick={copiarSenha}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono uppercase tracking-[0.18em] transition-colors ${
                    copied ? "bg-success text-white" : "bg-ink text-white hover:bg-rausch"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="mt-4 text-xs text-ink/55 font-light">
                Você será solicitado a trocar a senha no primeiro acesso.
              </p>
            </div>
          )}

          <div className="mt-14 flex items-center gap-6">
            <a href="/auth/login" className="editorial-cta">
              Acessar minha conta <span className="arrow">→</span>
            </a>
            <span className="hidden md:inline editorial-eyebrow text-ink/40">
              Você já pode fechar esta janela
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- FORM (wizard editorial) ---------- */
  const currentStepIntro = STEP_INTROS[step] || "Preencha o que souber. Você pode revisar depois.";

  return (
    <div className="editorial-canvas min-h-screen flex flex-col">
      {/* TOP RAIL */}
      <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur-md text-white border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Image
              src="/logo.png"
              alt="Totum"
              width={88}
              height={28}
              priority
              className="h-7 w-auto brightness-0 invert"
            />
            <span className="hidden md:block font-mono text-[10px] tracking-[0.32em] uppercase text-white/45">
              Briefing inicial
            </span>
          </div>

          <div className="flex items-center gap-6">
            {savedLabel && (
              <span
                className={`hidden sm:flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase ${
                  saving ? "text-white/55" : "text-white/75"
                }`}
              >
                {saving ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-rausch animate-pulse" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                {savedLabel}
              </span>
            )}
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/75">
              <span className="text-white/45">Etapa</span>{" "}
              {String(step).padStart(2, "0")}
              <span className="text-white/45">{" / "}{String(STEPS.length).padStart(2, "0")}</span>
            </span>
          </div>
        </div>

        {/* Linha de progresso (1px, vermelha) */}
        <div className="editorial-progress">
          <span style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex-1">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid grid-cols-12 gap-8 md:gap-12">

            {/* LEFT RAIL — índice editorial */}
            <aside className="hidden lg:block col-span-3 sticky top-32 self-start">
              <span className="editorial-eyebrow text-rausch block mb-6">
                Briefing — 12 capítulos
              </span>
              <ol className="space-y-0.5">
                {STEPS.map((s) => {
                  const active = s.id === step;
                  const done = s.id < step;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => goToStep(s.id)}
                        className={`group w-full flex items-baseline gap-4 py-2.5 pl-4 -ml-px border-l text-left transition-all ${
                          active
                            ? "border-rausch"
                            : done
                            ? "border-ink/15 hover:border-ink/40"
                            : "border-ink/8 hover:border-ink/30"
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] tracking-[0.1em] shrink-0 w-5 ${
                            active ? "text-rausch font-semibold" : done ? "text-ink/45" : "text-ink/30"
                          }`}
                        >
                          {String(s.id).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display text-[15px] leading-snug transition-colors ${
                            active
                              ? "text-ink font-medium"
                              : done
                              ? "text-ink/60 group-hover:text-ink"
                              : "text-ink/40 group-hover:text-ink/80"
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-10 pt-6 border-t border-ink/10">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-ink/40 leading-relaxed">
                  Auto-save ativo
                  <br />
                  Suas respostas ficam neste link por 7 dias
                </p>
              </div>
            </aside>

            {/* CONTENT */}
            <section className="col-span-12 lg:col-span-9">
              <div className="max-w-2xl">
                {/* HERO da etapa */}
                <div className="mb-12 md:mb-16">
                  <span className="editorial-eyebrow text-rausch">
                    Etapa {String(step).padStart(2, "0")} de{" "}
                    {String(STEPS.length).padStart(2, "0")}
                  </span>
                  <h1 className="editorial-headline text-[44px] sm:text-6xl md:text-7xl mt-5">
                    {STEPS[step - 1].label}
                    <span className="text-rausch">.</span>
                  </h1>
                  <p className="mt-7 text-lg text-ink/65 font-light leading-relaxed max-w-lg">
                    {currentStepIntro}
                  </p>
                </div>

                {/* ERROR */}
                {stepError && (
                  <div className="mb-10 flex items-start gap-3 p-5 rounded-md border border-rausch/25 bg-rausch/[0.04]">
                    <AlertCircle className="w-4 h-4 text-rausch mt-0.5 shrink-0" />
                    <p className="text-sm text-rausch/90 leading-relaxed">{stepError}</p>
                  </div>
                )}

                {/* FORM (reaproveita ClienteFormSteps com tema editorial) */}
                <div className="editorial-form">
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
                </div>

                {/* NAV */}
                <div className="mt-16 pt-8 border-t border-ink/10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 1}
                    className="editorial-ghost"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                  </button>

                  {step < STEPS.length ? (
                    <button type="button" onClick={goNext} className="editorial-cta">
                      Próxima etapa
                      <span className="arrow">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="editorial-cta"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Finalizando
                        </>
                      ) : (
                        <>
                          Finalizar briefing
                          <span className="arrow">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Footer mobile */}
                <p className="lg:hidden mt-12 text-[11px] font-mono uppercase tracking-[0.22em] text-ink/40 leading-relaxed">
                  Auto-save ativo
                  <br />
                  Suas respostas ficam neste link por 7 dias
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile step selector flutuante */}
      <div className="lg:hidden sticky bottom-0 z-30 bg-ink/95 backdrop-blur border-t border-white/10">
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto">
          {STEPS.map((s) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] tracking-[0.15em] uppercase transition-all ${
                  active
                    ? "bg-rausch text-white"
                    : done
                    ? "bg-white/10 text-white/80"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {String(s.id).padStart(2, "0")}
                {active ? " · " + s.label.split(" ")[0] : ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

