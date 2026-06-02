"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Copy, Link2 } from "lucide-react";
import { STEPS } from "@/lib/cliente-form-constants";
import { useClienteForm } from "@/hooks/useClienteForm";
import { ClienteFormSteps, validateStep } from "@/components/ClienteFormSteps";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function NovoClientePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { form, setForm, update, toggleArray, addPersona, removePersona, updatePersona, resetForm } = useClienteForm();

  const StepIcon = STEPS[step - 1].icon;

  const goNext = () => {
    const { ok, missing } = validateStep(step, form);
    if (!ok) {
      setError(`Preencha os campos obrigatórios: ${missing.join(", ")}.`);
      return;
    }
    setError("");
    setStep(s => Math.min(STEPS.length, s + 1));
  };

  const handleSubmit = async () => {
    for (let s = 1; s <= STEPS.length; s++) {
      const { ok, missing } = validateStep(s, form);
      if (!ok) {
        setStep(s);
        setError(`Etapa ${s}: preencha os campos obrigatórios: ${missing.join(", ")}.`);
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/clientes/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email_responsavel: form.email_responsavel,
          cnpj: form.cnpj,
          nome_responsavel: form.nome_responsavel,
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
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erro ao criar cliente");
      setWelcomeMessage(data.welcomeMessage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  };

  const copiarMensagem = async () => {
    if (!welcomeMessage) return;
    await navigator.clipboard.writeText(welcomeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (welcomeMessage) {
    return (
      <div className="min-h-screen bg-surface-soft pb-12 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-canvas rounded-lg border shadow-airbnb p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center">
              <Check className="w-8 h-8 text-success-text" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink text-center mb-2">Cliente criado com sucesso!</h1>
          <p className="text-sm text-body text-center mb-6">
            Copie a mensagem abaixo e envie ao cliente (WhatsApp, email, etc).
            Ela contém o login e a senha padrão de acesso.
          </p>
          <div className="bg-surface-soft border border-hairline rounded-md p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-rausch" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Mensagem de Boas-vindas</span>
              </div>
              <button
                onClick={copiarMensagem}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${copied ? "bg-success text-white" : "bg-rausch text-white hover:bg-rausch-active"}`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : "Copiar Texto"}
              </button>
            </div>
            <textarea
              readOnly
              value={welcomeMessage}
              className="w-full bg-canvas border border-hairline rounded-md px-3 py-3 text-sm text-ink resize-none h-40 focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/app/admin")}
              className="flex-1 px-6 py-3 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-all"
            >
              Ir para Painel Admin
            </button>
            <button
              onClick={() => { setWelcomeMessage(null); setStep(1); resetForm(); }}
              className="px-6 py-3 border border-hairline text-body rounded-md text-sm font-medium hover:bg-surface-soft transition-all"
            >
              Criar outro cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      <div className="bg-canvas border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">NOVO CLIENTE</h1>
            <p className="text-xs text-muted mt-0.5 uppercase tracking-wide">Preencha os dados do novo cliente</p>
          </div>
          <div className="text-sm text-muted">
            Etapa <span className="font-semibold text-rausch">{step}</span> de {STEPS.length}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
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
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                  <span>Progresso</span>
                  <span className="font-medium">{Math.round((step / STEPS.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-surface-strong rounded-full overflow-hidden">
                  <div className="h-full bg-rausch rounded-full transition-all duration-500" style={{ width: `${(step / STEPS.length) * 100}%` }} />
                </div>
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
                  <p className="text-sm text-muted">
                    {["Comece com os dados principais","Nos ajude a entender o cliente","Quem são seus clientes ideais?","Aparência da marca","Últimos detalhes operacionais","Defina as personas do cliente","Estrutura do Círculo Dourado","Defina a essência da marca","Proposta Única de Valor"][step - 1]}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-danger-bg border border-danger-bg rounded-md text-sm text-danger-text">{error}</div>
              )}

              <ClienteFormSteps
                step={step}
                form={form}
                editMode={true}
                update={update}
                toggleArray={toggleArray}
                addPersona={addPersona}
                removePersona={removePersona}
                updatePersona={updatePersona}
                setForm={setForm}
              />

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-body hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
                </button>
                {step < STEPS.length ? (
                  <button type="button" onClick={goNext} className="flex items-center gap-2 px-8 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active transition-all shadow-airbnb">
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active disabled:opacity-50 transition-all shadow-airbnb">
                    {loading ? <LoadingSpinner size="sm" inverted /> : <><Check className="w-4 h-4" /> Finalizar cadastro</>}
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
