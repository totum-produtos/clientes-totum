import { describe, it, expect } from "vitest";
import { validatePlanContent } from "./schema";

describe("validatePlanContent", () => {
  it("aceita objeto vazio", () => {
    const result = validatePlanContent({});
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejeita valores que não são objeto", () => {
    expect(validatePlanContent(null).ok).toBe(false);
    expect(validatePlanContent([]).ok).toBe(false);
    expect(validatePlanContent("texto").ok).toBe(false);
    expect(validatePlanContent(42).ok).toBe(false);
  });

  it("aceita conteúdo parcial com apenas resumo_executivo", () => {
    const result = validatePlanContent({
      resumo_executivo: { texto: "Resumo aqui" },
    });
    expect(result.ok).toBe(true);
  });

  it("rejeita seção desconhecida", () => {
    const result = validatePlanContent({ secao_invalida: {} });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("secao_invalida"))).toBe(true);
  });

  it("valida score do bloco bmad entre 0 e 100", () => {
    const valido = validatePlanContent({ bmad: { brand: { score: 65 } } });
    expect(valido.ok).toBe(true);

    const invalido = validatePlanContent({ bmad: { brand: { score: 150 } } });
    expect(invalido.ok).toBe(false);

    const semScore = validatePlanContent({ bmad: { brand: { resumo: "x" } } });
    expect(semScore.ok).toBe(false);
  });

  it("rejeita bloco bmad desconhecido", () => {
    const result = validatePlanContent({ bmad: { bloco_x: { score: 10 } } });
    expect(result.ok).toBe(false);
  });

  it("exige escada_valor.produtos como lista", () => {
    const valido = validatePlanContent({ escada_valor: { produtos: [] } });
    expect(valido.ok).toBe(true);

    const invalido = validatePlanContent({ escada_valor: { produtos: "não-lista" } });
    expect(invalido.ok).toBe(false);
  });

  it("exige funis como lista", () => {
    expect(validatePlanContent({ funis: [] }).ok).toBe(true);
    expect(validatePlanContent({ funis: {} }).ok).toBe(false);
  });

  it("exige que cada funil tenha etapas como lista", () => {
    expect(
      validatePlanContent({ funis: [{ nome: "X", etapas: [{ passo: "A" }] }] }).ok,
    ).toBe(true);
    const semEtapas = validatePlanContent({ funis: [{ nome: "X" }] });
    expect(semEtapas.ok).toBe(false);
    expect(semEtapas.errors.some((e) => e.includes("funis[0].etapas"))).toBe(true);
  });

  it("exige projecao.cenarios como lista", () => {
    expect(validatePlanContent({ projecao: { cenarios: [] } }).ok).toBe(true);
    expect(validatePlanContent({ projecao: {} }).ok).toBe(false);
  });

  it("exige que cada cenário de projecao tenha meses como lista", () => {
    const semMeses = validatePlanContent({ projecao: { cenarios: [{ nome: "conservador" }] } });
    expect(semMeses.ok).toBe(false);
    expect(semMeses.errors.some((e) => e.includes("projecao.cenarios[0].meses"))).toBe(true);
  });

  it("rejeita cenários de projecao com meses em ordem/quantidade diferente", () => {
    const desalinhado = validatePlanContent({
      projecao: {
        cenarios: [
          { nome: "conservador", meses: [{ mes: "jan", valor: 1 }, { mes: "fev", valor: 2 }] },
          { nome: "agressivo", meses: [{ mes: "fev", valor: 3 }, { mes: "jan", valor: 4 }] },
        ],
      },
    });
    expect(desalinhado.ok).toBe(false);

    const alinhado = validatePlanContent({
      projecao: {
        cenarios: [
          { nome: "conservador", meses: [{ mes: "jan", valor: 1 }, { mes: "fev", valor: 2 }] },
          { nome: "agressivo", meses: [{ mes: "jan", valor: 4 }, { mes: "fev", valor: 3 }] },
        ],
      },
    });
    expect(alinhado.ok).toBe(true);
  });

  it("exige calendario_editorial.semanas como lista", () => {
    expect(
      validatePlanContent({ calendario_editorial: { semanas: [] } }).ok,
    ).toBe(true);
    expect(validatePlanContent({ calendario_editorial: {} }).ok).toBe(false);
  });

  it("exige que cada semana do calendário tenha dias, e cada dia tenha posts", () => {
    const semDias = validatePlanContent({ calendario_editorial: { semanas: [{ label: "S1" }] } });
    expect(semDias.ok).toBe(false);

    const semPosts = validatePlanContent({
      calendario_editorial: { semanas: [{ label: "S1", dias: [{ dia: "Segunda" }] }] },
    });
    expect(semPosts.ok).toBe(false);

    const completo = validatePlanContent({
      calendario_editorial: {
        semanas: [{ label: "S1", dias: [{ dia: "Segunda", posts: [{ formato: "Reel", hook: "..." }] }] }],
      },
    });
    expect(completo.ok).toBe(true);
  });

  it("exige stack.ferramentas, reels.roteiros, collabs.perfis e metricas.kpis como listas", () => {
    expect(validatePlanContent({ stack: {} }).ok).toBe(false);
    expect(validatePlanContent({ stack: { ferramentas: [] } }).ok).toBe(true);
    expect(validatePlanContent({ reels: {} }).ok).toBe(false);
    expect(validatePlanContent({ reels: { roteiros: [] } }).ok).toBe(true);
    expect(validatePlanContent({ collabs: {} }).ok).toBe(false);
    expect(validatePlanContent({ collabs: { perfis: [] } }).ok).toBe(true);
    expect(validatePlanContent({ metricas: {} }).ok).toBe(false);
    expect(validatePlanContent({ metricas: { kpis: [] } }).ok).toBe(true);
  });

  it("exige plano_acao com d30 e d90 como listas", () => {
    expect(
      validatePlanContent({ plano_acao: { d30: [], d90: [] } }).ok,
    ).toBe(true);
    expect(validatePlanContent({ plano_acao: { d30: [] } }).ok).toBe(false);
  });

  it("aceita um planejamento completo de exemplo", () => {
    const result = validatePlanContent({
      resumo_executivo: { texto: "..." },
      bmad: {
        brand: { score: 65 },
        market: { score: 85 },
        audit: { score: 40 },
        direction: { score: 80 },
      },
      escada_valor: { produtos: [{ nome: "X", faixa_preco: "R$ 97", publico: "Y", promessa: "Z" }] },
      funis: [{ nome: "Funil 1", etapas: [{ passo: "Anúncio" }] }],
      recorrencia: { estrategia: "SaaS" },
      projecao: { cenarios: [{ nome: "conservador", meses: [{ mes: "jan", valor: 1000 }] }] },
      stack: { ferramentas: [{ nome: "ActiveCampaign", categoria: "CRM" }] },
      plano_acao: { d30: [{ titulo: "A" }], d90: [{ titulo: "B" }] },
      calendario_editorial: {
        semanas: [{ label: "Semana 1", dias: [{ dia: "Segunda", posts: [{ formato: "Reel", hook: "..." }] }] }],
      },
      reels: { roteiros: [{ titulo: "T", gancho: "G" }] },
      trafego_pago: { orcamento_mensal: "R$ 3.000" },
      collabs: { perfis: [{ handle: "@x", motivo: "..." }] },
      metricas: { kpis: [{ nome: "Seguidores", meta: "+5%" }] },
      performance: { diagnostico: "..." },
    });
    expect(result.ok).toBe(true);
  });

  it("rejeita conteúdo maior que 2MB", () => {
    const gigante = { resumo_executivo: { texto: "x".repeat(3 * 1024 * 1024) } };
    const result = validatePlanContent(gigante);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("2MB"))).toBe(true);
  });
});
