"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createSPASassClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  FolderOpen,
  Search,
  ArrowUpRight,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  Mail,
  CalendarDays,
} from 'lucide-react';

type Cliente = {
  id: string;
  nome: string;
  slug: string;
  email_responsavel: string;
  contato_principal: string | null;
  status: string;
  created_at: string;
  upixel_tenant_id: string | null;
  meta_ad_account_id: string | null;
  google_customer_id: string | null;
  drive_folder_cliente_id: string | null;
};

type ClienteStats = {
  totalPosts: number;
  totalTarefas: number;
  totalProjetos: number;
  totalCampanhas: number;
};

export default function GestaoClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<(Cliente & { stats?: ClienteStats })[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'active' | 'inactive'>('todos');
  const [clienteSelecionado, setClienteSelecionado] = useState<(Cliente & { stats?: ClienteStats }) | null>(null);

  useEffect(() => {
    async function fetchClientes() {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();

      const { data: clientesData, error } = await sb
        .from('portal_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !clientesData) {
        setLoading(false);
        return;
      }

      const clientesComStats = await Promise.all(
        clientesData.map(async (cliente: Cliente) => {
          const [posts, tarefas, projetos, campanhas] = await Promise.all([
            sb.from('wanda_posts').select('id', { count: 'exact', head: true }).eq('portal_client_id', cliente.id),
            sb.from('tarefas').select('id', { count: 'exact', head: true }).eq('portal_client_id', cliente.id),
            sb.from('projetos').select('id', { count: 'exact', head: true }).eq('portal_client_id', cliente.id),
            sb.from('ad_campaigns').select('id', { count: 'exact', head: true }).eq('portal_client_id', cliente.id),
          ]);

          return {
            ...cliente,
            stats: {
              totalPosts: posts.count || 0,
              totalTarefas: tarefas.count || 0,
              totalProjetos: projetos.count || 0,
              totalCampanhas: campanhas.count || 0,
            },
          };
        })
      );

      setClientes(clientesComStats);
      setLoading(false);
    }

    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const matchBusca =
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.email_responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      c.slug.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' ? true : c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const totalAtivos = clientes.filter((c) => c.status === 'active').length;
  const totalInativos = clientes.filter((c) => c.status === 'inactive').length;
  const totalComAds = clientes.filter((c) => c.meta_ad_account_id || c.google_customer_id).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-10 w-10 border-b-2 border-[#d81220] rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Central de Clientes</h1>
          <p className="text-gray-500">Gestão completa da base de clientes Totum</p>
        </div>
        <button
          onClick={() => router.push('/app/admin')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#d81220] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] transition-colors"
        >
          <Building2 className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Total de clientes</p>
              <p className="text-2xl font-bold">{clientes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Ativos</p>
              <p className="text-2xl font-bold">{totalAtivos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg"><AlertCircle className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Inativos</p>
              <p className="text-2xl font-bold">{totalInativos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm text-gray-500">Com anúncios</p>
              <p className="text-2xl font-bold">{totalComAds}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou slug..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d81220]"
          />
        </div>
        <div className="flex gap-2">
          {(['todos', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filtroStatus === status
                  ? 'bg-[#d81220] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'todos' ? 'Todos' : status === 'active' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de clientes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientesFiltrados.map((cliente) => (
          <Card
            key={cliente.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setClienteSelecionado(cliente)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d81220] to-[#b91c1c] flex items-center justify-center text-white font-bold text-sm">
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cliente.nome}</p>
                    <p className="text-xs text-gray-500">@{cliente.slug}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    cliente.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cliente.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {cliente.email_responsavel}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                  {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Stats mini */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{cliente.stats?.totalPosts || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{cliente.stats?.totalTarefas || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Tarefas</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{cliente.stats?.totalProjetos || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Projetos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{cliente.stats?.totalCampanhas || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Ads</p>
                </div>
              </div>

              {/* Integrações badges */}
              <div className="flex gap-2 mt-3">
                {cliente.meta_ad_account_id && (
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Meta</span>
                )}
                {cliente.google_customer_id && (
                  <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Google</span>
                )}
                {cliente.drive_folder_cliente_id && (
                  <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Drive</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
          <p className="text-sm text-gray-400">Tente ajustar os filtros ou cadastre um novo cliente.</p>
        </div>
      )}

      {/* Modal de detalhes */}
      {clienteSelecionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setClienteSelecionado(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d81220] to-[#b91c1c] flex items-center justify-center text-white font-bold text-lg">
                    {clienteSelecionado.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{clienteSelecionado.nome}</h2>
                    <p className="text-sm text-gray-500">@{clienteSelecionado.slug}</p>
                  </div>
                </div>
                <button onClick={() => setClienteSelecionado(null)} className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{clienteSelecionado.email_responsavel}</span>
                </div>
                {clienteSelecionado.contato_principal && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{clienteSelecionado.contato_principal}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Cliente desde {new Date(clienteSelecionado.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <FileText className="h-5 w-5 text-[#d81220] mx-auto mb-1" />
                  <p className="text-xl font-bold">{clienteSelecionado.stats?.totalPosts || 0}</p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold">{clienteSelecionado.stats?.totalTarefas || 0}</p>
                  <p className="text-xs text-gray-500">Tarefas</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <FolderOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold">{clienteSelecionado.stats?.totalProjetos || 0}</p>
                  <p className="text-xs text-gray-500">Projetos</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xl font-bold">{clienteSelecionado.stats?.totalCampanhas || 0}</p>
                  <p className="text-xs text-gray-500">Campanhas</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setClienteSelecionado(null);
                    router.push('/app/admin');
                  }}
                  className="flex-1 py-2 px-4 bg-[#d81220] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] transition-colors"
                >
                  Gerenciar no Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
