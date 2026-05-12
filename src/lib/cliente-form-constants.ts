// src/lib/cliente-form-constants.ts
import { Building2, Briefcase, Target, Palette, Phone, Users, CircleDot, Award, Star } from "lucide-react";

export const STEPS = [
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

export const RAMOS = ["Saúde", "Tecnologia", "Educação", "E-commerce", "Serviços", "Outros"];
export const TEMPOS_MERCADO = ["Menos de 1 ano", "1-3 anos", "3-5 anos", "5+ anos"];
export const TAMANHOS = ["Startup", "PME", "Grande empresa"];
export const FATURAMENTOS = ["Até R$ 10k", "R$ 10k-50k", "R$ 50k-200k", "R$ 200k-1M", "R$ 1M+"];
export const GENEROS = ["Masculino", "Feminino", "Ambos"];
export const TONS_VOZ = ["Formal", "Descontraído", "Técnico", "Inspirador", "Humorístico"];
export const CANAIS = ["WhatsApp", "Email", "Telefone", "Chat", "Redes Sociais"];
export const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const SLAS = ["1h", "4h", "24h", "48h"];
export const CLASSES_SOCIAIS = ["A", "B", "C", "D", "E"];

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
};

export const DEFAULT_FORM_STATE: FormState = {
  nome: "", cnpj: "", nome_responsavel: "", email_responsavel: "", telefone: "", site: "",
  ramo_atuacao: "", tempo_mercado: "", descricao_negocio: "", produtos_servicos: "",
  tamanho_empresa: "", faturamento_mensal: "",
  nicho_principal: "", dores_principais: "", desejos_objetivos: "",
  faixa_etaria: [18, 65], genero_alvo: "", localizacao_alvo: "",
  classe_social: [], tom_voz: "",
  cor_primaria: "#FF385C", // FIX: was "rausch" (CSS class, not valid hex)
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
};
