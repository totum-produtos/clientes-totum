// Estrutura do JSON armazenado em portal_client_plans.content.
// Toda seção é opcional: o editor salva parcial e o viewer renderiza só o
// que existe (ver src/components/planejamentos/PlanSection.tsx).

export interface BmadBlock {
  score: number;
  resumo?: string;
  itens?: string[];
  [campo: string]: unknown;
}

export interface ProdutoDegrau {
  nome: string;
  faixa_preco: string;
  publico: string;
  promessa: string;
}

export interface FunilEtapa {
  passo: string;
  kpi?: string;
}

export interface Funil {
  nome: string;
  etapas: FunilEtapa[];
}

export interface CenarioProjecao {
  nome: "conservador" | "realista" | "agressivo";
  meses: { mes: string; valor: number }[];
}

export interface Ferramenta {
  nome: string;
  categoria: string;
  custo?: string;
  link?: string;
}

export interface Acao {
  titulo: string;
  descricao?: string;
}

export interface PostEditorial {
  formato: string;
  horario?: string;
  hook: string;
  cta?: string;
  hashtags?: string[];
}

export interface DiaEditorial {
  dia: string;
  posts: PostEditorial[];
}

export interface SemanaEditorial {
  label: string;
  meta?: string;
  dias: DiaEditorial[];
}

export interface Roteiro {
  titulo: string;
  gancho: string;
  cenas?: string[];
  cta?: string;
}

export interface PublicoAlvo {
  descricao: string;
}

export interface PostImpulsionar {
  titulo: string;
  motivo?: string;
}

export interface Collab {
  handle: string;
  motivo: string;
}

export interface Kpi {
  nome: string;
  meta: string;
  atual?: string;
}

export interface PerformancePorFormato {
  formato: string;
  engajamento: number;
  alcance?: number;
}

export interface PadraoTemporal {
  dia: string;
  horario: string;
  score: number;
}

export interface TemaEngajamento {
  tema: string;
  score: number;
}

export interface CtaAnalise {
  cta: string;
  conversao: number;
}

export interface PerfilComercial {
  timeSizeComercial?: number;
  timeSizeOperacional?: number;
  faturamentoAtual?: string;
  metaFaturamento?: string;
  ticketMedio?: string;
  modelo?: string;
  canaisEntrada?: string[];
  volumeLeadsMes?: string;
  crmAtual?: string;
}

export interface Spin {
  situacao?: string;
  problemas?: string[];
  implicacoes?: string[];
  necessidades?: string[];
}

export interface ScoresComerciais {
  fitGeral: number;
  urgencia: number;
  potencialReceita: number;
  maturidadeDigital: number;
}

export interface ProdutoRecomendado {
  entrada: string;
  precoEntrada?: string;
  upsell?: string;
  precoUpsell?: string;
  justificativa?: string;
}

export interface SemanaPlano {
  semana: number;
  titulo: string;
  acoes: string[];
}

export interface MetricaComercial {
  nome: string;
  meta: string;
  como?: string;
}

export interface DiagnosticoComercial {
  data_analise?: string;
  status_comercial?: "ativo" | "piloto" | "prospecto";
  perfil?: PerfilComercial;
  spin?: Spin;
  scores?: ScoresComerciais;
  produto_recomendado?: ProdutoRecomendado;
  plano_semanal?: SemanaPlano[];
  metricas_comerciais?: MetricaComercial[];
  gaps?: string[];
  observacoes?: string;
}

export interface PlanContent {
  resumo_executivo?: {
    texto: string;
    destaques?: string[];
  };
  bmad?: {
    brand?: BmadBlock;
    market?: BmadBlock;
    audit?: BmadBlock;
    direction?: BmadBlock;
  };
  escada_valor?: {
    produtos: ProdutoDegrau[];
  };
  funis?: Funil[];
  recorrencia?: {
    estrategia: string;
    metas_mrr?: { label: string; valor: string }[];
  };
  projecao?: {
    cenarios: CenarioProjecao[];
  };
  stack?: {
    ferramentas: Ferramenta[];
  };
  plano_acao?: {
    d30: Acao[];
    d90: Acao[];
  };
  calendario_editorial?: {
    semanas: SemanaEditorial[];
  };
  reels?: {
    roteiros: Roteiro[];
  };
  trafego_pago?: {
    orcamento_mensal?: string;
    publicos?: PublicoAlvo[];
    posts_impulsionar?: PostImpulsionar[];
  };
  collabs?: {
    perfis: Collab[];
  };
  metricas?: {
    kpis: Kpi[];
  };
  performance?: {
    por_formato?: PerformancePorFormato[];
    padroes_temporais?: PadraoTemporal[];
    temas?: TemaEngajamento[];
    ctas?: CtaAnalise[];
    diagnostico?: string;
    plano_crescimento?: string[];
  };
  diagnostico_comercial?: DiagnosticoComercial;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const KNOWN_SECTIONS: (keyof PlanContent)[] = [
  "resumo_executivo",
  "bmad",
  "escada_valor",
  "funis",
  "recorrencia",
  "projecao",
  "stack",
  "plano_acao",
  "calendario_editorial",
  "reels",
  "trafego_pago",
  "collabs",
  "metricas",
  "performance",
  "diagnostico_comercial",
];

// Validação estrutural leve (sem lib externa, mesmo estilo de src/lib/persist.ts):
// confirma que o JSON é um objeto e que cada seção presente tem o formato
// mínimo esperado. Não é um schema completo — o viewer é defensivo por seção
// e tolera campos extras ou ausentes dentro de cada bloco.
export function validatePlanContent(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: ["O conteúdo precisa ser um objeto JSON."] };
  }

  const content = input as Record<string, unknown>;

  for (const key of Object.keys(content)) {
    if (!KNOWN_SECTIONS.includes(key as keyof PlanContent)) {
      errors.push(`Seção desconhecida: "${key}".`);
    }
  }

  if ("bmad" in content) {
    const bmad = content.bmad;
    if (typeof bmad !== "object" || bmad === null || Array.isArray(bmad)) {
      errors.push('"bmad" precisa ser um objeto.');
    } else {
      for (const [bloco, valor] of Object.entries(bmad as Record<string, unknown>)) {
        if (!["brand", "market", "audit", "direction"].includes(bloco)) {
          errors.push(`Bloco BMAD desconhecido: "${bloco}".`);
          continue;
        }
        if (typeof valor !== "object" || valor === null) {
          errors.push(`"bmad.${bloco}" precisa ser um objeto.`);
          continue;
        }
        const score = (valor as Record<string, unknown>).score;
        if (typeof score !== "number" || score < 0 || score > 100) {
          errors.push(`"bmad.${bloco}.score" precisa ser um número entre 0 e 100.`);
        }
      }
    }
  }

  if ("escada_valor" in content) {
    const ev = content.escada_valor as Record<string, unknown> | undefined;
    if (!ev || !Array.isArray(ev.produtos)) {
      errors.push('"escada_valor.produtos" precisa ser uma lista.');
    }
  }

  if ("funis" in content) {
    if (!Array.isArray(content.funis)) {
      errors.push('"funis" precisa ser uma lista.');
    } else {
      content.funis.forEach((funil, i) => {
        if (!funil || typeof funil !== "object" || !Array.isArray((funil as Record<string, unknown>).etapas)) {
          errors.push(`"funis[${i}].etapas" precisa ser uma lista.`);
        }
      });
    }
  }

  if ("projecao" in content) {
    const proj = content.projecao as Record<string, unknown> | undefined;
    if (!proj || !Array.isArray(proj.cenarios)) {
      errors.push('"projecao.cenarios" precisa ser uma lista.');
    } else {
      const cenarios = proj.cenarios as unknown[];
      cenarios.forEach((cenario, i) => {
        if (!cenario || typeof cenario !== "object" || !Array.isArray((cenario as Record<string, unknown>).meses)) {
          errors.push(`"projecao.cenarios[${i}].meses" precisa ser uma lista.`);
        }
      });
      const mesesCounts = cenarios.map((c) =>
        c && typeof c === "object" && Array.isArray((c as Record<string, unknown>).meses)
          ? ((c as Record<string, unknown>).meses as unknown[]).map((m) => (m as Record<string, unknown>)?.mes)
          : null,
      );
      const first = mesesCounts.find((m) => m !== null);
      if (first && mesesCounts.some((m) => m !== null && JSON.stringify(m) !== JSON.stringify(first))) {
        errors.push('"projecao.cenarios[*].meses" precisa ter os mesmos meses, na mesma ordem, em todos os cenários.');
      }
    }
  }

  if ("calendario_editorial" in content) {
    const cal = content.calendario_editorial as Record<string, unknown> | undefined;
    if (!cal || !Array.isArray(cal.semanas)) {
      errors.push('"calendario_editorial.semanas" precisa ser uma lista.');
    } else {
      (cal.semanas as unknown[]).forEach((semana, i) => {
        const dias = semana && typeof semana === "object" ? (semana as Record<string, unknown>).dias : undefined;
        if (!Array.isArray(dias)) {
          errors.push(`"calendario_editorial.semanas[${i}].dias" precisa ser uma lista.`);
          return;
        }
        dias.forEach((dia, j) => {
          const posts = dia && typeof dia === "object" ? (dia as Record<string, unknown>).posts : undefined;
          if (!Array.isArray(posts)) {
            errors.push(`"calendario_editorial.semanas[${i}].dias[${j}].posts" precisa ser uma lista.`);
          }
        });
      });
    }
  }

  if ("plano_acao" in content) {
    const pa = content.plano_acao as Record<string, unknown> | undefined;
    if (!pa || !Array.isArray(pa.d30) || !Array.isArray(pa.d90)) {
      errors.push('"plano_acao" precisa ter "d30" e "d90" como listas.');
    }
  }

  if ("stack" in content) {
    const stack = content.stack as Record<string, unknown> | undefined;
    if (!stack || !Array.isArray(stack.ferramentas)) {
      errors.push('"stack.ferramentas" precisa ser uma lista.');
    }
  }

  if ("reels" in content) {
    const reels = content.reels as Record<string, unknown> | undefined;
    if (!reels || !Array.isArray(reels.roteiros)) {
      errors.push('"reels.roteiros" precisa ser uma lista.');
    }
  }

  if ("collabs" in content) {
    const collabs = content.collabs as Record<string, unknown> | undefined;
    if (!collabs || !Array.isArray(collabs.perfis)) {
      errors.push('"collabs.perfis" precisa ser uma lista.');
    }
  }

  if ("metricas" in content) {
    const metricas = content.metricas as Record<string, unknown> | undefined;
    if (!metricas || !Array.isArray(metricas.kpis)) {
      errors.push('"metricas.kpis" precisa ser uma lista.');
    }
  }

  if ("diagnostico_comercial" in content) {
    const dc = content.diagnostico_comercial;
    if (typeof dc !== "object" || dc === null || Array.isArray(dc)) {
      errors.push('"diagnostico_comercial" precisa ser um objeto.');
    } else {
      const bloco = dc as Record<string, unknown>;

      if ("status_comercial" in bloco) {
        const status = bloco.status_comercial;
        if (!["ativo", "piloto", "prospecto"].includes(status as string)) {
          errors.push(
            '"diagnostico_comercial.status_comercial" precisa ser "ativo", "piloto" ou "prospecto".',
          );
        }
      }

      if ("scores" in bloco) {
        const scores = bloco.scores;
        const campos = ["fitGeral", "urgencia", "potencialReceita", "maturidadeDigital"] as const;
        if (typeof scores !== "object" || scores === null || Array.isArray(scores)) {
          errors.push('"diagnostico_comercial.scores" precisa ser um objeto.');
        } else {
          for (const campo of campos) {
            const valor = (scores as Record<string, unknown>)[campo];
            if (typeof valor !== "number" || valor < 0 || valor > 100) {
              errors.push(
                `"diagnostico_comercial.scores.${campo}" precisa ser um número entre 0 e 100.`,
              );
            }
          }
        }
      }

      if ("produto_recomendado" in bloco) {
        const pr = bloco.produto_recomendado;
        if (
          typeof pr !== "object" ||
          pr === null ||
          Array.isArray(pr) ||
          typeof (pr as Record<string, unknown>).entrada !== "string" ||
          !(pr as Record<string, unknown>).entrada
        ) {
          errors.push('"diagnostico_comercial.produto_recomendado.entrada" é obrigatório.');
        }
      }

      if ("plano_semanal" in bloco) {
        if (!Array.isArray(bloco.plano_semanal)) {
          errors.push('"diagnostico_comercial.plano_semanal" precisa ser uma lista.');
        } else {
          (bloco.plano_semanal as unknown[]).forEach((item, i) => {
            const semana = item as Record<string, unknown>;
            if (!item || typeof item !== "object" || Array.isArray(item)) {
              errors.push(`"diagnostico_comercial.plano_semanal[${i}]" precisa ser um objeto.`);
              return;
            }
            if (typeof semana.semana !== "number") {
              errors.push(`"diagnostico_comercial.plano_semanal[${i}].semana" precisa ser um número.`);
            }
            if (typeof semana.titulo !== "string" || !semana.titulo) {
              errors.push(`"diagnostico_comercial.plano_semanal[${i}].titulo" é obrigatório.`);
            }
            if (!Array.isArray(semana.acoes)) {
              errors.push(`"diagnostico_comercial.plano_semanal[${i}].acoes" precisa ser uma lista.`);
            }
          });
        }
      }

      if ("metricas_comerciais" in bloco) {
        if (!Array.isArray(bloco.metricas_comerciais)) {
          errors.push('"diagnostico_comercial.metricas_comerciais" precisa ser uma lista.');
        } else {
          (bloco.metricas_comerciais as unknown[]).forEach((item, i) => {
            const metrica = item as Record<string, unknown>;
            if (!item || typeof item !== "object" || Array.isArray(item)) {
              errors.push(`"diagnostico_comercial.metricas_comerciais[${i}]" precisa ser um objeto.`);
              return;
            }
            if (typeof metrica.nome !== "string" || !metrica.nome) {
              errors.push(`"diagnostico_comercial.metricas_comerciais[${i}].nome" é obrigatório.`);
            }
            if (typeof metrica.meta !== "string" || !metrica.meta) {
              errors.push(`"diagnostico_comercial.metricas_comerciais[${i}].meta" é obrigatório.`);
            }
          });
        }
      }

      if ("gaps" in bloco && !Array.isArray(bloco.gaps)) {
        errors.push('"diagnostico_comercial.gaps" precisa ser uma lista.');
      }
    }
  }

  const size = new TextEncoder().encode(JSON.stringify(content)).length;
  if (size >= 2 * 1024 * 1024) {
    errors.push("O conteúdo excede o limite de 2MB.");
  }

  return { ok: errors.length === 0, errors };
}
