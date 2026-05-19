"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createSPASassClient } from '@/lib/supabase/client';
import { Plus, Link2, Users, Building2, Clock, CheckCircle, XCircle, Mail, Loader2, Edit3 } from 'lucide-react';
import Link from 'next/link';
import type { Json } from '@/lib/types';

type JsonObject = { [key: string]: Json | undefined };

type PortalClient = {
    id: string;
    nome: string;
    slug: string;
    email_responsavel: string;
    status: string | null;
    created_at: string;
};

type PortalUser = {
    user_id: string;
    client_id: string;
    role: string;
    email?: string;
};

type AuthUser = {
    id: string;
    email: string;
    created_at: string;
};

type ProfileChange = {
    id: string;
    portal_client_id: string;
    requested_by: string;
    field_path: string;
    old_value: string;
    new_value: string;
    status: string;
    created_at: string;
    reviewed_by?: string;
    reviewed_at?: string;
};

function parseProfileValue(value: string): Json {
    try {
        return JSON.parse(value) as Json;
    } catch {
        return value;
    }
}

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Erro desconhecido';
}

export default function AdminPage() {
    const [clients, setClients] = useState<PortalClient[]>([]);
    const [users, setUsers] = useState<PortalUser[]>([]);
    const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
    const [pendingChanges, setPendingChanges] = useState<ProfileChange[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [linkOpen, setLinkOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [message, setMessage] = useState('');

    const [newClient, setNewClient] = useState({ nome: '', slug: '', email_responsavel: '' });
    const [sendingInvite, setSendingInvite] = useState<string | null>(null);

    async function fetchData() {
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();

        const { data: clientsData } = await client.from('portal_clients').select('*').order('created_at', { ascending: false });
        setClients((clientsData || []) as PortalClient[]);

        const { data: usersData } = await client.from('portal_client_users').select('*');
        setUsers(usersData || []);

        // Buscar auth users via admin API (service role)
        const { data: authData } = await client.auth.admin.listUsers();
        setAuthUsers(authData?.users?.map(u => ({ id: u.id, email: u.email || '', created_at: u.created_at })) || []);

        const { data: changesData } = await client.from('client_profile_changes').select('*').eq('status', 'pendente').order('created_at', { ascending: false });
        setPendingChanges((changesData || []) as ProfileChange[]);

        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleCreateClient(e: React.FormEvent) {
        e.preventDefault();
        setMessage('');
        const supabase = await createSPASassClient();
        const { error } = await supabase.getSupabaseClient().from('portal_clients').insert({
            nome: newClient.nome,
            slug: newClient.slug.toLowerCase().replace(/\s+/g, '-'),
            email_responsavel: newClient.email_responsavel,
            status: 'active',
        });
        if (error) {
            setMessage('Erro: ' + error.message);
        } else {
            setMessage('Cliente criado com sucesso!');
            setNewClient({ nome: '', slug: '', email_responsavel: '' });
            setFormOpen(false);
            fetchData();
        }
    }

    async function handleLinkUser(e: React.FormEvent) {
        e.preventDefault();
        setMessage('');
        const supabase = await createSPASassClient();
        const { error } = await supabase.getSupabaseClient().from('portal_client_users').insert({
            user_id: selectedUser,
            client_id: selectedClient,
            role: 'cliente',
        });
        if (error) {
            setMessage('Erro: ' + error.message);
        } else {
            setMessage('Usuário vinculado com sucesso!');
            setLinkOpen(false);
            fetchData();
        }
    }

    async function handleApproveAll() {
        if (pendingChanges.length === 0) return;
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();
        
        let successCount = 0;
        for (const change of pendingChanges) {
            try {
                if (change.field_path.startsWith('profile_data.')) {
                    const field = change.field_path.replace('profile_data.', '');
                    const { data: pc } = await client.from('portal_clients').select('profile_data').eq('id', change.portal_client_id).single();
                    const current = (pc?.profile_data || {}) as JsonObject;
                    const newVal = parseProfileValue(change.new_value);
                    await client.from('portal_clients').update({ profile_data: { ...current, [field]: newVal } }).eq('id', change.portal_client_id);
                } else {
                    await client.from('portal_clients').update({ [change.field_path]: change.new_value }).eq('id', change.portal_client_id);
                }

                await client.from('client_profile_changes').update({
                    status: 'aprovado',
                    reviewed_at: new Date().toISOString()
                }).eq('id', change.id);

                await client.from('notifications').insert({
                    user_id: change.requested_by,
                    type: 'alteracao_aprovada',
                    title: 'Alteração aprovada',
                    message: `Sua alteração no campo "${change.field_path}" foi aprovada.`,
                    data: { change_id: change.id },
                    read: false
                });
                successCount++;
            } catch (err) {
                console.error("Erro ao aprovar mudança em lote", err);
            }
        }
        
        setMessage(`${successCount} alterações aprovadas com sucesso!`);
        fetchData();
    }

    async function handleApprove(change: ProfileChange) {
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();

        // Aplicar a alteração
        if (change.field_path.startsWith('profile_data.')) {
            const field = change.field_path.replace('profile_data.', '');
            const { data: pc } = await client.from('portal_clients').select('profile_data').eq('id', change.portal_client_id).single();
            const current = (pc?.profile_data || {}) as JsonObject;
            const newVal = parseProfileValue(change.new_value);
            await client.from('portal_clients').update({ profile_data: { ...current, [field]: newVal } }).eq('id', change.portal_client_id);
        } else {
            await client.from('portal_clients').update({ [change.field_path]: change.new_value }).eq('id', change.portal_client_id);
        }

        // Atualizar status
        await client.from('client_profile_changes').update({
            status: 'aprovado',
            reviewed_at: new Date().toISOString()
        }).eq('id', change.id);

        // Notificar cliente
        await client.from('notifications').insert({
            user_id: change.requested_by,
            type: 'alteracao_aprovada',
            title: 'Alteração aprovada',
            message: `Sua alteração no campo "${change.field_path}" foi aprovada.`,
            data: { change_id: change.id },
            read: false
        });

        setMessage('Alteração aprovada com sucesso!');
        fetchData();
    }

    async function handleSendInvite(clientId: string, email: string) {
        if (!email) {
            setMessage('Erro: Este cliente não tem email responsável cadastrado.');
            return;
        }
        setSendingInvite(clientId);
        setMessage('');
        try {
            const supabase = await createSPASassClient();
            const { data: { session } } = await supabase.getSupabaseClient().auth.getSession();

            const res = await fetch('/api/send-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ client_id: clientId, email })
            });

            const data = await res.json();
            if (res.ok) {
                if (data.messageId) {
                    setMessage('✅ Convite enviado com sucesso para ' + email);
                } else {
                    setMessage('⚠️ Convite criado, mas SMTP não configurado. Copie o link: ' + data.invite_url);
                }
            } else {
                setMessage('Erro ao enviar convite: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (err: unknown) {
            setMessage('Erro ao enviar convite: ' + errorMessage(err));
        } finally {
            setSendingInvite(null);
        }
    }

    async function handleReject(change: ProfileChange) {
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();

        await client.from('client_profile_changes').update({
            status: 'rejeitado',
            reviewed_at: new Date().toISOString()
        }).eq('id', change.id);

        await client.from('notifications').insert({
            user_id: change.requested_by,
            type: 'alteracao_rejeitada',
            title: 'Alteração rejeitada',
            message: `Sua alteração no campo "${change.field_path}" foi rejeitada.`,
            data: { change_id: change.id },
            read: false
        });

        setMessage('Alteração rejeitada.');
        fetchData();
    }

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-rausch rounded-full"></div></div>;
    }

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-ink">Painel Admin</h1>
                <p className="text-muted">Gerenciar clientes e acessos do portal</p>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('sucesso') ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'}`}>
                    {message}
                </div>
            )}

            {/* Alterações Pendentes */}
            {pendingChanges.length > 0 && (
                <Card className="border-warning-bg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-warning-text">
                            <Clock className="h-5 w-5" />
                            Alterações pendentes de aprovação ({pendingChanges.length})
                        </CardTitle>
                        <button onClick={handleApproveAll} className="btn-primary bg-success hover:bg-success-text text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors shadow-sm">
                            <CheckCircle className="w-4 h-4" /> Aprovar Todos
                        </button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingChanges.map(change => {
                            const client = clients.find(c => c.id === change.portal_client_id);
                            const requester = authUsers.find(u => u.id === change.requested_by);
                            return (
                                <div key={change.id} className="p-4 bg-warning-bg rounded-md border border-amber-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-sm text-ink">{client?.nome || 'Cliente desconhecido'}</p>
                                            <p className="text-xs text-muted">Solicitado por: {requester?.email || change.requested_by} • {new Date(change.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-warning-bg text-warning-text font-medium">Pendente</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div className="p-2 bg-canvas rounded-lg text-sm">
                                            <span className="text-xs text-muted-soft uppercase">Campo</span>
                                            <p className="font-medium text-ink">{change.field_path}</p>
                                        </div>
                                        <div className="p-2 bg-canvas rounded-lg text-sm">
                                            <span className="text-xs text-muted-soft uppercase">Valor atual → Novo</span>
                                            <p className="text-ink">
                                                <span className="text-danger-text line-through">{change.old_value || '—'}</span>
                                                <span className="mx-2 text-muted-soft">→</span>
                                                <span className="text-success-text font-medium">{change.new_value || '—'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleApprove(change)} className="flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success-text transition-colors">
                                            <CheckCircle className="w-4 h-4" /> Aprovar
                                        </button>
                                        <button onClick={() => handleReject(change)} className="flex items-center gap-1.5 px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger-text transition-colors">
                                            <XCircle className="w-4 h-4" /> Rejeitar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Clientes */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-rausch" />
                        Clientes do portal ({clients.length})
                    </CardTitle>
                    <button onClick={() => setFormOpen(!formOpen)} className="btn-primary px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Novo cliente
                    </button>
                </CardHeader>
                <CardContent>
                    {formOpen && (
                        <form onSubmit={handleCreateClient} className="mb-4 p-4 bg-surface-soft rounded-lg space-y-3">
                            <h3 className="font-medium text-sm">Novo cliente</h3>
                            <input required placeholder="Nome do cliente" value={newClient.nome} onChange={e => setNewClient({...newClient, nome: e.target.value})} className="w-full px-3 py-2 border rounded-none text-sm" />
                            <input required placeholder="Slug (ex: cliente-xyz)" value={newClient.slug} onChange={e => setNewClient({...newClient, slug: e.target.value})} className="w-full px-3 py-2 border rounded-none text-sm" />
                            <input required type="email" placeholder="Email responsável" value={newClient.email_responsavel} onChange={e => setNewClient({...newClient, email_responsavel: e.target.value})} className="w-full px-3 py-2 border rounded-none text-sm" />
                            <div className="flex gap-2">
                                <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-sm">Criar</button>
                                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg text-sm border">Cancelar</button>
                            </div>
                        </form>
                    )}
                    <div className="space-y-2">
                        {clients.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{c.nome}</p>
                                    <p className="text-xs text-muted">{c.slug} • {c.email_responsavel}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/app/admin/clientes/${c.id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-rausch/30 text-rausch hover:bg-rausch hover:text-white transition-colors"
                                        title="Abrir detalhes e briefing"
                                    >
                                        <Edit3 className="h-3 w-3" />
                                        Ver Briefing
                                    </Link>
                                    <button
                                        onClick={() => handleSendInvite(c.id, c.email_responsavel)}
                                        disabled={sendingInvite === c.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-surface-soft transition-colors disabled:opacity-50"
                                        title="Enviar convite por email"
                                    >
                                        {sendingInvite === c.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Mail className="h-3 w-3" />
                                        )}
                                        Enviar convite
                                    </button>
                                    <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-success-bg text-success-text' : 'bg-surface-strong text-ink'}`}>
                                        {c.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {clients.length === 0 && <p className="text-sm text-muted-soft">Nenhum cliente cadastrado.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Vinculações */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-rausch" />
                        Usuários vinculados ({users.length})
                    </CardTitle>
                    <button onClick={() => setLinkOpen(!linkOpen)} className="btn-primary px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Vincular usuário
                    </button>
                </CardHeader>
                <CardContent>
                    {linkOpen && (
                        <form onSubmit={handleLinkUser} className="mb-4 p-4 bg-surface-soft rounded-lg space-y-3">
                            <h3 className="font-medium text-sm">Vincular usuário a cliente</h3>
                            <select required value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full px-3 py-2 border rounded-none text-sm">
                                <option value="">Selecione o cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                            <select required value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full px-3 py-2 border rounded-none text-sm">
                                <option value="">Selecione o usuário</option>
                                {authUsers.filter(u => !users.some(vu => vu.user_id === u.id)).map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-sm">Vincular</button>
                                <button type="button" onClick={() => setLinkOpen(false)} className="px-4 py-2 rounded-lg text-sm border">Cancelar</button>
                            </div>
                        </form>
                    )}
                    <div className="space-y-2">
                        {users.map((u, i) => {
                            const client = clients.find(c => c.id === u.client_id);
                            const authUser = authUsers.find(au => au.id === u.user_id);
                            return (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">{authUser?.email || u.user_id}</p>
                                        <p className="text-xs text-muted">Cliente: {client?.nome || 'Desconhecido'}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-rausch/5 text-rausch-active">{u.role}</span>
                                </div>
                            );
                        })}
                        {users.length === 0 && <p className="text-sm text-muted-soft">Nenhum vínculo criado.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Auth Users */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-rausch" />
                        Usuários do Supabase Auth ({authUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {authUsers.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="font-medium text-sm">{u.email}</p>
                                <p className="text-xs text-muted">ID: {u.id.slice(0, 8)}...</p>
                            </div>
                            {users.some(vu => vu.user_id === u.id) ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-success-bg text-success-text">Vinculado</span>
                            ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-surface-strong text-muted">Não vinculado</span>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
