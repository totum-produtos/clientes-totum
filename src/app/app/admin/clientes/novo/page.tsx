"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  Building2,
  Briefcase,
  Target,
  Palette,
  Phone,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Globe,
  Mail,
  Type,
  Paintbrush,
  Eye,
  Clock,
  Calendar,
  MessageSquare,
  Hash,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Informações da Empresa", icon: Building2 },
  { id: 2, label: "Sobre o Negócio", icon: Briefcase },
  { id: 3, label: "Público-Alvo", icon: Target },
  { id: 4, label: "Identidade Visual", icon: Palette },
  { id: 5, label: "Operação e Contatos", icon: Phone },
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

export default function NovoClientePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Etapa 1
    nome: "",
    cnpj: "",
    nome_responsavel: "",
    email_responsavel: "",
    telefone: "",
    site: "",
    // Etapa 2
    ramo_atuacao: "",
    tempo_mercado: "",
    descricao_negocio: "",
    produtos_servicos: "",
    tamanho_empresa: "",
    faturamento_mensal: "",
    // Etapa 3
    nicho_principal: "",
    dores_principais: "",
    desejos_objetivos: "",
    faixa_etaria: [18, 65],
    genero_alvo: "",
    localizacao_alvo: "",
    classe_social: "",
    tom_voz: "",
    // Etapa 4
    cor_primaria: "#d81220",
    cor_secundaria: "#1a1a2e",
    fontes: "",
    key_visual: "",
    personalidade_visual: "",
    // Etapa 5
    canais_atendimento: [] as string[],
    crm_utilizado: "",
    sla_resposta: "",
    horario_inicio: "08:00",
    horario_fim: "18:00",
    dias_atendimento: [] as string[],
    informacoes_adicionais: "",
  });

  const update = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleArray = (field: string, value: string) => {
    setForm((f) => {
      const arr = (f as any)[field] as string[];
      return { ...f, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const gerarSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = await createSPASassClient();
      const profileData = {
        nicho_principal: form.nicho_principal,
        dores_principais: form.dores_principais,
        desejos_objetivos: form.desejos_objetivos,
        faixa_etaria: form.faixa_etaria,
        genero_alvo: form.genero_alvo,
        localizacao_alvo: form.localizacao_alvo,
        classe_social: form.classe_social,
        tom_voz: form.tom_voz,
        fontes: form.fontes,
        key_visual: form.key_visual,
        personalidade_visual: form.personalidade_visual,
        canais_atendimento: form.canais_atendimento,
        crm_utilizado: form.crm_utilizado,
        sla_resposta: form.sla_resposta,
        horario_inicio: form.horario_inicio,
        horario_fim: form.horario_fim,
        dias_atendimento: form.dias_atendimento,
        informacoes_adicionais: form.informacoes_adicionais,
      };

      const { error: insertError } = await supabase.getSupabaseClient().from("portal_clients").insert({
        nome: form.nome,
        slug: gerarSlug(form.nome) || `cliente-${Date.now()}`,
        email_responsavel: form.email_responsavel,
        contato_principal: form.telefone,
        status: "ativo",
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
        profile_data: profileData,
      });

      if (insertError) throw insertError;
      router.push("/app/admin");
    } catch (err: any) {
      setError(err.message || "Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return form.nome && form.cnpj && form.nome_responsavel && form.email_responsavel && form.telefone;
    if (step === 2) return form.ramo_atuacao && form.descricao_negocio;
    if (step === 3) return form.nicho_principal;
    if (step === 4) return form.cor_primaria && form.cor_secundaria;
    if (step === 5) return true;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">NOVO CLIENTE</h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">Etapa {step} de 5</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => {
              const isActive = s.id === step;
              const isCompleted = s.id < step;
              return (
                <React.Fragment key={s.id}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#3b82f6] text-white shadow-md"
                        : isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? "bg-white text-[#3b82f6]"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                    </div>
                    <span className="hidden md:inline">{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 ${s.id < step ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border shadow-sm p-8">
              {/* Step title */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  {React.createElement(STEPS[step - 1].icon, { className: "w-5 h-5 text-[#3b82f6]" })}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{STEPS[step - 1].label}</h2>
                  <p className="text-sm text-gray-500">
                    {step === 1 && "Comece com os dados principais"}
                    {step === 2 && "Nos ajude a entender o cliente"}
                    {step === 3 && "Quem são seus clientes ideais?"}
                    {step === 4 && "Aparência da marca"}
                    {step === 5 && "Últimos detalhes"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Step 1: Informações da Empresa */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Nome da empresa *" icon={<Building2 className="w-4 h-4" />}>
                      <input
                        value={form.nome}
                        onChange={(e) => update("nome", e.target.value)}
                        placeholder="Ex: Totum Digital"
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                    <Field label="CNPJ *" icon={<Hash className="w-4 h-4" />}>
                      <input
                        value={form.cnpj}
                        onChange={(e) => update("cnpj", e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                  </div>
                  <Field label="Nome do responsável *" icon={<User className="w-4 h-4" />}>
                    <input
                      value={form.nome_responsavel}
                      onChange={(e) => update("nome_responsavel", e.target.value)}
                      placeholder="Nome completo"
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Email corporativo *" icon={<Mail className="w-4 h-4" />}>
                      <input
                        type="email"
                        value={form.email_responsavel}
                        onChange={(e) => update("email_responsavel", e.target.value)}
                        placeholder="email@empresa.com"
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                    <Field label="Telefone *" icon={<Phone className="w-4 h-4" />}>
                      <input
                        value={form.telefone}
                        onChange={(e) => update("telefone", e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                  </div>
                  <Field label="Site" icon={<Globe className="w-4 h-4" />}>
                    <input
                      value={form.site}
                      onChange={(e) => update("site", e.target.value)}
                      placeholder="https://www.empresa.com"
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    />
                  </Field>
                </div>
              )}

              {/* Step 2: Sobre o Negócio */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Ramo de atuação *" icon={<Briefcase className="w-4 h-4" />}>
                      <select
                        value={form.ramo_atuacao}
                        onChange={(e) => update("ramo_atuacao", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                      >
                        <option value="">Selecione</option>
                        {RAMOS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tempo de mercado" icon={<Clock className="w-4 h-4" />}>
                      <select
                        value={form.tempo_mercado}
                        onChange={(e) => update("tempo_mercado", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                      >
                        <option value="">Selecione</option>
                        {TEMPOS_MERCADO.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Descrição do negócio *" icon={<Type className="w-4 h-4" />}>
                    <textarea
                      value={form.descricao_negocio}
                      onChange={(e) => update("descricao_negocio", e.target.value)}
                      placeholder="O que a empresa faz?"
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </Field>
                  <Field label="Produtos/Serviços oferecidos" icon={<Briefcase className="w-4 h-4" />}>
                    <textarea
                      value={form.produtos_servicos}
                      onChange={(e) => update("produtos_servicos", e.target.value)}
                      placeholder="Liste os principais produtos ou serviços"
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Tamanho da empresa" icon={<Building2 className="w-4 h-4" />}>
                      <select
                        value={form.tamanho_empresa}
                        onChange={(e) => update("tamanho_empresa", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                      >
                        <option value="">Selecione</option>
                        {TAMANHOS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Faturamento mensal" icon={<Hash className="w-4 h-4" />}>
                      <select
                        value={form.faturamento_mensal}
                        onChange={(e) => update("faturamento_mensal", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                      >
                        <option value="">Selecione</option>
                        {FATURAMENTOS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {/* Step 3: Público-Alvo */}
              {step === 3 && (
                <div className="space-y-5">
                  <Field label="Nicho principal *" icon={<Target className="w-4 h-4" />}>
                    <input
                      value={form.nicho_principal}
                      onChange={(e) => update("nicho_principal", e.target.value)}
                      placeholder="Ex: Mães de primeira viagem"
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    />
                  </Field>
                  <Field label="Dores principais" icon={<Type className="w-4 h-4" />}>
                    <textarea
                      value={form.dores_principais}
                      onChange={(e) => update("dores_principais", e.target.value)}
                      placeholder="Liste 3-5 dores do público"
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </Field>
                  <Field label="Desejos/Objetivos" icon={<Type className="w-4 h-4" />}>
                    <textarea
                      value={form.desejos_objetivos}
                      onChange={(e) => update("desejos_objetivos", e.target.value)}
                      placeholder="O que o público deseja alcançar?"
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Gênero" icon={<User className="w-4 h-4" />}>
                      <select
                        value={form.genero_alvo}
                        onChange={(e) => update("genero_alvo", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                      >
                        <option value="">Selecione</option>
                        {GENEROS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Localização" icon={<Globe className="w-4 h-4" />}>
                      <input
                        value={form.localizacao_alvo}
                        onChange={(e) => update("localizacao_alvo", e.target.value)}
                        placeholder="Ex: Brasil"
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                    <Field label="Classe social" icon={<Hash className="w-4 h-4" />}>
                      <select
                        value={form.classe_social}
                        onChange={(e) => update("classe_social", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                      >
                        <option value="">Selecione</option>
                        <option value="A/B">A/B</option>
                        <option value="B/C">B/C</option>
                        <option value="C/D">C/D</option>
                        <option value="D/E">D/E</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Tom de voz da marca" icon={<MessageSquare className="w-4 h-4" />}>
                    <select
                      value={form.tom_voz}
                      onChange={(e) => update("tom_voz", e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                    >
                      <option value="">Selecione</option>
                      {TONS_VOZ.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              {/* Step 4: Identidade Visual */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Cor primária" icon={<Paintbrush className="w-4 h-4" />}>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.cor_primaria}
                          onChange={(e) => update("cor_primaria", e.target.value)}
                          className="w-12 h-12 rounded-xl border cursor-pointer"
                        />
                        <input
                          value={form.cor_primaria}
                          onChange={(e) => update("cor_primaria", e.target.value)}
                          className="flex-1 px-4 py-3 border rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                        />
                      </div>
                    </Field>
                    <Field label="Cor secundária" icon={<Paintbrush className="w-4 h-4" />}>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.cor_secundaria}
                          onChange={(e) => update("cor_secundaria", e.target.value)}
                          className="w-12 h-12 rounded-xl border cursor-pointer"
                        />
                        <input
                          value={form.cor_secundaria}
                          onChange={(e) => update("cor_secundaria", e.target.value)}
                          className="flex-1 px-4 py-3 border rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                        />
                      </div>
                    </Field>
                  </div>
                  <Field label="Fontes utilizadas" icon={<Type className="w-4 h-4" />}>
                    <input
                      value={form.fontes}
                      onChange={(e) => update("fontes", e.target.value)}
                      placeholder="Ex: Inter, Montserrat"
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                    />
                  </Field>
                  <Field label="Key visual / Elementos gráficos" icon={<Eye className="w-4 h-4" />}>
                    <textarea
                      value={form.key_visual}
                      onChange={(e) => update("key_visual", e.target.value)}
                      placeholder="Descreva os elementos visuais"
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </Field>
                  <Field label="Personalidade visual" icon={<Palette className="w-4 h-4" />}>
                    <textarea
                      value={form.personalidade_visual}
                      onChange={(e) => update("personalidade_visual", e.target.value)}
                      placeholder="Como a marca deve ser percebida visualmente?"
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </Field>
                </div>
              )}

              {/* Step 5: Operação e Contatos */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Canais de atendimento</label>
                    <div className="flex flex-wrap gap-2">
                      {CANAIS.map((c) => (
                        <button
                          key={c}
                          onClick={() => toggleArray("canais_atendimento", c)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            form.canais_atendimento.includes(c)
                              ? "bg-[#3b82f6] text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="CRM utilizado" icon={<Briefcase className="w-4 h-4" />}>
                      <input
                        value={form.crm_utilizado}
                        onChange={(e) => update("crm_utilizado", e.target.value)}
                        placeholder="Ex: HubSpot, Pipedrive"
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                    <Field label="SLA de resposta" icon={<Clock className="w-4 h-4" />}>
                      <select
                        value={form.sla_resposta}
                        onChange={(e) => update("sla_resposta", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all bg-white"
                      >
                        <option value="">Selecione</option>
                        {SLAS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Horário início" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="time"
                        value={form.horario_inicio}
                        onChange={(e) => update("horario_inicio", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                    <Field label="Horário fim" icon={<Clock className="w-4 h-4" />}>
                      <input
                        type="time"
                        value={form.horario_fim}
                        onChange={(e) => update("horario_fim", e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
                      />
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dias de atendimento</label>
                    <div className="flex flex-wrap gap-2">
                      {DIAS.map((d) => (
                        <button
                          key={d}
                          onClick={() => toggleArray("dias_atendimento", d)}
                          className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${
                            form.dias_atendimento.includes(d)
                              ? "bg-[#3b82f6] text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field label="Informações adicionais" icon={<Type className="w-4 h-4" />}>
                    <textarea
                      value={form.informacoes_adicionais}
                      onChange={(e) => update("informacoes_adicionais", e.target.value)}
                      placeholder="Algo mais que devamos saber?"
                      rows={3}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all resize-none"
                    />
                  </Field>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(5, s + 1))}
                    disabled={!isStepValid()}
                    className="flex items-center gap-2 px-8 py-3 bg-[#3b82f6] text-white rounded-full text-sm font-medium hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#3b82f6] text-white rounded-full text-sm font-medium hover:bg-[#2563eb] disabled:opacity-50 transition-all shadow-md shadow-blue-200"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Finalizar cadastro
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Preview do Cliente</h3>
              <div className="flex flex-col items-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
                  style={{ backgroundColor: form.cor_primaria || "#d81220" }}
                >
                  {form.nome ? form.nome.charAt(0).toUpperCase() : "?"}
                </div>
                <h4 className="text-base font-semibold text-gray-900 text-center">
                  {form.nome || "Nome da Empresa"}
                </h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 mt-2">
                  Criando...
                </span>

                {/* Color dots */}
                <div className="flex items-center gap-2 mt-4">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: form.cor_primaria || "#d81220" }}
                    title="Cor primária"
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: form.cor_secundaria || "#1a1a2e" }}
                    title="Cor secundária"
                  />
                </div>

                {/* Progress */}
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Etapa {step} de 5</span>
                    <span>{Math.round((step / 5) * 100)}%</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= step ? "bg-[#3b82f6]" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Mini info */}
                {form.ramo_atuacao && (
                  <div className="w-full mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Ramo</span>
                      <span className="font-medium text-gray-700">{form.ramo_atuacao}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Tamanho</span>
                      <span className="font-medium text-gray-700">{form.tamanho_empresa || "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Responsável</span>
                      <span className="font-medium text-gray-700">{form.nome_responsavel || "—"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
