"use client";

import React, { useState, useEffect } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  Building2, Briefcase, Target, Palette, Phone, Users, CircleDot, Star, Award,
  Edit3, Save, X, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";

const SECTIONS = [
  { id: "empresa", label: "Informações da Empresa", icon: Building2 },
  { id: "negocio", label: "Sobre o Negócio", icon: Briefcase },
  { id: "publico", label: "Público-Alvo", icon: Target },
  { id: "identidade", label: "Identidade Visual", icon: Palette },
  { id: "operacao", label: "Operação e Contatos", icon: Phone },
  { id: "circulo", label: "Círculo Dourado", icon: CircleDot },
  { id: "marca", label: "Características da Marca", icon: Star },
  { id: "puv", label: "PUV", icon: Award },
];

export default function MinhasEmpresaPage() {
  const { user, client, loading: globalLoading, refreshData } = useGlobal();
  const [clientData, setClientData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["empresa"]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (client?.id) {
      loadClientData();
      loadPendingCount();
    }
  }, [client]);

  async function loadClientData() {
    const supabase = await createSPASassClient();
    const { data } = await supabase.getSupabaseClient()
      .from("portal_clients")
      .select("*")
      .eq("id", client!.id)
      .single();
    if (data) setClientData(data);
  }

  async function loadPendingCount() {
    const supabase = await createSPASassClient();
    const { count } = await supabase.getSupabaseClient()
      .from("client_profile_changes")
      .select("*", { count: "exact", head: true })
      .eq("portal_client_id", client!.id)
      .eq("status", "pendente");
    setPendingCount(count || 0);
  }

  const toggleSection = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmitChanges = async () => {
    if (!clientData || !user) return;
    setLoading(true); setMessage("");

    try {
      const supabase = await createSPASassClient();
      const client2 = supabase.getSupabaseClient();

      const fieldsToCheck = [
        "nome", "cnpj", "nome_responsavel", "email_responsavel", "telefone", "site",
        "ramo_atuacao", "tempo_mercado", "descricao_negocio", "produtos_servicos",
        "tamanho_empresa", "faturamento_mensal", "cor_primaria", "cor_secundaria"
      ];

      const profileFields = [
        "nicho_principal", "dores_principais", "desejos_objetivos", "genero_alvo",
        "localizacao_alvo", "classe_social", "tom_voz", "fontes", "key_visual_desc",
        "personalidade_visual", "canais_atendimento", "crm_utilizado", "sla_resposta",
        "horario_inicio", "horario_fim", "dias_atendimento", "informacoes_adicionais",
        "personas", "circulo_dourado", "caracteristicas_marca", "puv"
      ];

      let created = 0;

      for (const field of fieldsToCheck) {
        const oldVal = clientData[field] ?? "";
        const newVal = (clientData as any)[`_edit_${field}`] ?? oldVal;
        if (String(oldVal) !== String(newVal)) {
          await client2.from("client_profile_changes").insert({
            portal_client_id: client!.id,
            requested_by: user.id,
            field_path: field,
            old_value: String(oldVal),
            new_value: String(newVal),
            status: "pendente"
          });
          created++;
        }
      }

      const pd = clientData.profile_data || {};
      for (const field of profileFields) {
        const oldVal = pd[field] ?? "";
        const newVal = (clientData as any)[`_edit_${field}`] ?? oldVal;
        const oldStr = typeof oldVal === "object" ? JSON.stringify(oldVal) : String(oldVal);
        const newStr = typeof newVal === "object" ? JSON.stringify(newVal) : String(newVal);
        if (oldStr !== newStr) {
          await client2.from("client_profile_changes").insert({
            portal_client_id: client!.id,
            requested_by: user.id,
            field_path: `profile_data.${field}`,
            old_value: oldStr,
            new_value: newStr,
            status: "pendente"
          });
          created++;
        }
      }

      if (created > 0) {
        setMessage(`✅ ${created} alteração(ões) enviada(s) para aprovação.`);
        loadPendingCount();
        setEditMode(false);
        refreshData();
      } else {
        setMessage("Nenhuma alteração detectada.");
      }
    } catch (err: any) {
      setMessage("❌ Erro: " + (err.message || "Falha ao enviar alterações"));
    } finally {
      setLoading(false);
    }
  };

  const getValue = (field: string, defaultVal = "") => {
    if (!clientData) return defaultVal;
    if (editMode && (clientData as any)[`_edit_${field}`] !== undefined) {
      return (clientData as any)[`_edit_${field}`];
    }
    return clientData[field] ?? defaultVal;
  };

  const getProfileValue = (field: string, defaultVal: any = "") => {
    if (!clientData) return defaultVal;
    const pd = clientData.profile_data || {};
    if (editMode && (clientData as any)[`_edit_${field}`] !== undefined) {
      return (clientData as any)[`_edit_${field}`];
    }
    return pd[field] ?? defaultVal;
  };

  const setEditValue = (field: string, value: any) => {
    setClientData((prev: any) => ({ ...prev, [`_edit_${field}`]: value }));
  };

  if (globalLoading || !clientData) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      <div className="bg-canvas border-b">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-ink">MINHAS EMPRESA</h1>
              <p className="text-sm text-muted mt-1">Visualize e solicite alterações nos dados da sua empresa</p>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning-bg text-warning-text rounded-full text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" /> {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
                </span>
              )}
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors">
                  <Edit3 className="w-4 h-4" /> Editar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditMode(false); setMessage(""); }} className="flex items-center gap-2 px-4 py-2 text-body hover:text-ink rounded-md text-sm font-medium transition-colors">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button onClick={handleSubmitChanges} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-md text-sm font-medium hover:bg-success-text disabled:opacity-50 transition-colors">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Salvar alterações</>}
                  </button>
                </div>
              )}
            </div>
          </div>
          {message && (
            <div className={`mt-4 p-4 rounded-md text-sm flex items-center gap-2 ${message.startsWith("✅") ? "bg-success-bg text-success-text border border-success/20" : message.startsWith("❌") ? "bg-danger-bg text-danger-text border border-danger-bg" : "bg-surface-soft text-rausch border border-hairline"}`}>
              {message.startsWith("✅") ? <CheckCircle className="w-4 h-4" /> : message.startsWith("❌") ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {message.replace(/^[✅❌]\s*/, "")}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <Section id="empresa" label="Informações da Empresa" icon={Building2} expanded={expanded} toggle={toggleSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Field label="Nome da empresa" editMode={editMode} value={getValue("nome")} onChange={(v: string) => setEditValue("nome", v)} />
            <Field label="CNPJ" editMode={editMode} value={getValue("cnpj")} onChange={(v: string) => setEditValue("cnpj", v)} />
            <Field label="Nome do responsável" editMode={editMode} value={getValue("nome_responsavel")} onChange={(v: string) => setEditValue("nome_responsavel", v)} />
            <Field label="Email corporativo" editMode={editMode} value={getValue("email_responsavel")} onChange={(v: string) => setEditValue("email_responsavel", v)} />
            <Field label="Telefone" editMode={editMode} value={getValue("telefone")} onChange={(v: string) => setEditValue("telefone", v)} />
            <Field label="Site" editMode={editMode} value={getValue("site")} onChange={(v: string) => setEditValue("site", v)} />
          </div>
        </Section>

        <Section id="negocio" label="Sobre o Negócio" icon={Briefcase} expanded={expanded} toggle={toggleSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Field label="Ramo de atuação" editMode={editMode} value={getValue("ramo_atuacao")} onChange={(v: string) => setEditValue("ramo_atuacao", v)} />
            <Field label="Tempo de mercado" editMode={editMode} value={getValue("tempo_mercado")} onChange={(v: string) => setEditValue("tempo_mercado", v)} />
            <Field label="Tamanho da empresa" editMode={editMode} value={getValue("tamanho_empresa")} onChange={(v: string) => setEditValue("tamanho_empresa", v)} />
            <Field label="Faturamento mensal" editMode={editMode} value={getValue("faturamento_mensal")} onChange={(v: string) => setEditValue("faturamento_mensal", v)} />
          </div>
          <div className="mt-4 space-y-4">
            <TextArea label="Descrição do negócio" editMode={editMode} value={getValue("descricao_negocio")} onChange={(v: string) => setEditValue("descricao_negocio", v)} />
            <TextArea label="Produtos/Serviços oferecidos" editMode={editMode} value={getValue("produtos_servicos")} onChange={(v: string) => setEditValue("produtos_servicos", v)} />
          </div>
        </Section>

        <Section id="publico" label="Público-Alvo" icon={Target} expanded={expanded} toggle={toggleSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Field label="Nicho principal" editMode={editMode} value={getProfileValue("nicho_principal")} onChange={(v: string) => setEditValue("nicho_principal", v)} />
            <Field label="Gênero" editMode={editMode} value={getProfileValue("genero_alvo")} onChange={(v: string) => setEditValue("genero_alvo", v)} />
            <Field label="Localização" editMode={editMode} value={getProfileValue("localizacao_alvo")} onChange={(v: string) => setEditValue("localizacao_alvo", v)} />
            <Field label="Tom de voz" editMode={editMode} value={getProfileValue("tom_voz")} onChange={(v: string) => setEditValue("tom_voz", v)} />
          </div>
          <div className="mt-4 space-y-4">
            <TextArea label="Dores principais" editMode={editMode} value={getProfileValue("dores_principais")} onChange={(v: string) => setEditValue("dores_principais", v)} />
            <TextArea label="Desejos/Objetivos" editMode={editMode} value={getProfileValue("desejos_objetivos")} onChange={(v: string) => setEditValue("desejos_objetivos", v)} />
          </div>
        </Section>

        <Section id="identidade" label="Identidade Visual" icon={Palette} expanded={expanded} toggle={toggleSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <ColorField label="Cor primária" editMode={editMode} value={getValue("cor_primaria", "rausch")} onChange={(v: string) => setEditValue("cor_primaria", v)} readValue={clientData.cor_primaria} />
            <ColorField label="Cor secundária" editMode={editMode} value={getValue("cor_secundaria", "#1a1a2e")} onChange={(v: string) => setEditValue("cor_secundaria", v)} readValue={clientData.cor_secundaria} />
            <Field label="Fontes" editMode={editMode} value={getProfileValue("fontes")} onChange={(v: string) => setEditValue("fontes", v)} />
          </div>
          <div className="mt-4">
            <TextArea label="Personalidade visual" editMode={editMode} value={getProfileValue("personalidade_visual")} onChange={(v: string) => setEditValue("personalidade_visual", v)} />
          </div>
        </Section>

        <Section id="operacao" label="Operação e Contatos" icon={Phone} expanded={expanded} toggle={toggleSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Field label="CRM utilizado" editMode={editMode} value={getProfileValue("crm_utilizado")} onChange={(v: string) => setEditValue("crm_utilizado", v)} />
            <Field label="SLA de resposta" editMode={editMode} value={getProfileValue("sla_resposta")} onChange={(v: string) => setEditValue("sla_resposta", v)} />
            <Field label="Horário início" editMode={editMode} value={getProfileValue("horario_inicio")} onChange={(v: string) => setEditValue("horario_inicio", v)} />
            <Field label="Horário fim" editMode={editMode} value={getProfileValue("horario_fim")} onChange={(v: string) => setEditValue("horario_fim", v)} />
          </div>
          <div className="mt-4">
            <TextArea label="Informações adicionais" editMode={editMode} value={getProfileValue("informacoes_adicionais")} onChange={(v: string) => setEditValue("informacoes_adicionais", v)} />
          </div>
        </Section>

        <Section id="circulo" label="Círculo Dourado" icon={CircleDot} expanded={expanded} toggle={toggleSection}>
          <div className="space-y-4 pt-4">
            <TextArea label="Porquê" editMode={editMode} value={getProfileValue("circulo_dourado", {}).porque || ""} onChange={(v: string) => setEditValue("circulo_dourado", { ...(getProfileValue("circulo_dourado", {})), porque: v })} />
            <TextArea label="O que" editMode={editMode} value={getProfileValue("circulo_dourado", {}).o_que || ""} onChange={(v: string) => setEditValue("circulo_dourado", { ...(getProfileValue("circulo_dourado", {})), o_que: v })} />
            <TextArea label="Como" editMode={editMode} value={getProfileValue("circulo_dourado", {}).como || ""} onChange={(v: string) => setEditValue("circulo_dourado", { ...(getProfileValue("circulo_dourado", {})), como: v })} />
          </div>
        </Section>

        <Section id="marca" label="Características da Marca" icon={Star} expanded={expanded} toggle={toggleSection}>
          <div className="space-y-4 pt-4">
            <TextArea label="Missão" editMode={editMode} value={getProfileValue("caracteristicas_marca", {}).missao || ""} onChange={(v: string) => setEditValue("caracteristicas_marca", { ...(getProfileValue("caracteristicas_marca", {})), missao: v })} />
            <TextArea label="Visão" editMode={editMode} value={getProfileValue("caracteristicas_marca", {}).visao || ""} onChange={(v: string) => setEditValue("caracteristicas_marca", { ...(getProfileValue("caracteristicas_marca", {})), visao: v })} />
            <TextArea label="Valores" editMode={editMode} value={getProfileValue("caracteristicas_marca", {}).valores || ""} onChange={(v: string) => setEditValue("caracteristicas_marca", { ...(getProfileValue("caracteristicas_marca", {})), valores: v })} />
            <TextArea label="Personalidade da marca" editMode={editMode} value={getProfileValue("caracteristicas_marca", {}).personalidade || ""} onChange={(v: string) => setEditValue("caracteristicas_marca", { ...(getProfileValue("caracteristicas_marca", {})), personalidade: v })} />
          </div>
        </Section>

        <Section id="puv" label="Proposta Única de Valor (PUV)" icon={Award} expanded={expanded} toggle={toggleSection}>
          <div className="pt-4">
            <TextArea label="PUV" editMode={editMode} value={getProfileValue("puv")} onChange={(v: string) => setEditValue("puv", v)} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ id, label, icon: Icon, expanded, toggle, children }: any) {
  const isOpen = expanded.includes(id);
  return (
    <div className="bg-canvas rounded-lg border shadow-airbnb overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-soft transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-surface-soft flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-rausch" />
          </div>
          <h3 className="font-semibold text-ink">{label}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-soft" /> : <ChevronDown className="w-5 h-5 text-muted-soft" />}
      </button>
      {isOpen && <div className="px-6 pb-6 border-t">{children}</div>}
    </div>
  );
}

function Field({ label, editMode, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      {editMode ? (
        <input value={value || ""} onChange={e => onChange(e.target.value)} className="input-field" />
      ) : (
        <div className="px-4 py-3 bg-surface-soft rounded-md text-sm text-ink min-h-[44px] flex items-center">
          {value || <span className="text-muted-soft italic">—</span>}
        </div>
      )}
    </div>
  );
}

function TextArea({ label, editMode, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      {editMode ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={3} className="input-field resize-none" />
      ) : (
        <div className="px-4 py-3 bg-surface-soft rounded-md text-sm text-ink min-h-[80px]">
          {value || <span className="text-muted-soft italic">—</span>}
        </div>
      )}
    </div>
  );
}

function ColorField({ label, editMode, value, onChange, readValue }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      {editMode ? (
        <div className="flex items-center gap-3">
          <input type="color" value={value || "rausch"} onChange={e => onChange(e.target.value)} className="w-12 h-12 rounded-sm border cursor-pointer" />
          <input value={value || ""} onChange={e => onChange(e.target.value)} className="input-field font-mono" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: readValue || "rausch" }} />
          <span className="text-sm text-body font-mono">{readValue || "—"}</span>
        </div>
      )}
    </div>
  );
}
