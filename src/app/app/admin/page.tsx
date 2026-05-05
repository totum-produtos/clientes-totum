"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createSPASassClient } from '@/lib/supabase/client';
import { Plus, Link2, Users, Building2 } from 'lucide-react';

type PortalClient = {
    id: string;
    nome: string;
    slug: string;
    email_responsavel: string;
    status: string;
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

export default function AdminPage() {
    const [clients, setClients] = useState<PortalClient[]>([]);
    const [users, setUsers] = useState<PortalUser[]>([]);
    const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [linkOpen, setLinkOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [message, setMessage] = useState('');

    const [newClient, setNewClient] = useState({ nome: '', slug: '', email_responsavel: '' });

    async function fetchData() {
        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();

        const { data: clientsData } = await client.from('portal_clients').select('*').order('created_at', { ascending: false });
        setClients(clientsData || []);

        const { data: usersData } = await client.from('portal_client_users').select('*');
        setUsers(usersData || []);

        // Buscar auth users via admin API (service role)
        const { data: authData } = await client.auth.admin.listUsers();
        setAuthUsers(authData?.users?.map(u => ({ id: u.id, email: u.email || '', created_at: u.created_at })) || []);

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

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>;
    }

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
                <p className="text-gray-500">Gerenciar clientes e acessos do portal</p>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Clientes */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary-600" />
                        Clientes do portal ({clients.length})
                    </CardTitle>
                    <button onClick={() => setFormOpen(!formOpen)} className="btn-primary px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Novo cliente
                    </button>
                </CardHeader>
                <CardContent>
                    {formOpen && (
                        <form onSubmit={handleCreateClient} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <h3 className="font-medium text-sm">Novo cliente</h3>
                            <input required placeholder="Nome do cliente" value={newClient.nome} onChange={e => setNewClient({...newClient, nome: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            <input required placeholder="Slug (ex: cliente-xyz)" value={newClient.slug} onChange={e => setNewClient({...newClient, slug: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            <input required type="email" placeholder="Email responsável" value={newClient.email_responsavel} onChange={e => setNewClient({...newClient, email_responsavel: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
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
                                    <p className="text-xs text-gray-500">{c.slug} • {c.email_responsavel}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {c.status}
                                </span>
                            </div>
                        ))}
                        {clients.length === 0 && <p className="text-sm text-gray-400">Nenhum cliente cadastrado.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Vinculações */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-primary-600" />
                        Usuários vinculados ({users.length})
                    </CardTitle>
                    <button onClick={() => setLinkOpen(!linkOpen)} className="btn-primary px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Vincular usuário
                    </button>
                </CardHeader>
                <CardContent>
                    {linkOpen && (
                        <form onSubmit={handleLinkUser} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <h3 className="font-medium text-sm">Vincular usuário a cliente</h3>
                            <select required value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                                <option value="">Selecione o cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                            <select required value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
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
                                        <p className="text-xs text-gray-500">Cliente: {client?.nome || 'Desconhecido'}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700">{u.role}</span>
                                </div>
                            );
                        })}
                        {users.length === 0 && <p className="text-sm text-gray-400">Nenhum vínculo criado.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Auth Users */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary-600" />
                        Usuários do Supabase Auth ({authUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {authUsers.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="font-medium text-sm">{u.email}</p>
                                <p className="text-xs text-gray-500">ID: {u.id.slice(0, 8)}...</p>
                            </div>
                            {users.some(vu => vu.user_id === u.id) ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Vinculado</span>
                            ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Não vinculado</span>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
