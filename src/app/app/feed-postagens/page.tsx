"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { differenceInHours } from 'date-fns';
import {
  CalendarDays,
  Eye,
  Heart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Hash,
  Clock,
  Target,
  HelpCircle,
  Wrench,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

type Post = {
  id: number;
  subject: string;
  tipo: string;
  published_at: string;
  views: number | null;
  likes: number | null;
  engagement_rate: number | null;
  conversion_rate: number | null;
  created_at: string;
};

// Círculo Dourado do Simon Sinek: Porquê → O que → Como
const circuloDourado: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; desc: string }> = {
  porque: {
    label: 'Porquê',
    color: 'text-warning-text',
    bg: 'bg-warning-bg',
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    desc: 'Propósito, causa, crença',
  },
  oque: {
    label: 'O que',
    color: 'text-success-text',
    bg: 'bg-success-bg',
    icon: <Target className="h-3.5 w-3.5" />,
    desc: 'Produto, serviço, resultado',
  },
  como: {
    label: 'Como',
    color: 'text-muted',
    bg: 'bg-surface-soft',
    icon: <Wrench className="h-3.5 w-3.5" />,
    desc: 'Processo, diferencial, método',
  },
};

function formatarData(dataStr: string) {
  const data = parseISO(dataStr);
  if (isToday(data)) return 'Hoje';
  if (isTomorrow(data)) return 'Amanhã';
  if (isYesterday(data)) return 'Ontem';
  return format(data, "dd 'de' MMMM", { locale: ptBR });
}

function formatarDataCompleta(dataStr: string) {
  return format(parseISO(dataStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export default function FeedPostagensPage() {
  const { client } = useGlobal();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroBusca, setFiltroBusca] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      if (!client) return;
      setLoading(true);
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();

      const inicio = startOfMonth(mesAtual).toISOString();
      const fim = endOfMonth(mesAtual).toISOString();

      const { data, error } = await sb
        .from('wanda_posts')
        .select('id, subject, tipo, published_at, views, likes, engagement_rate, conversion_rate, created_at')
        .eq('portal_client_id', client.id)
        .gte('published_at', inicio)
        .lte('published_at', fim)
        .order('published_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    }
    fetchPosts();
  }, [client, mesAtual]);

  const postsFiltrados = useMemo(() => {
    return posts.filter((p) => {
      const matchTipo = filtroTipo === 'todos' ? true : p.tipo === filtroTipo;
      const matchBusca = filtroBusca === '' ? true : p.subject.toLowerCase().includes(filtroBusca.toLowerCase());
      return matchTipo && matchBusca;
    });
  }, [posts, filtroTipo, filtroBusca]);

  const postsPorDia = useMemo(() => {
    const grupos: Record<string, Post[]> = {};
    postsFiltrados.forEach((post) => {
      const chave = post.published_at.split('T')[0];
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(post);
    });
    return Object.entries(grupos).sort(([a], [b]) => b.localeCompare(a));
  }, [postsFiltrados]);

  const distribuicaoCD = useMemo(() => {
    const dist = { porque: 0, oque: 0, como: 0, outros: 0 };
    postsFiltrados.forEach((p) => {
      if (p.tipo === 'porque') dist.porque++;
      else if (p.tipo === 'oque') dist.oque++;
      else if (p.tipo === 'como') dist.como++;
      else dist.outros++;
    });
    return dist;
  }, [postsFiltrados]);

  const totalViews = postsFiltrados.reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = postsFiltrados.reduce((s, p) => s + (p.likes || 0), 0);
  const avgEngagement = postsFiltrados.length > 0
    ? (postsFiltrados.reduce((s, p) => s + (p.engagement_rate || 0), 0) / postsFiltrados.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 p-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Feed de Postagens</h1>
          <p className="text-muted">Visão em lista do calendário de conteúdo</p>
        </div>
        <div className="flex items-center gap-2 bg-canvas rounded-lg border px-3 py-2">
          <button onClick={() => setMesAtual(subMonths(mesAtual, 1))} className="p-1 hover:bg-surface-strong rounded">
            <ChevronLeft className="h-4 w-4 text-body" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center capitalize">
            {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={() => setMesAtual(addMonths(mesAtual, 1))} className="p-1 hover:bg-surface-strong rounded">
            <ChevronRight className="h-4 w-4 text-body" />
          </button>
        </div>
      </div>

      {/* Barra Círculo Dourado - distribuição */}
      <div className="bg-canvas border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-ink">Círculo Dourado do Mês</h3>
          <span className="text-xs text-muted-soft">Simon Sinek</span>
        </div>
        <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden">
          {distribuicaoCD.porque > 0 && (
            <div
              className="h-full bg-amber-400"
              style={{ width: `${(distribuicaoCD.porque / postsFiltrados.length) * 100}%` }}
              title={`Porquê: ${distribuicaoCD.porque}`}
            />
          )}
          {distribuicaoCD.oque > 0 && (
            <div
              className="h-full bg-success"
              style={{ width: `${(distribuicaoCD.oque / postsFiltrados.length) * 100}%` }}
              title={`O que: ${distribuicaoCD.oque}`}
            />
          )}
          {distribuicaoCD.como > 0 && (
            <div
              className="h-full bg-legal-link"
              style={{ width: `${(distribuicaoCD.como / postsFiltrados.length) * 100}%` }}
              title={`Como: ${distribuicaoCD.como}`}
            />
          )}
          {distribuicaoCD.outros > 0 && (
            <div
              className="h-full bg-hairline"
              style={{ width: `${(distribuicaoCD.outros / postsFiltrados.length) * 100}%` }}
              title={`Outros: ${distribuicaoCD.outros}`}
            />
          )}
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-body">Porquê ({distribuicaoCD.porque})</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-body">O que ({distribuicaoCD.oque})</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-legal-link" />
            <span className="text-body">Como ({distribuicaoCD.como})</span>
          </div>
        </div>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-canvas border rounded-lg p-3 text-center">
          <p className="text-xs text-muted uppercase">Posts</p>
          <p className="text-xl font-bold text-ink">{postsFiltrados.length}</p>
        </div>
        <div className="bg-canvas border rounded-lg p-3 text-center">
          <p className="text-xs text-muted uppercase">Views</p>
          <p className="text-xl font-bold text-ink">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-canvas border rounded-lg p-3 text-center">
          <p className="text-xs text-muted uppercase">Engajamento</p>
          <p className="text-xl font-bold text-ink">{avgEngagement}%</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft" />
          <input
            type="text"
            placeholder="Buscar por assunto..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rausch bg-canvas"
          />
        </div>
        <div className="flex gap-2">
          {(['todos', 'porque', 'oque', 'como'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filtroTipo === tipo
                  ? 'bg-ink text-white'
                  : 'bg-canvas border text-body hover:bg-surface-soft'
              }`}
            >
              {tipo === 'todos' ? 'Todos' : circuloDourado[tipo]?.label || tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-b-2 border-rausch rounded-full" />
        </div>
      ) : postsPorDia.length === 0 ? (
        <div className="text-center py-16 bg-canvas border rounded-md">
          <CalendarDays className="h-12 w-12 text-muted-soft mx-auto mb-3" />
          <p className="text-muted">Nenhuma postagem encontrada.</p>
          <p className="text-sm text-muted-soft mt-1">
            {filtroTipo !== 'todos' || filtroBusca ? 'Tente ajustar os filtros.' : 'Nenhum post agendado para este mês.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {postsPorDia.map(([dataKey, postsDoDia]) => {
            const data = parseISO(dataKey);
            return (
              <div key={dataKey}>
                {/* Separador de data */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-strong text-ink font-bold text-sm">
                    {format(data, 'dd')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink capitalize">{formatarData(dataKey)}</p>
                    <p className="text-xs text-muted">{format(data, 'EEEE', { locale: ptBR })}</p>
                  </div>
                  <div className="flex-1 h-px bg-surface-strong" />
                  <span className="text-xs text-muted-soft bg-surface-soft px-2 py-1 rounded-full">
                    {postsDoDia.length} post{postsDoDia.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3 pl-2">
                  {postsDoDia.map((post) => {
                    const tipo = circuloDourado[post.tipo] || {
                      label: post.tipo,
                      color: 'text-ink',
                      bg: 'bg-surface-strong',
                      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                      desc: '',
                    };
                    return (
                      <div key={post.id} className="bg-canvas border rounded-md p-4 hover:shadow-airbnb transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${tipo.bg} ${tipo.color}`}>
                                {tipo.icon}
                                {tipo.label}
                              </span>
                              {differenceInHours(new Date(), parseISO(post.created_at)) <= 24 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-surface-soft text-ink">
                                  <Sparkles className="h-3 w-3" />
                                  Novo
                                </span>
                              )}
                              <span className="text-[10px] text-muted-soft flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatarDataCompleta(post.published_at)}
                              </span>
                              {tipo.desc && (
                                <span className="text-[10px] text-muted-soft hidden sm:inline">· {tipo.desc}</span>
                              )}
                            </div>
                            <h3 className="text-base font-medium text-ink leading-snug">{post.subject}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-hairline-soft">
                          <div className="flex items-center gap-1.5 text-sm text-body">
                            <Eye className="h-4 w-4 text-muted-soft" />
                            <span className="font-medium">{post.views || 0}</span>
                            <span className="text-xs text-muted-soft">views</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-body">
                            <Heart className="h-4 w-4 text-muted-soft" />
                            <span className="font-medium">{post.likes || 0}</span>
                            <span className="text-xs text-muted-soft">likes</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-body">
                            <BarChart3 className="h-4 w-4 text-muted-soft" />
                            <span className="font-medium">{post.engagement_rate || 0}%</span>
                            <span className="text-xs text-muted-soft">engajamento</span>
                          </div>
                          {post.conversion_rate ? (
                            <div className="flex items-center gap-1.5 text-sm text-body">
                              <Target className="h-4 w-4 text-muted-soft" />
                              <span className="font-medium">{post.conversion_rate}%</span>
                              <span className="text-xs text-muted-soft">conversão</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
