"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Briefcase, Target, Palette, Phone, Check, ChevronRight,
  User, Globe, Mail, Type, Paintbrush, Eye, Clock, Calendar,
  MessageSquare, Hash, Users, CircleDot, Award, Star, Upload,
  FolderOpen, AlertCircle, X, Plus, Trash2, Copy, Link2
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Informações da Empresa", icon: Building2 },
  { id: 2, label: "Sobre o Negócio", icon: Briefcase },
  { id: 3, label: "Público-Alvo", icon: Target },
  { id: 4, label: "Identidade Visual", icon: Palette },
  { id: 5, label: "Operação e Contatos", icon: Phone },
  { id: 6, label: "Persona", icon: Users },
  { id: 7, label: "Círculo Dourado", icon: CircleDot },
  { id: 8, label: "Características da Marca", icon: Star },
  { id: 9, label: "PUV", icon: Award },
];

const RAMOS = ["Saúde", "Tecnologia", "Educação", "E-commerce", "Serviços", "Outros"];
const TEMPOS_MERCADO = ["Menos de 1 ano", "1-3 anos", "3-5 anos", "5+ anos"];
const TAMANHOS = ["Startup", "PME", "Grande empresa"];
const FATURAMENTOS = ["Até R$ 10k", "R$ 10k-50k", "R$ 50k-200k", "R$ 200k-1M", "R$ 1M+"];
const GENEROS = ["Masculino", "Feminino", "Ambos"];
const TONS_VOZ = ["Formal", "Descontraído", "Técnico", "Inspirador", "Humorístico"];
const CANAIS = ["WhatsApp", "Email", "Telefone", "Chat", "Redes Sociais"];
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const SLAS = ["1h", "4h", "24h", "48h"];
const CLASSES_SOCIAIS = ["A", "B", "C", "D", "E"];

export default function NovoClientePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: "", cnpj: "", nome_responsavel: "", email_responsavel: "", telefone: "", site: "",
    ramo_atuacao: "", tempo_mercado: "", descricao_negocio: "", produtos_servicos: "",
    tamanho_empresa: "", faturamento_mensal: "",
    nicho_principal: "", dores_principais: "", desejos_objetivos: "",
    faixa_etaria: [18, 65], genero_alvo: "", localizacao_alvo: "",
    classe_social: [] as string[], tom_voz: "",
    cor_primaria: "rausch", cor_secundaria: "#1a1a2e", fontes: "",
    key_visual_desc: "", key_visual_images: [] as string[],
    personalidade_visual: "",
    canais_atendimento: [] as string[], crm_utilizado: "", sla_resposta: "",
    horario_inicio: "08:00", horario_fim: "18:00", dias_atendimento: [] as string[],
    informacoes_adicionais: "",
    personas: [{ nome: "", idade: "", ocupacao: "", objetivos: "", dores: "" }],
    circulo_dourado: { porque: "", o_que: "", como: "" },
    caracteristicas_marca: { missao: "", visao: "", valores: "", personalidade: "" },
    puv: "",
  });

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const toggleArray = (field: string, value: string) => {
    setForm(f => {
      const arr = (f as any)[field] as string[];
      return { ...f, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const addPersona = () => setForm(f => ({ ...f, personas: [...f.personas, { nome: "", idade: "", ocupacao: "", objetivos: "", dores: "" }] }));
  const removePersona = (idx: number) => setForm(f => ({ ...f, personas: f.personas.filter((_, i) => i !== idx) }));
  const updatePersona = (idx: number, field: string, value: string) => {
    setForm(f => ({ ...f, personas: f.personas.map((p, i) => i === idx ? { ...p, [field]: value } : p) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, key_visual_images: [...f.key_visual_images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => setForm(f => ({ ...f, key_visual_images: f.key_visual_images.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/clientes/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email_responsavel: form.email_responsavel,
          cnpj: form.cnpj, nome_responsavel: form.nome_responsavel,
          telefone: form.telefone, site: form.site,
          cor_primaria: form.cor_primaria, cor_secundaria: form.cor_secundaria,
          ramo_atuacao: form.ramo_atuacao, tempo_mercado: form.tempo_mercado,
          descricao_negocio: form.descricao_negocio, produtos_servicos: form.produtos_servicos,
          tamanho_empresa: form.tamanho_empresa, faturamento_mensal: form.faturamento_mensal,
          profile_data: {
            nicho_principal: form.nicho_principal, dores_principais: form.dores_principais,
            desejos_objetivos: form.desejos_objetivos, faixa_etaria: form.faixa_etaria,
            genero_alvo: form.genero_alvo, localizacao_alvo: form.localizacao_alvo,
            classe_social: form.classe_social, tom_voz: form.tom_voz,
            fontes: form.fontes, key_visual_desc: form.key_visual_desc,
            key_visual_images: form.key_visual_images, personalidade_visual: form.personalidade_visual,
            canais_atendimento: form.canais_atendimento, crm_utilizado: form.crm_utilizado,
            sla_resposta: form.sla_resposta, horario_inicio: form.horario_inicio,
            horario_fim: form.horario_fim, dias_atendimento: form.dias_atendimento,
            informacoes_adicionais: form.informacoes_adicionais,
            personas: form.personas, circulo_dourado: form.circulo_dourado,
            caracteristicas_marca: form.caracteristicas_marca, puv: form.puv,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao criar cliente");
      }
      setInviteLink(data.inviteLink);
    } catch (err: any) { setError(err.message || "Erro ao criar cliente"); }
    finally { setLoading(false); }
  };

  const copiarLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const StepIcon = STEPS[step - 1].icon;

  if (inviteLink) {
    return (
      <div className="min-h-screen bg-surface-soft pb-12 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-canvas rounded-lg border shadow-airbnb p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center">
              <Check className="w-8 h-8 text-success-text" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink text-center mb-2">Cliente criado!</h1>
          <p className="text-sm text-body text-center mb-6">
            Copie o link abaixo e envie ao cliente (WhatsApp, email, etc).
            Ele será direcionado para criar a senha e preencher os dados da empresa.
          </p>

          <div className="bg-surface-soft border border-hairline rounded-md p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-rausch" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Link de convite</span>
            </div>
            <div className="flex items-stretch gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 bg-canvas border border-hairline rounded-md px-3 py-2 text-xs font-mono text-ink select-all"
              />
              <button
                onClick={copiarLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  copied ? "bg-success text-white" : "bg-rausch text-white hover:bg-rausch-active"
                }`}
              >
                {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
              </button>
            </div>
          </div>

          <div className="bg-warning-bg border border-warning-bg rounded-md p-4 mb-6 text-sm text-warning-text">
            <strong>Atenção:</strong> o link é de uso único. Após o cliente clicar e criar a senha, ele não funcionará mais.
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/app/admin")}
              className="flex-1 px-6 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active transition-all shadow-airbnb"
            >
              Ir para Admin
            </button>
            <button
              onClick={() => { setInviteLink(null); window.location.reload(); }}
              className="px-6 py-3 border border-hairline text-body rounded-full text-sm font-medium hover:bg-surface-soft transition-all"
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
      {/* Header */}
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
                      onClick={() => setStep(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm transition-all ${
                        isActive
                          ? "bg-rausch text-white shadow-airbnb"
                          : isCompleted
                          ? "text-success-text hover:bg-success-bg"
                          : "text-body hover:bg-surface-soft"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isActive ? "bg-canvas text-rausch" : isCompleted ? "bg-success text-white" : "bg-surface-strong text-muted"
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                      </div>
                      <span className="font-medium">{s.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>

              {/* Progress */}
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
                    {step === 1 && "Comece com os dados principais"}
                    {step === 2 && "Nos ajude a entender o cliente"}
                    {step === 3 && "Quem são seus clientes ideais?"}
                    {step === 4 && "Aparência da marca"}
                    {step === 5 && "Últimos detalhes operacionais"}
                    {step === 6 && "Defina as personas do cliente"}
                    {step === 7 && "Estrutura do Círculo Dourado"}
                    {step === 8 && "Defina a essência da marca"}
                    {step === 9 && "Proposta Única de Valor"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-danger-bg border border-danger-bg rounded-md text-sm text-danger-text">{error}</div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Nome da empresa"><input value={form.nome} onChange={e => update("nome", e.target.value)} placeholder="Ex: Totum Digital" className="input-field" /></Field>
                    <Field label="CNPJ"><input value={form.cnpj} onChange={e => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00" className="input-field" /></Field>
                  </div>
                  <Field label="Nome do responsável"><input value={form.nome_responsavel} onChange={e => update("nome_responsavel", e.target.value)} placeholder="Nome completo" className="input-field" /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Email corporativo"><input type="email" value={form.email_responsavel} onChange={e => update("email_responsavel", e.target.value)} placeholder="email@empresa.com" className="input-field" /></Field>
                    <Field label="Telefone"><input value={form.telefone} onChange={e => update("telefone", e.target.value)} placeholder="(00) 00000-0000" className="input-field" /></Field>
                  </div>
                  <Field label="Site"><input value={form.site} onChange={e => update("site", e.target.value)} placeholder="https://www.empresa.com" className="input-field" /></Field>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Ramo de atuação">
                      <select value={form.ramo_atuacao} onChange={e => update("ramo_atuacao", e.target.value)} className="input-field">
                        <option value="">Selecione</option>{RAMOS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Field>
                    <Field label="Tempo de mercado">
                      <select value={form.tempo_mercado} onChange={e => update("tempo_mercado", e.target.value)} className="input-field">
                        <option value="">Selecione</option>{TEMPOS_MERCADO.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Descrição do negócio"><textarea value={form.descricao_negocio} onChange={e => update("descricao_negocio", e.target.value)} placeholder="O que a empresa faz?" rows={3} className="input-field resize-none" /></Field>
                  <Field label="Produtos/Serviços oferecidos"><textarea value={form.produtos_servicos} onChange={e => update("produtos_servicos", e.target.value)} placeholder="Liste os principais produtos ou serviços" rows={3} className="input-field resize-none" /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Tamanho da empresa">
                      <select value={form.tamanho_empresa} onChange={e => update("tamanho_empresa", e.target.value)} className="input-field">
                        <option value="">Selecione</option>{TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Faturamento mensal">
                      <select value={form.faturamento_mensal} onChange={e => update("faturamento_mensal", e.target.value)} className="input-field">
                        <option value="">Selecione</option>{FATURAMENTOS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <Field label="Nicho principal"><input value={form.nicho_principal} onChange={e => update("nicho_principal", e.target.value)} placeholder="Ex: Mães de primeira viagem" className="input-field" /></Field>
                  <Field label="Dores principais"><textarea value={form.dores_principais} onChange={e => update("dores_principais", e.target.value)} placeholder="Liste 3-5 dores do público" rows={3} className="input-field resize-none" /></Field>
                  <Field label="Desejos/Objetivos"><textarea value={form.desejos_objetivos} onChange={e => update("desejos_objetivos", e.target.value)} placeholder="O que o público deseja alcançar?" rows={3} className="input-field resize-none" /></Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Gênero">
                      <select value={form.genero_alvo} onChange={e => update("genero_alvo", e.target.value)} className="input-field">
                        <option value="">Selecione</option>{GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </Field>
                    <Field label="Localização"><input value={form.localizacao_alvo} onChange={e => update("localizacao_alvo", e.target.value)} placeholder="Ex: Brasil" className="input-field" /></Field>
                    <Field label="Classe social">
                      <div className="flex flex-wrap gap-2">
                        {CLASSES_SOCIAIS.map(c => (
                          <button key={c} onClick={() => toggleArray("classe_social", c)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${form.classe_social.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body hover:bg-surface-strong"}`}>{c}</button>
                        ))}
                      </div>
                    </Field>
                  </div>
                  <Field label="Tom de voz da marca">
                    <select value={form.tom_voz} onChange={e => update("tom_voz", e.target.value)} className="input-field">
                      <option value="">Selecione</option>{TONS_VOZ.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Cor primária">
                      <div className="flex items-center gap-3">
                        <input type="color" value={form.cor_primaria} onChange={e => update("cor_primaria", e.target.value)} className="w-12 h-12 rounded-none border cursor-pointer" />
                        <input value={form.cor_primaria} onChange={e => update("cor_primaria", e.target.value)} className="input-field font-mono uppercase" />
                      </div>
                    </Field>
                    <Field label="Cor secundária">
                      <div className="flex items-center gap-3">
                        <input type="color" value={form.cor_secundaria} onChange={e => update("cor_secundaria", e.target.value)} className="w-12 h-12 rounded-none border cursor-pointer" />
                        <input value={form.cor_secundaria} onChange={e => update("cor_secundaria", e.target.value)} className="input-field font-mono uppercase" />
                      </div>
                    </Field>
                  </div>
                  <Field label="Fontes utilizadas"><input value={form.fontes} onChange={e => update("fontes", e.target.value)} placeholder="Ex: Inter, Montserrat" className="input-field" /></Field>

                  {/* Aviso upload */}
                  <div className="bg-warning-bg border border-warning-bg rounded-md p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning-text shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-warning-text">Faça o upload dos arquivos na página "Arquivos do Cliente"</p>
                      <p className="text-xs text-warning-text mt-1">Após criar o cliente, acesse a aba "Arquivos do Cliente" para enviar o logo e todos os materiais de comunicação/marketing.</p>
                    </div>
                  </div>

                  <Field label="Key visual / Elementos gráficos">
                    <textarea value={form.key_visual_desc} onChange={e => update("key_visual_desc", e.target.value)} placeholder="Descreva os elementos visuais principais" rows={3} className="input-field resize-none" />
                  </Field>

                  {/* Upload de imagens Key Visual */}
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Imagens do Key Visual</label>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-hairline rounded-md text-sm text-muted hover:border-rausch hover:text-rausch transition-colors w-full justify-center">
                      <Upload className="w-4 h-4" /> Clique para fazer upload de imagens
                    </button>
                    {form.key_visual_images.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {form.key_visual_images.map((img, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border group">
                            <img src={img} alt={`key visual ${i}`} className="w-full h-full object-cover" />
                            <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Field label="Personalidade visual"><textarea value={form.personalidade_visual} onChange={e => update("personalidade_visual", e.target.value)} placeholder="Como a marca deve ser percebida visualmente?" rows={3} className="input-field resize-none" /></Field>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Canais de atendimento</label>
                    <div className="flex flex-wrap gap-2">{CANAIS.map(c => (
                      <button key={c} onClick={() => toggleArray("canais_atendimento", c)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${form.canais_atendimento.includes(c) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body hover:bg-surface-strong"}`}>{c}</button>
                    ))}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="CRM utilizado">
                      <select value={form.crm_utilizado} onChange={e => update("crm_utilizado", e.target.value)} className="input-field">
                        <option value="">Selecione</option>
                        <option value="uPixel">uPixel</option>
                        <option value="HubSpot">HubSpot</option>
                        <option value="Pipedrive">Pipedrive</option>
                        <option value="Salesforce">Salesforce</option>
                        <option value="RD Station">RD Station</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </Field>
                    <Field label="SLA de resposta">
                      <select value={form.sla_resposta} onChange={e => update("sla_resposta", e.target.value)} className="input-field">
                        <option value="">Selecione</option>{SLAS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Horário início"><input type="time" value={form.horario_inicio} onChange={e => update("horario_inicio", e.target.value)} className="input-field" /></Field>
                    <Field label="Horário fim"><input type="time" value={form.horario_fim} onChange={e => update("horario_fim", e.target.value)} className="input-field" /></Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Dias de atendimento</label>
                    <div className="flex flex-wrap gap-2">{DIAS.map(d => (
                      <button key={d} onClick={() => toggleArray("dias_atendimento", d)} className={`w-12 h-12 rounded-md text-sm font-medium transition-all ${form.dias_atendimento.includes(d) ? "bg-rausch text-white shadow" : "bg-surface-strong text-body hover:bg-surface-strong"}`}>{d}</button>
                    ))}</div>
                  </div>
                  <Field label="Informações adicionais"><textarea value={form.informacoes_adicionais} onChange={e => update("informacoes_adicionais", e.target.value)} placeholder="Algo mais que devamos saber?" rows={3} className="input-field resize-none" /></Field>
                </div>
              )}

              {/* STEP 6: Persona */}
              {step === 6 && (
                <div className="space-y-6">
                  {form.personas.map((persona, idx) => (
                    <div key={idx} className="border rounded-md p-5 space-y-4 relative">
                      {form.personas.length > 1 && (
                        <button onClick={() => removePersona(idx)} className="absolute top-3 right-3 p-1.5 text-danger-text hover:bg-danger-bg rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <h4 className="text-sm font-semibold text-ink">Persona {idx + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nome"><input value={persona.nome} onChange={e => updatePersona(idx, "nome", e.target.value)} placeholder="Ex: Ana, a empresária" className="input-field" /></Field>
                        <Field label="Idade"><input value={persona.idade} onChange={e => updatePersona(idx, "idade", e.target.value)} placeholder="Ex: 32 anos" className="input-field" /></Field>
                      </div>
                      <Field label="Ocupação"><input value={persona.ocupacao} onChange={e => updatePersona(idx, "ocupacao", e.target.value)} placeholder="Ex: Empresária, mãe, freelancer" className="input-field" /></Field>
                      <Field label="Objetivos"><textarea value={persona.objetivos} onChange={e => updatePersona(idx, "objetivos", e.target.value)} placeholder="O que essa persona quer alcançar?" rows={2} className="input-field resize-none" /></Field>
                      <Field label="Dores"><textarea value={persona.dores} onChange={e => updatePersona(idx, "dores", e.target.value)} placeholder="Quais são as principais dores?" rows={2} className="input-field resize-none" /></Field>
                    </div>
                  ))}
                  <button onClick={addPersona} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-hairline rounded-md text-sm text-muted hover:border-rausch hover:text-rausch transition-colors w-full justify-center">
                    <Plus className="w-4 h-4" /> Adicionar outra persona
                  </button>
                </div>
              )}

              {/* STEP 7: Círculo Dourado */}
              {step === 7 && (
                <div className="space-y-5">
                  <div className="bg-danger-bg border border-danger-bg rounded-md p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-danger text-white flex items-center justify-center text-sm font-bold">P</div>
                      <h4 className="font-semibold text-danger-text">Porquê</h4>
                    </div>
                    <p className="text-xs text-danger-text mb-2">Propósito, causa, crença — por que a empresa existe?</p>
                    <textarea value={form.circulo_dourado.porque} onChange={e => setForm(f => ({ ...f, circulo_dourado: { ...f.circulo_dourado, porque: e.target.value } }))} placeholder="Ex: Acreditamos que toda empresa merece comunicação de qualidade..." rows={3} className="input-field resize-none bg-canvas" />
                  </div>
                  <div className="bg-surface-soft border border-hairline rounded-md p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-surface-soft text-ink flex items-center justify-center text-sm font-bold">Q</div>
                      <h4 className="font-semibold text-rausch">O que</h4>
                    </div>
                    <p className="text-xs text-rausch mb-2">Produto, serviço, resultado — o que a empresa oferece?</p>
                    <textarea value={form.circulo_dourado.o_que} onChange={e => setForm(f => ({ ...f, circulo_dourado: { ...f.circulo_dourado, o_que: e.target.value } }))} placeholder="Ex: Criamos estratégias de marketing digital..." rows={3} className="input-field resize-none bg-canvas" />
                  </div>
                  <div className="bg-success-bg border border-success/20 rounded-md p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center text-sm font-bold">C</div>
                      <h4 className="font-semibold text-success-text">Como</h4>
                    </div>
                    <p className="text-xs text-success-text mb-2">Processo, diferencial, método — como a empresa entrega?</p>
                    <textarea value={form.circulo_dourado.como} onChange={e => setForm(f => ({ ...f, circulo_dourado: { ...f.circulo_dourado, como: e.target.value } }))} placeholder="Ex: Através de uma metodologia própria..." rows={3} className="input-field resize-none bg-canvas" />
                  </div>
                </div>
              )}

              {/* STEP 8: Características da Marca */}
              {step === 8 && (
                <div className="space-y-5">
                  <Field label="Missão"><textarea value={form.caracteristicas_marca.missao} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, missao: e.target.value } }))} placeholder="Qual é a missão da marca?" rows={3} className="input-field resize-none" /></Field>
                  <Field label="Visão"><textarea value={form.caracteristicas_marca.visao} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, visao: e.target.value } }))} placeholder="Qual é a visão de futuro?" rows={3} className="input-field resize-none" /></Field>
                  <Field label="Valores"><textarea value={form.caracteristicas_marca.valores} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, valores: e.target.value } }))} placeholder="Quais são os valores principais?" rows={3} className="input-field resize-none" /></Field>
                  <Field label="Personalidade da marca"><textarea value={form.caracteristicas_marca.personalidade} onChange={e => setForm(f => ({ ...f, caracteristicas_marca: { ...f.caracteristicas_marca, personalidade: e.target.value } }))} placeholder="Se a marca fosse uma pessoa, como ela seria?" rows={3} className="input-field resize-none" /></Field>
                </div>
              )}

              {/* STEP 9: PUV */}
              {step === 9 && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-rausch/5 to-rausch/5 border border-hairline rounded-md p-6">
                    <h4 className="font-semibold text-ink mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-rausch" />
                      Proposta Única de Valor (PUV)
                    </h4>
                    <p className="text-sm text-body mb-4">O que torna esse cliente único? Por que alguém deveria escolhê-lo?</p>
                    <textarea value={form.puv} onChange={e => update("puv", e.target.value)} placeholder="Ex: Somos o único estúdio de design que combina estratégia de marca com execução em 48h..." rows={5} className="input-field resize-none bg-canvas" />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-body hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
                </button>
                {step < STEPS.length ? (
                  <button onClick={() => setStep(s => Math.min(STEPS.length, s + 1))} className="flex items-center gap-2 px-8 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active transition-all shadow-airbnb shadow-airbnb">
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-rausch text-white rounded-full text-sm font-medium hover:bg-rausch-active disabled:opacity-50 transition-all shadow-airbnb shadow-airbnb">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Finalizar cadastro</>}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      {children}
    </div>
  );
}
