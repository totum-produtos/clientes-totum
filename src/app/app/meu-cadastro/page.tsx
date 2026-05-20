"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  required?: boolean;
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
      { key: "nome", label: "Nome da empresa", type: "text", source: "column", required: true },
      { key: "cnpj", label: "CNPJ", type: "text", source: "column", required: true },
      { key: "ramo_atuacao", label: "Setor", type: "text", source: "column", required: true },
      { key: "nome_responsavel", label: "Nome do contato", type: "text", source: "column" },
      { key: "telefone", label: "Telefone", type: "text", source: "column", required: true },
      { key: "email_responsavel", label: "E-mail corporativo", type: "text", source: "column", required: true },
      { key: "como_chegou", label: "Como chegou até a gente", type: "text", source: "profile" },
      { key: "finalidade_briefing", label: "Finalidade do briefing", type: "select", source: "profile", options: ["Para Kickoff", "Para enviar orçamento"], required: true },
    ],
  },
  {
    id: "negocio",
    label: "Sobre o Negócio",
    icon: Briefcase,
    fields: [
      { key: "descricao_negocio", label: "O que a empresa faz?", type: "textarea", source: "column" },
      { key: "modelo_negocio", label: "Qual o modelo de negócio?", type: "textarea", source: "profile" },
      { key: "diferencial_competitivo", label: "Diferencial frente aos concorrentes", type: "textarea", source: "profile" },
      { key: "produto_mais_forte", label: "Produto ou serviço mais forte", type: "text", source: "profile" },
      { key: "produto_desejado_forte", label: "Produto que gostaria que fosse o mais forte", type: "text", source: "profile" },
      { key: "produto_mais_fraco", label: "Produto ou serviço mais fraco", type: "text", source: "profile" },
      { key: "ticket_medio_atual", label: "Ticket médio Atual", type: "text", source: "profile" },
      { key: "ticket_medio_ideal", label: "Ticket médio Ideal", type: "text", source: "profile" },
    ],
  },
  {
    id: "objetivos",
    label: "Objetivos e Metas",
    icon: TrendingUp,
    fields: [
      { key: "maior_objetivo_mkt", label: "Maior objetivo com o marketing digital hoje", type: "textarea", source: "profile" },
      { key: "principal_meta", label: "Principal meta", type: "textarea", source: "profile" },
      { key: "meta_mensuravel", label: "É possível mensurar a meta? Como?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "publico",
    label: "Público-Alvo",
    icon: Target,
    fields: [
      { key: "porcentagem_homens", label: "Porcentagem de Homens", type: "text", source: "profile" },
      { key: "porcentagem_mulheres", label: "Porcentagem de Mulheres", type: "text", source: "profile" },
      { key: "abrangencia_geografica", label: "Abrangência (Regional, nacional, internacional...)", type: "text", source: "profile" },
      { key: "cliente_ideal", label: "Cliente ideal na carteira (Como ele é?)", type: "textarea", source: "profile" },
      { key: "dores_principais", label: "Principais dúvidas e dores ao contatar a empresa", type: "textarea", source: "profile" },
      { key: "base_dados_clientes", label: "Existe uma base com dados destes clientes?", type: "select", source: "profile", options: ["Sim", "Não"] },
      { key: "tamanho_base", label: "Tamanho da base (se existir)", type: "text", source: "profile" },
      { key: "classe_social", label: "Renda média do cliente", type: "text", source: "profile", hint: "Ex: A+, B, C, D" },
    ],
  },
  {
    id: "sazonalidade",
    label: "Sazonalidade",
    icon: Clock,
    fields: [
      { key: "meses_alta_faturamento", label: "Meses de aumento de faturamento", type: "text", source: "profile", hint: "Ex: JAN, DEZ" },
      { key: "meses_baixa_faturamento", label: "Meses de baixa de faturamento", type: "text", source: "profile", hint: "Ex: FEV, MAR" },
      { key: "periodo_forte_mes", label: "Período mais forte do mês", type: "select", source: "profile", options: ["Primeira semana", "Segunda semana", "Terceira semana", "Última semana"] },
      { key: "periodo_fraco_mes", label: "Período mais fraco do mês", type: "select", source: "profile", options: ["Primeira semana", "Segunda semana", "Terceira semana", "Última semana"] },
      { key: "dias_fortes_semana", label: "Dias mais fortes da semana", type: "text", source: "profile", hint: "Ex: SEG, TER, QUA" },
      { key: "dias_fracos_semana", label: "Dias mais fracos da semana", type: "text", source: "profile", hint: "Ex: SAB, DOM" },
    ],
  },
  {
    id: "concorrencia",
    label: "Concorrência / Referência",
    icon: Sparkles,
    fields: [
      { key: "concorrentes_referencia", label: "Principais concorrentes", type: "textarea", source: "profile" },
      { key: "concorrente_mais_forte", label: "Qual concorrente é o mais forte? Por quê?", type: "textarea", source: "profile" },
      { key: "referencia_comunicacao", label: "Referência de comunicação bacana", type: "textarea", source: "profile" },
      { key: "pontos_fracos_concorrencia", label: "Onde seus produtos/serviços perdem dos concorrentes?", type: "textarea", source: "profile" },
      { key: "visao_mercado", label: "Como você enxerga o mercado", type: "select", source: "profile", options: ["Saturado", "Tranquilo/tem espaço", "Promissor"] },
    ],
  },
  {
    id: "comunicacao",
    label: "Comunicação",
    icon: Megaphone,
    fields: [
      { key: "canais_comunicacao_possuidos", label: "Canais de comunicação que já possui", type: "textarea", source: "profile", hint: "E-mail, Site, Instagram, Telefone, etc." },
      { key: "canal_maior_retorno", label: "Qual canal dá mais retorno?", type: "text", source: "profile" },
      { key: "monitoramento_canais", label: "Estes canais são monitorados e atualizados?", type: "textarea", source: "profile" },
      { key: "canais_preferencia_contato", label: "Através de quais canais preferiria ser contatado?", type: "text", source: "profile" },
      { key: "acoes_passadas", label: "Ações de marketing efetivas no passado", type: "textarea", source: "profile" },
      { key: "plano_marketing_existente", label: "Já existiu plano de marketing na empresa?", type: "textarea", source: "profile" },
      { key: "trabalhou_agencia", label: "A empresa já trabalhou com agência? Como foi?", type: "textarea", source: "profile" },
      { key: "equipe_marketing", label: "Equipe ou colaborador dedicado ao marketing digital?", type: "textarea", source: "profile" },
    ],
  },
  {
    id: "vendas",
    label: "Processo de Vendas",
    icon: ShoppingCart,
    fields: [
      { key: "processo_vendas_estruturado", label: "Como é o processo de vendas? É estruturado?", type: "textarea", source: "profile" },
      { key: "crm_utilizado", label: "Utiliza CRM para vendas?", type: "text", source: "profile" },
      { key: "funil_vendas_conversao", label: "Existe funil desenhado? Porcentagem de conversão?", type: "textarea", source: "profile" },
      { key: "equipe_vendas", label: "Pessoas dedicadas à venda (quantas)?", type: "text", source: "profile" },
      { key: "canais_vendas", label: "Canais utilizados para vender", type: "text", source: "profile", hint: "Cara a cara, Telefone, E-mail, Redes sociais" },
      { key: "custo_aquisicao_cac", label: "Custo de aquisição de clientes (CAC)", type: "text", source: "profile" },
      { key: "informacoes_adicionais", label: "Observações Adicionais", type: "textarea", source: "profile", hint: "Serviços específicos, páginas, formulários" },
    ],
  },
  {
    id: "acessos",
    label: "Acessos e Materiais",
    icon: Link2,
    fields: [
      { key: "site", label: "Site Principal", type: "text", source: "column", hint: "URL principal" },
      { key: "arquivo_logos", label: "Logos e identidade visual", type: "file-link", source: "profile" },
      { key: "arquivo_institucional", label: "Materiais institucionais", type: "file-link", source: "profile" },
      { key: "arquivo_midia", label: "Vídeos e fotos disponíveis", type: "file-link", source: "profile" },
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
    if (data) {
      setClientData(data);
    } else {
      setClientData({ _error: true });
    }
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

    // Validação de campos obrigatórios
    const requiredFields = [
      { key: "nome", label: "Nome da empresa" },
      { key: "cnpj", label: "CNPJ" },
      { key: "email_responsavel", label: "E-mail corporativo" },
      { key: "telefone", label: "Telefone" },
      { key: "ramo_atuacao", label: "Setor" },
      { key: "finalidade_briefing", label: "Finalidade do briefing" }
    ];

    for (const req of requiredFields) {
      const fieldConfig = SECTIONS.flatMap(s => s.fields).find(f => f.key === req.key);
      if (fieldConfig) {
        const val = getValue(fieldConfig);
        if (!val || String(val).trim() === "") {
          const section = SECTIONS.find(s => s.fields.some(f => f.key === req.key));
          if (section) {
            setExpanded(prev => prev.includes(section.id) ? prev : [...prev, section.id]);
          }
          setMessage(`❌ O campo obrigatório "${req.label}" precisa ser preenchido.`);
          setLoading(false);
          return;
        }
      }
    }

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
        
        // If the briefing wasn't completed yet, mark it as completed now
        if (!clientData.profile_data?.briefing_completed) {
            try {
                const session = await supabase.getSupabaseClient().auth.getSession();
                const token = session.data.session?.access_token;
                if (token) {
                    await fetch('/api/client/briefing/complete', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }
            } catch (e) {
                console.error("Failed to mark briefing as completed", e);
            }
        }

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

  if (globalLoading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-canvas border p-8 rounded-xl shadow-xl max-w-md w-full">
          <Building2 className="w-12 h-12 text-rausch mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">Nenhum Cliente Vinculado</h2>
          <p className="text-muted text-sm mb-6">
            Você precisa estar vinculado a um cliente para acessar esta página, ou selecionar um cliente na Central de Conteúdos.
          </p>
          <Link href="/app" className="block w-full py-3 bg-rausch text-white font-medium rounded-lg hover:bg-rausch-active text-center transition-colors">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (clientData._error) {
    return (
      <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-canvas border p-8 rounded-xl shadow-xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rausch mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">Erro ao carregar dados</h2>
          <p className="text-muted text-sm mb-6">
            Não foi possível carregar as informações deste cliente. Você pode não ter permissão de acesso.
          </p>
          <Link href="/app" className="block w-full py-3 bg-rausch text-white font-medium rounded-lg hover:bg-rausch-active text-center transition-colors">
            Voltar ao Início
          </Link>
        </div>
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

      {/* Barra fixa inferior para Salvar (Sticky UX) */}
      {editMode && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-ink border-t border-hairline z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center animate-in slide-in-from-bottom-5">
          <div className="w-full max-w-5xl flex items-center justify-between px-6">
            <span className="text-sm font-medium text-muted hidden md:block">Você possui alterações não salvas no briefing.</span>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button onClick={() => { setEditMode(false); setMessage(""); }} className="flex items-center justify-center gap-2 px-4 py-2 text-body hover:text-ink rounded-md text-sm font-medium transition-colors">
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button onClick={handleSubmitChanges} disabled={loading} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-success text-white rounded-md text-sm font-medium hover:bg-success-text shadow-sm disabled:opacity-50 transition-colors">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> {isAdmin ? "Salvar" : "Salvar alterações"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
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
        <label className="block text-sm font-medium text-ink mb-2">
          {field.label} {field.required && <span className="text-rausch">*</span>}
        </label>
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
        <label className="block text-sm font-medium text-ink mb-2">
          {field.label} {field.required && <span className="text-rausch">*</span>}
        </label>
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
        <label className="block text-sm font-medium text-ink mb-2">
          {field.label} {field.required && <span className="text-rausch">*</span>}
        </label>
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
      <label className="block text-sm font-medium text-ink mb-2">
        {field.label} {field.required && <span className="text-rausch">*</span>}
      </label>
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
