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

  const size = new TextEncoder().encode(JSON.stringify(content)).length;
  if (size >= 2 * 1024 * 1024) {
    errors.push("O conteúdo excede o limite de 2MB.");
  }

  return { ok: errors.length === 0, errors };
}
