"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { createSPASassClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  FolderOpen,
  Search,
  LayoutGrid,
  List,
  TrendingUp,
  AlertCircle,
  Mail,
  CalendarDays,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  Power,
  PowerOff,
  AlertTriangle,
  X,
  Target,
  Palette,
  Phone,
  Star,
  Award,
  CircleDot,
  Briefcase,
} from 'lucide-react';

type Cliente = {
  id: string;
  nome: string;
  slug: string;
  email_responsavel: string;
  contato_principal: string | null;
  status: string | null;
  created_at: string | null;
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Ativo', bg: 'bg-success-bg', text: 'text-success-text' },
  inactive: { label: 'Inativo', bg: 'bg-surface-strong', text: 'text-body' },
  pending: { label: 'Pendente', bg: 'bg-warning-bg', text: 'text-warning-text' },
};

export default function GestaoClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<(Cliente & { stats?: ClienteStats })[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [clienteSelecionado, setClienteSelecionado] = useState<(Cliente & { stats?: ClienteStats; profile_data?: any }) | null>(null);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<Cliente | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  async function fetchClientes() {
    setLoading(true);
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
    setActionMessage('');
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const matchBusca =
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.email_responsavel.toLowerCase().includes(busca.toLowerCase()) ||
        c.slug.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'todos' ? true : c.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [clientes, busca, filtroStatus]);

  const totalAtivos = clientes.filter((c) => c.status === 'active').length;
  const totalInativos = clientes.filter((c) => c.status === 'inactive').length;
  const totalPendentes = clientes.filter((c) => c.status === 'pending').length;
  const totalComAds = clientes.filter((c) => c.meta_ad_account_id || c.google_customer_id).length;

  async function handleToggleStatus(cliente: Cliente) {
    const novoStatus = cliente.status === 'inactive' ? 'active' : 'inactive';
    const supabase = await createSPASassClient();
    const { error } = await supabase.getSupabaseClient()
      .from('portal_clients')
      .update({ status: novoStatus })
      .eq('id', cliente.id);
    if (error) {
      setActionMessage('Erro ao alterar status: ' + error.message);
    } else {
      setActionMessage(`Cliente ${novoStatus === 'active' ? 'ativado' : 'inativado'} com sucesso!`);
      fetchClientes();
    }
  }

  async function handleDeletar(cliente: Cliente) {
    setDeleteLoading(true);
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();

    // Deleta dados relacionados (nao deleta drive_folder_cliente_id no Google Drive)
    await sb.from('wanda_posts').delete().eq('portal_client_id', cliente.id);
    await sb.from('tarefas').delete().eq('portal_client_id', cliente.id);
    await sb.from('projetos').delete().eq('portal_client_id', cliente.id);
    await sb.from('ad_campaigns').delete().eq('portal_client_id', cliente.id);
    await sb.from('client_profile_changes').delete().eq('portal_client_id', cliente.id);
    await sb.from('notifications').delete().eq('data->>client_id', cliente.id);
    await sb.from('portal_client_users').delete().eq('client_id', cliente.id);

    // Deleta arquivos do storage
    const { data: files } = await sb.storage.from('client_files').list(cliente.id);
    if (files && files.length > 0) {
      await sb.storage.from('client_files').remove(files.map(f => `${cliente.id}/${f.name}`));
    }

    // Deleta o cliente
    const { error } = await sb.from('portal_clients').delete().eq('id', cliente.id);

    if (error) {
      setActionMessage('Erro ao deletar: ' + error.message);
    } else {
      setActionMessage('Cliente deletado com sucesso!');
      setClienteParaDeletar(null);
      fetchClientes();
    }
    setDeleteLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-10 w-10 border-b-2 border-rausch rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Central de Clientes</h1>
          <p className="text-muted">
            {clientes.length} clientes cadastrados · {totalAtivos} ativos
          </p>
        </div>
        <button
          onClick={() => router.push('/app/admin/clientes/novo')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-lg text-sm font-medium hover:bg-rausch-active transition-colors"
        >
          <Building2 className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-surface-soft rounded-lg"><Users className="h-5 w-5 text-rausch" /></div>
            <div>
              <p className="text-sm text-muted">Total</p>
              <p className="text-2xl font-bold">{clientes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-success-bg rounded-lg"><CheckCircle2 className="h-5 w-5 text-success-text" /></div>
            <div>
              <p className="text-sm text-muted">Ativos</p>
              <p className="text-2xl font-bold">{totalAtivos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-warning-bg rounded-lg"><AlertCircle className="h-5 w-5 text-warning-text" /></div>
            <div>
              <p className="text-sm text-muted">Pendentes</p>
              <p className="text-2xl font-bold">{totalPendentes}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-surface-soft rounded-lg"><TrendingUp className="h-5 w-5 text-ink" /></div>
            <div>
              <p className="text-sm text-muted">Com anúncios</p>
              <p className="text-2xl font-bold">{totalComAds}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-soft" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou slug..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rausch bg-canvas"
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'active', 'pending', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filtroStatus === status
                  ? 'bg-rausch text-white'
                  : 'bg-canvas border text-body hover:bg-surface-soft'
              }`}
            >
              {status === 'todos' ? 'Todos' : STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-canvas border rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-surface-strong text-ink' : 'text-muted-soft hover:text-body'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-surface-strong text-ink' : 'text-muted-soft hover:text-body'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((cliente) => {
            const statusCfg = STATUS_CONFIG[cliente.status || 'inactive'];
            return (
              <Card
                key={cliente.id}
                className="cursor-pointer hover:shadow-airbnb transition-shadow group"
                onClick={() => router.push(`/app/admin/clientes/${cliente.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: 'rausch' }}
                      >
                        {cliente.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">{cliente.nome}</p>
                        <p className="text-xs text-muted">@{cliente.slug}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-body">
                      <Mail className="h-3.5 w-3.5 text-muted-soft shrink-0" />
                      <span className="truncate">{cliente.email_responsavel}</span>
                    </div>
                    {cliente.contato_principal && (
                      <div className="flex items-center gap-2 text-sm text-body">
                        <Users className="h-3.5 w-3.5 text-muted-soft shrink-0" />
                        <span className="truncate">{cliente.contato_principal}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-body">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-soft shrink-0" />
                      <span>{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : '—'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-hairline-soft">
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{cliente.stats?.totalPosts || 0}</p>
                      <p className="text-[10px] text-muted uppercase">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{cliente.stats?.totalTarefas || 0}</p>
                      <p className="text-[10px] text-muted uppercase">Tarefas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{cliente.stats?.totalProjetos || 0}</p>
                      <p className="text-[10px] text-muted uppercase">Projetos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-ink">{cliente.stats?.totalCampanhas || 0}</p>
                      <p className="text-[10px] text-muted uppercase">Ads</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {cliente.meta_ad_account_id && (
                      <span className="text-[10px] px-2 py-0.5 bg-surface-soft text-rausch rounded-full">Meta</span>
                    )}
                    {cliente.google_customer_id && (
                      <span className="text-[10px] px-2 py-0.5 bg-success-bg text-success-text rounded-full">Google</span>
                    )}
                    {cliente.drive_folder_cliente_id && (
                      <span className="text-[10px] px-2 py-0.5 bg-warning-bg text-warning-text rounded-full">Drive</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-hairline-soft">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(cliente); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        cliente.status === 'inactive'
                          ? 'bg-success-bg text-success-text hover:bg-success-bg'
                          : 'bg-surface-strong text-body hover:bg-surface-strong'
                      }`}
                    >
                      {cliente.status === 'inactive' ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                      {cliente.status === 'inactive' ? 'Ativar' : 'Inativar'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setClienteParaDeletar(cliente); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-danger-bg text-danger-text rounded-lg text-xs font-medium hover:bg-danger-bg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Deletar
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-canvas border rounded-md overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface-soft text-xs font-medium text-muted uppercase border-b">
            <div className="col-span-3">Cliente</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Contato</div>
            <div className="col-span-1 text-center">Posts</div>
            <div className="col-span-1 text-center">Tarefas</div>
            <div className="col-span-1 text-center">Projetos</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>
          {clientesFiltrados.map((cliente) => {
            const statusCfg = STATUS_CONFIG[cliente.status || 'inactive'];
            return (
              <div
                key={cliente.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b last:border-0 hover:bg-surface-soft transition-colors items-center cursor-pointer"
                onClick={() => router.push(`/app/admin/clientes/${cliente.id}`)}
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-rausch flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{cliente.nome}</p>
                    <p className="text-xs text-muted">@{cliente.slug}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-body truncate">
                  {cliente.email_responsavel}
                </div>
                <div className="col-span-1 text-center text-sm font-medium">{cliente.stats?.totalPosts || 0}</div>
                <div className="col-span-1 text-center text-sm font-medium">{cliente.stats?.totalTarefas || 0}</div>
                <div className="col-span-1 text-center text-sm font-medium">{cliente.stats?.totalProjetos || 0}</div>
                <div className="col-span-2 flex justify-end gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(cliente); }}
                    className="p-1.5 hover:bg-surface-strong rounded"
                    title={cliente.status === 'inactive' ? 'Ativar' : 'Inativar'}
                  >
                    {cliente.status === 'inactive' ? <Power className="h-4 w-4 text-success" /> : <PowerOff className="h-4 w-4 text-muted-soft" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setClienteParaDeletar(cliente); }}
                    className="p-1.5 hover:bg-danger-bg rounded"
                    title="Deletar"
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/app/admin/clientes/${cliente.id}`); }}
                    className="p-1.5 hover:bg-surface-strong rounded"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-soft" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-soft mx-auto mb-3" />
          <p className="text-muted">Nenhum cliente encontrado.</p>
          <p className="text-sm text-muted-soft">Tente ajustar os filtros ou cadastre um novo cliente.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clienteParaDeletar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setClienteParaDeletar(null)}>
          <div className="bg-canvas rounded-md max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 bg-danger-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-danger-text" />
              </div>
              <h3 className="text-lg font-bold text-center text-ink mb-2">Deletar cliente?</h3>
              <p className="text-sm text-muted text-center mb-4">
                Você está prestes a deletar <strong>{clienteParaDeletar.nome}</strong> e <strong>todos os dados</strong> associados (posts, tarefas, projetos, campanhas, arquivos).<br /><br />
                <span className="text-warning-text font-medium">A pasta no Google Drive NÃO será removida.</span>
              </p>
              <div className="bg-warning-bg border border-warning-bg rounded-lg p-3 mb-4">
                <p className="text-xs text-warning-text">Esta ação não pode ser desfeita.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setClienteParaDeletar(null)} className="flex-1 py-2.5 px-4 border rounded-lg text-sm font-medium text-body hover:bg-surface-soft transition-colors">
                  Cancelar
                </button>
                <button onClick={() => handleDeletar(clienteParaDeletar)} disabled={deleteLoading} className="flex-1 py-2.5 px-4 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger-text disabled:opacity-50 transition-colors">
                  {deleteLoading ? 'Deletando...' : 'Sim, deletar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal / Dashboard */}
      {clienteSelecionado && <ClienteDashboard cliente={clienteSelecionado} onClose={() => setClienteSelecionado(null)} />}
    </div>
  );
}

function ClienteDashboard({ cliente, onClose }: { cliente: any; onClose: () => void }) {
  const [fullData, setFullData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pd = fullData?.profile_data || {};

  useEffect(() => {
    async function load() {
      const supabase = await createSPASassClient();
      const { data } = await supabase.getSupabaseClient()
        .from('portal_clients')
        .select('*')
        .eq('id', cliente.id)
        .single();
      setFullData(data);
      setLoading(false);
    }
    load();
  }, [cliente.id]);

  const statusCfg = STATUS_CONFIG[cliente.status] || STATUS_CONFIG.inactive;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-canvas rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-canvas border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-rausch flex items-center justify-center text-white font-bold text-lg">
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">{cliente.nome}</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>{statusCfg.label}</span>
                <span className="text-xs text-muted-soft">@{cliente.slug}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-strong rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-soft" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-surface-soft p-4 rounded-md text-center">
                <FileText className="h-5 w-5 text-rausch mx-auto mb-1" />
                <p className="text-2xl font-bold">{cliente.stats?.totalPosts || 0}</p>
                <p className="text-[10px] text-muted uppercase">Posts</p>
              </div>
              <div className="bg-surface-soft p-4 rounded-md text-center">
                <CheckCircle2 className="h-5 w-5 text-success-text mx-auto mb-1" />
                <p className="text-2xl font-bold">{cliente.stats?.totalTarefas || 0}</p>
                <p className="text-[10px] text-muted uppercase">Tarefas</p>
              </div>
              <div className="bg-surface-soft p-4 rounded-md text-center">
                <FolderOpen className="h-5 w-5 text-rausch mx-auto mb-1" />
                <p className="text-2xl font-bold">{cliente.stats?.totalProjetos || 0}</p>
                <p className="text-[10px] text-muted uppercase">Projetos</p>
              </div>
              <div className="bg-surface-soft p-4 rounded-md text-center">
                <TrendingUp className="h-5 w-5 text-ink mx-auto mb-1" />
                <p className="text-2xl font-bold">{cliente.stats?.totalCampanhas || 0}</p>
                <p className="text-[10px] text-muted uppercase">Campanhas</p>
              </div>
            </div>

            {/* Info sections */}
            <div className="space-y-4">
              <DashSection icon={Building2} title="Informações da Empresa">
                <DashGrid items={[
                  { label: 'Nome', value: fullData?.nome },
                  { label: 'CNPJ', value: fullData?.cnpj },
                  { label: 'Responsável', value: fullData?.nome_responsavel },
                  { label: 'Email', value: fullData?.email_responsavel },
                  { label: 'Telefone', value: fullData?.telefone },
                  { label: 'Site', value: fullData?.site },
                ]} />
              </DashSection>

              <DashSection icon={Briefcase} title="Sobre o Negócio">
                <DashGrid items={[
                  { label: 'Ramo', value: fullData?.ramo_atuacao },
                  { label: 'Tempo de mercado', value: fullData?.tempo_mercado },
                  { label: 'Tamanho', value: fullData?.tamanho_empresa },
                  { label: 'Faturamento', value: fullData?.faturamento_mensal },
                ]} />
                <DashText label="Descrição" value={fullData?.descricao_negocio} />
                <DashText label="Produtos/Serviços" value={fullData?.produtos_servicos} />
              </DashSection>

              <DashSection icon={Target} title="Público-Alvo">
                <DashGrid items={[
                  { label: 'Nicho', value: pd.nicho_principal },
                  { label: 'Gênero', value: pd.genero_alvo },
                  { label: 'Localização', value: pd.localizacao_alvo },
                  { label: 'Tom de voz', value: pd.tom_voz },
                ]} />
                <DashText label="Dores principais" value={pd.dores_principais} />
                <DashText label="Desejos/Objetivos" value={pd.desejos_objetivos} />
              </DashSection>

              <DashSection icon={Palette} title="Identidade Visual">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <span className="text-xs text-muted-soft uppercase">Cor primária</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: fullData?.cor_primaria || 'rausch' }} />
                      <span className="text-sm font-mono text-ink">{fullData?.cor_primaria || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-soft uppercase">Cor secundária</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: fullData?.cor_secundaria || '#1a1a2e' }} />
                      <span className="text-sm font-mono text-ink">{fullData?.cor_secundaria || '—'}</span>
                    </div>
                  </div>
                </div>
                <DashText label="Fontes" value={pd.fontes} />
                <DashText label="Personalidade visual" value={pd.personalidade_visual} />
              </DashSection>

              <DashSection icon={Phone} title="Operação e Contatos">
                <DashGrid items={[
                  { label: 'CRM', value: pd.crm_utilizado },
                  { label: 'SLA', value: pd.sla_resposta },
                  { label: 'Horário', value: pd.horario_inicio && pd.horario_fim ? `${pd.horario_inicio} - ${pd.horario_fim}` : '' },
                  { label: 'Dias', value: pd.dias_atendimento?.join(', ') },
                ]} />
                <DashText label="Informações adicionais" value={pd.informacoes_adicionais} />
              </DashSection>

              <DashSection icon={CircleDot} title="Círculo Dourado">
                <DashText label="Porquê" value={pd.circulo_dourado?.porque} />
                <DashText label="O que" value={pd.circulo_dourado?.o_que} />
                <DashText label="Como" value={pd.circulo_dourado?.como} />
              </DashSection>

              <DashSection icon={Star} title="Características da Marca">
                <DashText label="Missão" value={pd.caracteristicas_marca?.missao} />
                <DashText label="Visão" value={pd.caracteristicas_marca?.visao} />
                <DashText label="Valores" value={pd.caracteristicas_marca?.valores} />
                <DashText label="Personalidade" value={pd.caracteristicas_marca?.personalidade} />
              </DashSection>

              <DashSection icon={Award} title="Proposta Única de Valor">
                <DashText label="PUV" value={pd.puv} />
              </DashSection>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DashSection({ icon: Icon, title, children }: any) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-soft border-b">
        <Icon className="w-4 h-4 text-rausch" />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DashGrid({ items }: { items: { label: string; value: any }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      {items.map((item, i) => (
        <div key={i}>
          <span className="text-xs text-muted-soft uppercase">{item.label}</span>
          <p className="text-sm text-ink">{item.value || <span className="text-muted-soft">—</span>}</p>
        </div>
      ))}
    </div>
  );
}

function DashText({ label, value }: { label: string; value: any }) {
  if (!value) return null;
  return (
    <div className="mb-3 last:mb-0">
      <span className="text-xs text-muted-soft uppercase">{label}</span>
      <p className="text-sm text-ink mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
