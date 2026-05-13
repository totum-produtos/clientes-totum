"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  Building2, Briefcase, Target, Palette, Phone, Users, CircleDot, Star, Award,
  Edit3, Save, X, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  ShoppingCart, Megaphone, Globe, TrendingUp, Sparkles, Flag, Link2, FolderUp, Lock
} from "lucide-react";

// Tipo de campo do briefing
type FieldType = "text" | "textarea" | "select" | "file-link";
type FieldSource = "column" | "profile";

type BriefingField = {
  key: string;
  label: string;
  type: FieldType;
  source: FieldSource;
  options?: string[];
  hint?: string;
};

type BriefingSection = {
  id: string;
  label: string;
  icon: any;
  lockedForClient?: boolean; // só admin/master editam; cliente apenas visualiza
  fields: BriefingField[];
};

// Schema do briefing
const SECTIONS: BriefingSection[] = [
  {
    id: "empresa",
    label: "Informações da Empresa",
    icon: Building2,
    fields: [
      { key: "nome", label: "Nome da empresa", type: "text", source: "column" },
      { key: "ramo_atuacao", label: "Segmento da empresa", type: "text", source: "column" },
      { key: "regiao_atuacao", label: "Região de atuação", type: "text", source: "profile" },
      { key: "tempo_mercado", label: "Há quanto tempo a empresa existe?", type: "text", source: "column" },
      { key: "cnpj", label: "CNPJ", type: "text", source: "column" },
      { key: "nome_responsavel", label: "Nome do responsável", type: "text", source: "column" },
      { key: "email_responsavel", label: "Email corporativo", type: "text", source: "column" },
      { key: "telefone", label: "Telefone", type: "text", source: "column" },
    ],
  },
  {
    id: "negocio",
    label: "Sobre o Negócio",
    icon: Briefcase,
    fields: [
      { key: "produtos_servicos", label: "Qual o principal produto ou serviço?", type: "textarea", source: "column" },
      { key: "ticket_medio", label: "Qual o ticket médio?", type: "text", source: "profile" },
      { key: "clientes_mes", label: "Quantos clientes atende por mês?", type: "text", source: "profile" },
      { key: "faturamento_mensal", label: "Qual o faturamento médio mensal?", type: "text", source: "column" },
      { key: "meta_crescimento", label: "Qual a meta de crescimento atual?", type: "textarea", source: "profile" },
      { key: "descricao_negocio", label: "Descrição do negócio", type: "textarea", source: "column" },
      { key: "tamanho_empresa", label: "Tamanho da empresa", type: "text", source: "column" },
    ],
  },
  {
    id: "publico",
    label: "Público-Alvo",
    icon: Target,
    fields: [
      { key: "cliente_ideal", label: "Quem é o cliente ideal hoje?", type: "textarea", source: "profile" },
      { key: "cliente_mais_lucro", label: "Qual tipo de cliente mais gera lucro?", type: "textarea", source: "profile" },
      { key: "nicho_prioritario", label: "Existe um nicho específico prioritário?", type: "textarea", source: "profile" },
      { key: "dores_principais", label: "Qual é a principal dor do cliente?", type: "textarea", source: "profile" },
      { key: "gatilhos_compra", label: "O que normalmente faz o cliente comprar?", type: "textarea", source: "profile" },
      { key: "objecoes_comuns", label: "Quais objeções mais aparecem?", type: "textarea", source: "profile" },
      { key: "genero_alvo", label: "Gênero predominante", type: "text", source: "profile" },
      { key: "localizacao_alvo", label: "Localização", type: "text", source: "profile" },
      { key: "classe_social", label: "Classe social", type: "text", source: "profile" },
    ],
  },
  {
    id: "persona",
    label: "Persona (construída pela Totum)",
    icon: Users,
    lockedForClient: true,
    fields: [
      { key: "persona_nome", label: "Nome da persona", type: "text", source: "profile" },
      { key: "persona_idade", label: "Faixa etária", type: "text", source: "profile" },
      { key: "persona_profissao", label: "Profissão / cargo", type: "text", source: "profile" },
      { key: "persona_rotina", label: "Rotina e hábitos", type: "textarea", source: "profile" },
      { key: "persona_dores", label: "Dores específicas", type: "textarea", source: "profile" },
      { key: "persona_motivacoes", label: "Motivações e desejos", type: "textarea", source: "profile" },
      { key: "persona_canais", label: "Canais que frequenta", type: "textarea", source: "profile" },
      { key: "persona_objecoes", label: "Objeções e medos", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "comercial",
    label: "Processo Comercial",
    icon: ShoppingCart,
    fields: [
      { key: "como_chegam_clientes", label: "Como os clientes chegam hoje?", type: "textarea", source: "profile" },
      { key: "canais_aquisicao", label: "Quais canais geram mais clientes?", type: "textarea", source: "profile" },
      { key: "equipe_comercial", label: "Existe equipe comercial? Quantas pessoas?", type: "text", source: "profile" },
      { key: "followup_processo", label: "Existe processo de follow-up?", type: "textarea", source: "profile" },
      { key: "crm_utilizado", label: "Existe CRM atualmente? Qual?", type: "text", source: "profile" },
      { key: "atendimento_inicial", label: "Como funciona o atendimento inicial?", type: "textarea", source: "profile" },
      { key: "tempo_resposta_lead", label: "Quanto tempo o lead demora para receber resposta?", type: "text", source: "profile" },
      { key: "fecha_primeira_conversa", label: "O cliente fecha na primeira conversa?", type: "select", source: "profile", options: ["Sim", "Às vezes", "Não"] },
    ],
  },
  {
    id: "marketing",
    label: "Marketing Atual",
    icon: Megaphone,
    fields: [
      { key: "tem_trafego_pago", label: "A empresa roda tráfego pago atualmente?", type: "select", source: "profile", options: ["Sim", "Não", "Já rodou"] },
      { key: "investimento_ads", label: "Qual valor médio investido em anúncios?", type: "text", source: "profile" },
      { key: "redes_sociais_usadas", label: "Quais redes sociais utiliza?", type: "textarea", source: "profile" },
      { key: "calendario_conteudo", label: "Existe calendário de conteúdo?", type: "select", source: "profile", options: ["Sim", "Parcial", "Não"] },
      { key: "producao_videos", label: "Existe produção de vídeos?", type: "select", source: "profile", options: ["Sim", "Eventualmente", "Não"] },
      { key: "trabalhou_agencia", label: "Já trabalhou com agência antes?", type: "textarea", source: "profile" },
      { key: "funcionou_nao_funcionou", label: "O que funcionou e o que não funcionou?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "digital",
    label: "Estrutura Digital",
    icon: Globe,
    fields: [
      { key: "site", label: "Possui site? (URL)", type: "text", source: "column" },
      { key: "possui_landing_pages", label: "Possui landing pages?", type: "textarea", source: "profile" },
      { key: "whatsapp_comercial", label: "Possui WhatsApp comercial? (número)", type: "text", source: "profile" },
      { key: "automacoes", label: "Possui automações?", type: "textarea", source: "profile" },
      { key: "email_marketing", label: "Usa e-mail marketing? Qual ferramenta?", type: "text", source: "profile" },
      { key: "google_meu_negocio", label: "Possui Google Meu Negócio otimizado?", type: "select", source: "profile", options: ["Sim, otimizado", "Sim, sem otimização", "Não"] },
      { key: "integracoes_sistemas", label: "Existem integrações entre sistemas?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "objetivos",
    label: "Objetivos e Dores",
    icon: TrendingUp,
    fields: [
      { key: "principal_dificuldade", label: "Qual a principal dificuldade hoje?", type: "textarea", source: "profile" },
      { key: "trava_crescimento", label: "O que mais trava o crescimento?", type: "textarea", source: "profile" },
      { key: "cenario_ideal_12m", label: "Qual seria o cenário ideal nos próximos 12 meses?", type: "textarea", source: "profile" },
      { key: "prioridade_melhoria", label: "O que gostaria de melhorar primeiro?", type: "textarea", source: "profile" },
      { key: "maior_desperdicio", label: "Qual o maior desperdício atual da empresa?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "operacional",
    label: "Estrutura Operacional",
    icon: Users,
    fields: [
      { key: "pessoas_operacao", label: "Quantas pessoas existem na operação?", type: "text", source: "profile" },
      { key: "tomadores_decisao", label: "Quem toma as decisões?", type: "textarea", source: "profile" },
      { key: "equipe_atendimento", label: "Existe equipe de atendimento?", type: "text", source: "profile" },
      { key: "equipe_vendas", label: "Existe equipe de vendas?", type: "text", source: "profile" },
      { key: "equipe_marketing", label: "Existe equipe de marketing?", type: "text", source: "profile" },
      { key: "comunicacao_interna", label: "Como funciona a comunicação interna?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "diferenciais",
    label: "Diferenciais e Posicionamento",
    icon: Sparkles,
    fields: [
      { key: "diferencial_empresa", label: "O que faz sua empresa ser diferente?", type: "textarea", source: "profile" },
      { key: "porque_escolhem", label: "Por que um cliente escolhe vocês?", type: "textarea", source: "profile" },
      { key: "diferencial_competitivo", label: "Qual é o maior diferencial competitivo?", type: "textarea", source: "profile" },
      { key: "concorrentes_referencia", label: "Quais concorrentes você considera referência?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "expectativas",
    label: "Expectativas do Projeto",
    icon: Flag,
    fields: [
      { key: "expectativa_totum", label: "O que espera da Totum?", type: "textarea", source: "profile" },
      { key: "otimo_resultado", label: "Qual seria um ótimo resultado para você?", type: "textarea", source: "profile" },
      { key: "prazo_meta", label: "Existe prazo ou meta importante?", type: "textarea", source: "profile" },
      { key: "prioridade_imediata", label: "Existe alguma prioridade imediata?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "acessos",
    label: "Acessos e Materiais",
    icon: Link2,
    fields: [
      { key: "link_instagram", label: "Instagram", type: "text", source: "profile", hint: "URL do perfil" },
      { key: "link_facebook", label: "Facebook", type: "text", source: "profile", hint: "URL da página" },
      { key: "link_gmb", label: "Google Meu Negócio", type: "text", source: "profile", hint: "URL do perfil" },
      { key: "link_site", label: "Site", type: "text", source: "profile", hint: "URL principal" },
      { key: "conta_anuncios", label: "Conta de anúncios (Meta/Google Ads)", type: "textarea", source: "profile", hint: "IDs ou e-mails de acesso" },
      { key: "arquivo_logos", label: "Logos e identidade visual", type: "file-link", source: "profile" },
      { key: "arquivo_institucional", label: "Materiais institucionais", type: "file-link", source: "profile" },
      { key: "arquivo_midia", label: "Vídeos e fotos disponíveis", type: "file-link", source: "profile" },
    ],
  },
  {
    id: "identidade",
    label: "Identidade Visual",
    icon: Palette,
    fields: [
      { key: "cor_primaria", label: "Cor primária", type: "text", source: "column" },
      { key: "cor_secundaria", label: "Cor secundária", type: "text", source: "column" },
      { key: "fontes", label: "Fontes", type: "text", source: "profile" },
      { key: "personalidade_visual", label: "Personalidade visual", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "operacao",
    label: "Operação e Contatos",
    icon: Phone,
    fields: [
      { key: "sla_resposta", label: "SLA de resposta", type: "text", source: "profile" },
      { key: "horario_inicio", label: "Horário início", type: "text", source: "profile" },
      { key: "horario_fim", label: "Horário fim", type: "text", source: "profile" },
      { key: "dias_atendimento", label: "Dias de atendimento", type: "text", source: "profile" },
      { key: "informacoes_adicionais", label: "Informações adicionais", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "circulo",
    label: "Círculo Dourado (construído pela Totum)",
    icon: CircleDot,
    lockedForClient: true,
    fields: [
      { key: "circulo_porque", label: "Porquê", type: "textarea", source: "profile" },
      { key: "circulo_o_que", label: "O que", type: "textarea", source: "profile" },
      { key: "circulo_como", label: "Como", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "marca",
    label: "Características da Marca (construído pela Totum)",
    icon: Star,
    lockedForClient: true,
    fields: [
      { key: "marca_missao", label: "Missão", type: "textarea", source: "profile" },
      { key: "marca_visao", label: "Visão", type: "textarea", source: "profile" },
      { key: "marca_valores", label: "Valores", type: "textarea", source: "profile" },
      { key: "marca_personalidade", label: "Personalidade da marca", type: "textarea", source: "profile" },
      { key: "tom_voz", label: "Tom de voz", type: "text", source: "profile" },
    ],
  },
  {
    id: "puv",
    label: "PUV — Proposta Única de Valor (construído pela Totum)",
    icon: Award,
    lockedForClient: true,
    fields: [
      { key: "puv", label: "PUV", type: "textarea", source: "profile" },
    ],
  },
];

// Coleções derivadas para o submit
const ALL_COLUMN_FIELDS = SECTIONS.flatMap(s => s.fields.filter(f => f.source === "column").map(f => f.key));
const ALL_PROFILE_FIELDS = SECTIONS.flatMap(s => s.fields.filter(f => f.source === "profile").map(f => f.key));

export default function MeuCadastroPage() {
  const { user, client, loading: globalLoading, refreshData } = useGlobal();
  const [clientData, setClientData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<string[]>(["empresa"]);
  const [pendingCount, setPendingCount] = useState(0);

  const isAdmin = user?.role === "admin" || user?.role === "master";

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

  const getValue = (field: BriefingField, defaultVal: any = "") => {
    if (!clientData) return defaultVal;
    if (editMode && (clientData as any)[`_edit_${field.key}`] !== undefined) {
      return (clientData as any)[`_edit_${field.key}`];
    }
    if (field.source === "column") {
      return clientData[field.key] ?? defaultVal;
    }
    const pd = clientData.profile_data || {};
    return pd[field.key] ?? defaultVal;
  };

  const setEditValue = (key: string, value: any) => {
    setClientData((prev: any) => ({ ...prev, [`_edit_${key}`]: value }));
  };

  // Cálculo da barra de progresso
  const progress = useMemo(() => {
    if (!clientData) return 0;
    const allFields = SECTIONS.flatMap(s => s.fields).filter(f => f.type !== "file-link");
    const total = allFields.length;
    let filled = 0;
    const pd = clientData.profile_data || {};
    for (const f of allFields) {
      const val = f.source === "column" ? clientData[f.key] : pd[f.key];
      if (val && String(val).trim() !== "") filled++;
    }
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }, [clientData]);

  const handleSubmitChanges = async () => {
    if (!clientData || !user) return;
    setLoading(true); setMessage("");

    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      const pd = clientData.profile_data || {};
      let created = 0;
      let directSaves = 0;

      // Para admin/master: salva direto. Para cliente: cria pedido de aprovação,
      // mas pula seções lockedForClient (cliente não deveria poder enviar).
      const lockedKeys = new Set(
        SECTIONS.filter(s => s.lockedForClient).flatMap(s => s.fields.map(f => f.key))
      );

      const columnUpdates: Record<string, any> = {};
      const profileUpdates: Record<string, any> = { ...pd };

      for (const key of ALL_COLUMN_FIELDS) {
        const oldVal = clientData[key] ?? "";
        const newVal = (clientData as any)[`_edit_${key}`];
        if (newVal === undefined) continue;
        if (String(oldVal) === String(newVal)) continue;
        if (!isAdmin && lockedKeys.has(key)) continue;

        if (isAdmin) {
          columnUpdates[key] = newVal;
          directSaves++;
        } else {
          await sb.from("client_profile_changes").insert({
            portal_client_id: client!.id,
            requested_by: user.id,
            field_path: key,
            old_value: String(oldVal),
            new_value: String(newVal),
            status: "pendente"
          });
          created++;
        }
      }

      for (const key of ALL_PROFILE_FIELDS) {
        const oldVal = pd[key] ?? "";
        const newVal = (clientData as any)[`_edit_${key}`];
        if (newVal === undefined) continue;
        const oldStr = typeof oldVal === "object" ? JSON.stringify(oldVal) : String(oldVal);
        const newStr = typeof newVal === "object" ? JSON.stringify(newVal) : String(newVal);
        if (oldStr === newStr) continue;
        if (!isAdmin && lockedKeys.has(key)) continue;

        if (isAdmin) {
          profileUpdates[key] = newVal;
          directSaves++;
        } else {
          await sb.from("client_profile_changes").insert({
            portal_client_id: client!.id,
            requested_by: user.id,
            field_path: `profile_data.${key}`,
            old_value: oldStr,
            new_value: newStr,
            status: "pendente"
          });
          created++;
        }
      }

      if (isAdmin && directSaves > 0) {
        const payload: any = { ...columnUpdates };
        if (Object.keys(profileUpdates).length > 0) payload.profile_data = profileUpdates;
        await sb.from("portal_clients").update(payload).eq("id", client!.id);
        setMessage(`✅ ${directSaves} alteração(ões) salva(s).`);
        await loadClientData();
        setEditMode(false);
        refreshData();
      } else if (!isAdmin && created > 0) {
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

  if (globalLoading || !clientData) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const driveUrl = clientData.google_drive_folder_url;

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      <div className="bg-canvas border-b">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-ink">Meu Cadastro · Briefing</h1>
              <p className="text-sm text-muted mt-1">
                {isAdmin
                  ? "Edite diretamente os dados do cliente."
                  : "Preencha o briefing. Alterações em seções editáveis passam por aprovação."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && !isAdmin && (
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
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {isAdmin ? "Salvar" : "Salvar alterações"}</>}
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
        {/* Barra de progresso */}
        <div className="bg-canvas rounded-lg border shadow-airbnb p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-ink">Progresso do briefing</span>
            <span className="text-sm font-bold text-rausch">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-surface-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-rausch transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            Quanto mais completo, mais a Totum consegue agir com precisão.
          </p>
        </div>

        {SECTIONS.map(section => {
          const locked = section.lockedForClient && !isAdmin;
          const canEditThisSection = editMode && !locked;
          return (
            <Section
              key={section.id}
              id={section.id}
              label={section.label}
              icon={section.icon}
              expanded={expanded}
              toggle={toggleSection}
              locked={locked}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {section.fields.map(field => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    editMode={canEditThisSection}
                    value={getValue(field)}
                    onChange={(v: any) => setEditValue(field.key, v)}
                    driveUrl={driveUrl}
                  />
                ))}
              </div>
            </Section>
          );
        })}
      </div>
    </div>
  );
}

function Section({ id, label, icon: Icon, expanded, toggle, children, locked }: any) {
  const isOpen = expanded.includes(id);
  return (
    <div className="bg-canvas rounded-lg border shadow-airbnb overflow-hidden">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-soft transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-surface-soft flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-rausch" />
          </div>
          <h3 className="font-semibold text-ink flex items-center gap-2">
            {label}
            {locked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-soft text-muted text-xs rounded-full">
                <Lock className="w-3 h-3" /> somente leitura
              </span>
            )}
          </h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-soft" /> : <ChevronDown className="w-5 h-5 text-muted-soft" />}
      </button>
      {isOpen && <div className="px-6 pb-6 border-t">{children}</div>}
    </div>
  );
}

function FieldRenderer({ field, editMode, value, onChange, driveUrl }: any) {
  if (field.type === "file-link") {
    return (
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-ink mb-2">{field.label}</label>
        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <a
            href="/app/arquivos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors"
          >
            <FolderUp className="w-4 h-4" /> Enviar em Arquivos do Cliente
          </a>
          {driveUrl && (
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-hairline text-body rounded-md text-sm font-medium hover:bg-surface-soft transition-colors"
            >
              <Link2 className="w-4 h-4" /> Pasta Google Drive
            </a>
          )}
        </div>
        <p className="text-xs text-muted mt-2">
          Envie os arquivos pela página de Arquivos. A equipe Totum recebe automaticamente.
        </p>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-ink mb-2">{field.label}</label>
        {editMode ? (
          <textarea
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder={field.hint || ""}
          />
        ) : (
          <div className="px-4 py-3 bg-surface-soft rounded-md text-sm text-ink min-h-[80px] whitespace-pre-wrap">
            {value || <span className="text-muted-soft italic">—</span>}
          </div>
        )}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label className="block text-sm font-medium text-ink mb-2">{field.label}</label>
        {editMode ? (
          <select
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="input-field"
          >
            <option value="">— selecione —</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <div className="px-4 py-3 bg-surface-soft rounded-md text-sm text-ink min-h-[44px] flex items-center">
            {value || <span className="text-muted-soft italic">—</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{field.label}</label>
      {editMode ? (
        <input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="input-field"
          placeholder={field.hint || ""}
        />
      ) : (
        <div className="px-4 py-3 bg-surface-soft rounded-md text-sm text-ink min-h-[44px] flex items-center">
          {value || <span className="text-muted-soft italic">—</span>}
        </div>
      )}
    </div>
  );
}
