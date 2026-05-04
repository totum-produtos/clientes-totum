export const postsAgendados = [
  { id: 1, data: '2026-05-05', plataforma: 'Instagram', tipo: 'Reel', status: 'Aprovado', titulo: 'Lançamento campanha Mães' },
  { id: 2, data: '2026-05-06', plataforma: 'Facebook', tipo: 'Carrossel', status: 'Em revisão', titulo: 'Bastidores produção' },
  { id: 3, data: '2026-05-08', plataforma: 'Instagram', tipo: 'Story', status: 'Aprovado', titulo: 'Cliente do mês' },
  { id: 4, data: '2026-05-10', plataforma: 'LinkedIn', tipo: 'Post', status: 'Aprovado', titulo: 'Case de sucesso Q1' },
  { id: 5, data: '2026-05-12', plataforma: 'Instagram', tipo: 'Reel', status: 'Pendente', titulo: 'Trending audio - Tutorial' },
  { id: 6, data: '2026-05-15', plataforma: 'Facebook', tipo: 'Vídeo', status: 'Aprovado', titulo: 'Live com especialista' },
  { id: 7, data: '2026-05-18', plataforma: 'Instagram', tipo: 'Carrossel', status: 'Em revisão', titulo: 'Dicas do setor' },
  { id: 8, data: '2026-05-20', plataforma: 'TikTok', tipo: 'Vídeo', status: 'Pendente', titulo: 'Behind the scenes' },
];

export const kpis = {
  investimento: 'R$ 12.450,00',
  leads: 287,
  cpl: 'R$ 43,38',
  roas: '4.2x'
};

export const dadosGrafico = Array.from({ length: 30 }, (_, i) => {
  const dia = String(i + 1).padStart(2, '0');
  return {
    dia: `${dia}/05`,
    leads: Math.floor(Math.random() * 20) + 5,
    investimento: Math.floor(Math.random() * 500) + 200,
  };
});

export const campanhasAtivas = [
  { nome: 'Mães 2026 - Conv', plataforma: 'Meta Ads', orcamento: 'R$ 200/dia', status: 'Ativa', ctr: '2.1%' },
  { nome: 'Mães 2026 - Vendas', plataforma: 'Meta Ads', orcamento: 'R$ 350/dia', status: 'Ativa', ctr: '1.8%' },
  { nome: 'Remarketing Site', plataforma: 'Google Ads', orcamento: 'R$ 150/dia', status: 'Ativa', ctr: '3.2%' },
  { nome: 'Display Branding', plataforma: 'Google Ads', orcamento: 'R$ 100/dia', status: 'Pausada', ctr: '0.9%' },
  { nome: 'TikTok Awareness', plataforma: 'TikTok', orcamento: 'R$ 250/dia', status: 'Ativa', ctr: '1.5%' },
];

export const contrato = {
  tipo: 'Performance + Social',
  inicio: '2026-01-15',
  fim: '2026-12-31',
  valor_mensal: 'R$ 8.500,00',
  verba_midia: 'R$ 6.000,00 - R$ 12.000,00'
};

export const entregas = [
  { titulo: 'Plano de mídia mensal', prazo: 'até dia 5 de cada mês', status: 'Em dia' },
  { titulo: '6 criativos por semana', prazo: 'semanal', status: 'Em dia' },
  { titulo: 'Relatório de resultados', prazo: 'até dia 10 de cada mês', status: 'Em dia' },
  { titulo: 'Reunião de alinhamento', prazo: 'quinzenal', status: 'Pendente' },
  { titulo: 'Otimização de campanhas', prazo: 'diária', status: 'Em dia' },
  { titulo: 'Copy para aprovação', prazo: 'até 2 dias antes da publicação', status: 'Em dia' },
];

export const arquivosCompartilhados = [
  { nome: 'Plano_Estrategico_2026.pdf', tipo: 'PDF', tamanho: '2.4 MB', data: '2026-04-01' },
  { nome: 'Identidade_Visual_v3.zip', tipo: 'ZIP', tamanho: '45 MB', data: '2026-03-15' },
  { nome: 'Cronograma_Maio_2026.xlsx', tipo: 'XLSX', tamanho: '180 KB', data: '2026-04-28' },
  { nome: 'Briefing_Campanha_Maes.docx', tipo: 'DOCX', tamanho: '1.2 MB', data: '2026-04-20' },
  { nome: 'Resultados_Marco_2026.pdf', tipo: 'PDF', tamanho: '3.1 MB', data: '2026-04-05' },
];

export const driveItens = [
  { nome: 'Materiais de marca', tipo: 'pasta', data: '2026-03-10' },
  { nome: 'Fotos produção', tipo: 'pasta', data: '2026-04-12' },
  { nome: 'Vídeos aprovados', tipo: 'pasta', data: '2026-04-15' },
  { nome: 'Relatórios mensais', tipo: 'pasta', data: '2026-01-05' },
  { nome: 'Logo_Principal.png', tipo: 'arquivo', data: '2026-03-01' },
];
