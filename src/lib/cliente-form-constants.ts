// src/lib/cliente-form-constants.ts
import { Building2, Briefcase, Target, Palette, Phone, Users, CircleDot, Award, Star, Activity, Megaphone, ShoppingCart } from "lucide-react";

export const STEPS = [
  { id: 1, label: "Informações da Empresa", icon: Building2 },
  { id: 2, label: "Sobre o Negócio", icon: Briefcase },
  { id: 3, label: "Objetivos e Sazonalidade", icon: Activity },
  { id: 4, label: "Público-Alvo", icon: Target },
  { id: 5, label: "Concorrência e Comunicação", icon: Megaphone },
  { id: 6, label: "Processo de Vendas", icon: ShoppingCart },
  { id: 7, label: "Identidade Visual", icon: Palette },
  { id: 8, label: "Operação e Contatos", icon: Phone },
  { id: 9, label: "Persona", icon: Users },
  { id: 10, label: "Círculo Dourado", icon: CircleDot },
  { id: 11, label: "Características da Marca", icon: Star },
  { id: 12, label: "PUV", icon: Award },
];

export const RAMOS = ["Saúde", "Tecnologia", "Educação", "E-commerce", "Serviços", "Outros"];
export const TEMPOS_MERCADO = ["Menos de 1 ano", "1-3 anos", "3-5 anos", "5+ anos"];
export const TAMANHOS = ["Startup", "PME", "Grande empresa"];
export const FATURAMENTOS = ["Até R$ 10k", "R$ 10k-50k", "R$ 50k-200k", "R$ 200k-1M", "R$ 1M+"];
export const GENEROS = ["Masculino", "Feminino", "Ambos"];
export const TONS_VOZ = ["Formal", "Descontraído", "Técnico", "Inspirador", "Humorístico"];
export const CANAIS = ["WhatsApp", "Email", "Telefone", "Chat", "Redes Sociais", "Cara a cara"];
export const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const SLAS = ["1h", "4h", "24h", "48h"];
export const CLASSES_SOCIAIS = ["A+", "A", "B+", "B", "B-", "C", "D", "D-"];
export const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
export const SEMANAS = ["Primeira semana", "Segunda semana", "Terceira semana", "Última semana"];
export const VISIOES_MERCADO = ["Saturado", "Tranquilo/tem espaço", "Promissor"];
export const FINALIDADES = ["Para Kickoff", "Para enviar orçamento"];

export type Persona = {
  nome: string;
  idade: string;
  ocupacao: string;
  objetivos: string;
  dores: string;
};

export type FormState = {
  nome: string;
  cnpj: string;
  nome_responsavel: string;
  email_responsavel: string;
  telefone: string;
  site: string;
  ramo_atuacao: string;
  tempo_mercado: string;
  descricao_negocio: string;
  produtos_servicos: string;
  tamanho_empresa: string;
  faturamento_mensal: string;
  nicho_principal: string;
  dores_principais: string;
  desejos_objetivos: string;
  faixa_etaria: number[];
  genero_alvo: string;
  localizacao_alvo: string;
  classe_social: string[];
  tom_voz: string;
  cor_primaria: string;
  cor_secundaria: string;
  fontes: string;
  key_visual_desc: string;
  key_visual_images: string[];
  personalidade_visual: string;
  canais_atendimento: string[];
  crm_utilizado: string;
  sla_resposta: string;
  horario_inicio: string;
  horario_fim: string;
  dias_atendimento: string[];
  informacoes_adicionais: string;
  personas: Persona[];
  circulo_dourado: { porque: string; o_que: string; como: string };
  caracteristicas_marca: { missao: string; visao: string; valores: string; personalidade: string };
  puv: string;
  
  // Novos campos do Briefing
  como_chegou: string;
  finalidade_briefing: string;
  modelo_negocio: string;
  diferencial_competitivo: string;
  produto_mais_forte: string;
  produto_desejado_forte: string;
  produto_mais_fraco: string;
  ticket_medio_atual: string;
  ticket_medio_ideal: string;
  maior_objetivo_mkt: string;
  principal_meta: string;
  meta_mensuravel: string;
  porcentagem_homens: string;
  porcentagem_mulheres: string;
  abrangencia_geografica: string;
  cliente_ideal: string;
  base_dados_clientes: string;
  tamanho_base: string;
  meses_alta_faturamento: string[];
  meses_baixa_faturamento: string[];
  periodo_forte_mes: string;
  periodo_fraco_mes: string;
  dias_fortes_semana: string[];
  dias_fracos_semana: string[];
  concorrentes_referencia: string;
  concorrente_mais_forte: string;
  referencia_comunicacao: string;
  pontos_fracos_concorrencia: string;
  visao_mercado: string;
  canais_comunicacao_possuidos: string[];
  canal_maior_retorno: string;
  monitoramento_canais: string;
  canais_preferencia_contato: string;
  acoes_passadas: string;
  plano_marketing_existente: string;
  trabalhou_agencia: string;
  equipe_marketing: string;
  processo_vendas_estruturado: string;
  funil_vendas_conversao: string;
  equipe_vendas: string;
  canais_vendas: string[];
  custo_aquisicao_cac: string;
  briefing_completed: boolean;
};

export const DEFAULT_FORM_STATE: FormState = {
  nome: "", cnpj: "", nome_responsavel: "", email_responsavel: "", telefone: "", site: "",
  ramo_atuacao: "", tempo_mercado: "", descricao_negocio: "", produtos_servicos: "",
  tamanho_empresa: "", faturamento_mensal: "",
  nicho_principal: "", dores_principais: "", desejos_objetivos: "",
  faixa_etaria: [18, 65], genero_alvo: "", localizacao_alvo: "",
  classe_social: [], tom_voz: "",
  cor_primaria: "#FF385C",
  cor_secundaria: "#1a1a2e",
  fontes: "",
  key_visual_desc: "", key_visual_images: [],
  personalidade_visual: "",
  canais_atendimento: [], crm_utilizado: "", sla_resposta: "",
  horario_inicio: "08:00", horario_fim: "18:00", dias_atendimento: [],
  informacoes_adicionais: "",
  personas: [{ nome: "", idade: "", ocupacao: "", objetivos: "", dores: "" }],
  circulo_dourado: { porque: "", o_que: "", como: "" },
  caracteristicas_marca: { missao: "", visao: "", valores: "", personalidade: "" },
  puv: "",
  
  // Inicialização dos novos campos
  como_chegou: "", finalidade_briefing: "", modelo_negocio: "",
  diferencial_competitivo: "", produto_mais_forte: "", produto_desejado_forte: "",
  produto_mais_fraco: "", ticket_medio_atual: "", ticket_medio_ideal: "",
  maior_objetivo_mkt: "", principal_meta: "", meta_mensuravel: "",
  porcentagem_homens: "", porcentagem_mulheres: "", abrangencia_geografica: "",
  cliente_ideal: "", base_dados_clientes: "", tamanho_base: "",
  meses_alta_faturamento: [], meses_baixa_faturamento: [],
  periodo_forte_mes: "", periodo_fraco_mes: "",
  dias_fortes_semana: [], dias_fracos_semana: [],
  concorrentes_referencia: "", concorrente_mais_forte: "", referencia_comunicacao: "",
  pontos_fracos_concorrencia: "", visao_mercado: "",
  canais_comunicacao_possuidos: [], canal_maior_retorno: "", monitoramento_canais: "",
  canais_preferencia_contato: "", acoes_passadas: "", plano_marketing_existente: "",
  trabalhou_agencia: "", equipe_marketing: "", processo_vendas_estruturado: "",
  funil_vendas_conversao: "", equipe_vendas: "", canais_vendas: [], custo_aquisicao_cac: "",
  briefing_completed: false,
};
