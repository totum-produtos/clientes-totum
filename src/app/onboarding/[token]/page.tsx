"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Check, AlertCircle, Copy, ArrowLeft, ArrowRight, Eye, EyeOff, Play, ShieldCheck } from "lucide-react";
import { STEPS, DEFAULT_FORM_STATE, FormState } from "@/lib/cliente-form-constants";
import { ClienteFormSteps, validateStep } from "@/components/ClienteFormSteps";
import { useClienteForm } from "@/hooks/useClienteForm";

// Descrições editoriais por etapa — voz curta, profissional, calorosa.
const STEP_INTROS: Record<number, string> = {
  1: "Vamos começar pelo básico para entendermos quem é sua empresa e como podemos entrar em contato.",
  2: "Precisamos entender como sua empresa ganha dinheiro hoje e quais resultados deseja alcançar.",
  3: "Queremos entender onde sua empresa está hoje e onde deseja chegar.",
  4: "Quanto melhor entendermos seu público, melhores serão as campanhas.",
  5: "Precisamos entender como sua empresa se posiciona e como seus clientes chegam até você.",
  6: "Aqui identificamos onde as vendas podem estar escapando.",
  7: "Fechamos com atendimento, observações e materiais visuais que podem acelerar a personalização.",
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

  const [phase, setPhase] = useState<"loading" | "intro" | "form" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setPhase("intro");
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
    for (const s of STEPS.map((item) => item.id)) {
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
          <span className="editorial-eyebrow text-rausch animate-pulse">Preparando seu onboarding</span>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="totum-red-canvas min-h-screen flex flex-col">
        <header className="px-6 md:px-10 py-6">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <Image src="/logo.png" alt="Totum" width={120} height={40} priority className="h-10 w-auto brightness-0 invert" />
            <div className="hidden sm:flex items-center gap-2 text-sm text-white-soft">
              <ShieldCheck className="h-4 w-4 text-success" />
              Link seguro e exclusivo
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center px-6 md:px-10 pb-12">
          <section className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div>
              <p className="totum-kicker">Briefing inicial Totum</p>
              <h1 className="totum-display mt-5">Bem-vindo à Totum</h1>
              <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white-soft">
                Vamos personalizar sua estratégia de marketing digital a partir das informações mais importantes do seu negócio.
              </p>
              <div className="mt-10 rounded-lg border border-border-strong bg-navy-card p-5 shadow-brand">
                <div className="flex items-start gap-4">
                  <button type="button" aria-label="Reproduzir mensagem" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rausch text-white shadow-red">
                    <Play className="h-5 w-5 fill-current" />
                  </button>
                  <div>
                    <p className="text-white">
                      Esse passo é o mais importante. As informações que você fornecer definirão se sua estratégia será <strong>100% personalizada</strong>. Reserve <strong>5 minutos</strong> para responder com atenção.
                    </p>
                    <p className="mt-3 text-sm text-muted-soft">Áudio guiado preparado para a versão com mídia. Enquanto isso, a transcrição fica visível aqui.</p>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setPhase("form")} className="totum-button-primary mt-10">
                Começar onboarding <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-lg border border-border-strong bg-navy-card p-6 shadow-brand">
              <p className="totum-kicker">O que acontece depois</p>
              <ul className="mt-6 space-y-4 text-white-soft">
                {[
                  "Você responde o briefing inicial em blocos rápidos.",
                  "A Totum analisa o material e constrói Persona, Círculo Dourado, PUV e Marca.",
                  "Ao finalizar, sua conta na Central do Cliente é criada automaticamente.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
        <div className="h-1 bg-gradient-to-r from-rausch to-rausch-light" />
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
      <div className="totum-red-canvas min-h-screen flex items-center justify-center px-6">
        <div className="relative z-10 max-w-xl">
          <span className="totum-kicker">Convite indisponível</span>
          <h1 className="totum-heading mt-5">{headline}</h1>
          <p className="mt-6 text-base text-white-soft leading-relaxed">{errorMsg}</p>
          <p className="mt-12 text-xs uppercase tracking-[0.22em] text-muted-soft">
            Entre em contato com o seu ponto de contato na Totum para receber um novo link.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- DONE ---------- */
  if (phase === "done" && result) {
    return (
      <div className="totum-red-canvas min-h-screen flex items-center justify-center px-6 py-16">
        <div className="relative z-10 max-w-2xl w-full">
          <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-success text-white">
            <Check className="h-8 w-8" />
          </div>
          <span className="totum-kicker">Cadastro concluído</span>
          <h1 className="totum-heading mt-5">Parabéns! Seu onboarding foi concluído com sucesso.</h1>
          <p className="mt-8 text-lg text-white-soft leading-relaxed max-w-xl">
            {result.email_sent
              ? `Enviamos suas credenciais para `
              : "Suas credenciais de acesso estão abaixo. Anote em um lugar seguro."}
            {result.email_sent && <span className="text-white">{result.email}</span>}
            {result.email_sent && "."}
          </p>

          <div className="mt-8 grid gap-3 rounded-lg border border-border-strong bg-navy-card p-5 text-sm text-white-soft">
            {["Persona", "Círculo Dourado", "PUV", "Características da Marca"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                <span>{item} será construído pela equipe Totum a partir do seu briefing.</span>
              </div>
            ))}
          </div>

          {result.password_fallback && (
            <div className="mt-8 border border-border-strong bg-navy-card rounded-md p-6">
              <span className="totum-kicker">Senha temporária</span>
              <div className="mt-4 flex items-center gap-3">
                <code className="flex-1 font-mono text-base text-white tracking-tight">
                  {showPassword ? result.password_fallback : "••••••••••••"}
                </code>
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-rausch hover:text-white" aria-label={showPassword ? "Ocultar senha" : "Revelar senha"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={copiarSenha}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs uppercase tracking-[0.18em] transition-colors ${
                    copied ? "bg-success text-white" : "bg-rausch text-white hover:bg-rausch-light"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-soft">
                Você será solicitado a trocar a senha no primeiro acesso.
              </p>
            </div>
          )}

          <div className="mt-14 flex items-center gap-6">
            <a href="/auth/login" className="totum-button-primary">
              Acessar minha conta <ArrowRight className="h-4 w-4" />
            </a>
            <a href="mailto:contato@grupototum.com" className="text-sm font-medium text-totum-secondary hover:text-white">Preciso de ajuda</a>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- FORM (wizard editorial) ---------- */
  const currentStepIntro = STEP_INTROS[step] || "Preencha o que souber. Você pode revisar depois.";

  return (
    <div className="totum-red-canvas min-h-screen flex flex-col">
      {/* TOP RAIL */}
      <header className="sticky top-0 z-40 bg-navy-deep/95 backdrop-blur-md text-white border-b border-border-strong">
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
              Onboarding inicial
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
                Onboarding — 7 blocos
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
                            ? "border-white/20 hover:border-white/40"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] tracking-[0.1em] shrink-0 w-5 ${
                            active ? "text-rausch font-semibold" : done ? "text-white/55" : "text-white/35"
                          }`}
                        >
                          {String(s.id).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display text-[15px] leading-snug transition-colors ${
                            active
                              ? "text-white font-medium"
                              : done
                              ? "text-white/65 group-hover:text-white"
                              : "text-white/40 group-hover:text-white/80"
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-10 pt-6 border-t border-white/10">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-soft leading-relaxed">
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
                  <span className="totum-kicker">
                    Bloco {String(step).padStart(2, "0")} de{" "}
                    {String(STEPS.length).padStart(2, "0")}
                  </span>
                  <h1 className="totum-heading mt-5">
                    {STEPS[step - 1].label}
                    <span className="text-rausch">.</span>
                  </h1>
                  <p className="mt-7 text-lg text-white-soft leading-relaxed max-w-lg">
                    {currentStepIntro}
                  </p>
                </div>

                {/* ERROR */}
                {stepError && (
                  <div className="mb-10 flex items-start gap-3 p-5 rounded-md border border-danger/30 bg-danger/10">
                    <AlertCircle className="w-4 h-4 text-rausch mt-0.5 shrink-0" />
                    <p className="text-sm text-red-light leading-relaxed">{stepError}</p>
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
                <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 1}
                    className="totum-button-ghost"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                  </button>

                  {step < STEPS.length ? (
                    <button type="button" onClick={goNext} className="totum-button-primary">
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="totum-button-primary"
                    >
                      {submitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Finalizando
                        </>
                      ) : (
                        <>
                          Finalizar onboarding
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Footer mobile */}
                <p className="lg:hidden mt-12 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-soft leading-relaxed">
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
      <div className="lg:hidden sticky bottom-0 z-30 bg-navy-deep/95 backdrop-blur border-t border-white/10">
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
                    ? "bg-navy-card/10 text-white/80"
                    : "bg-navy-card/5 text-white/40"
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
