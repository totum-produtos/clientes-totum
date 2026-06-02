// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/types';

type User = {
    email: string;
    id: string;
    registered_at: Date;
    role: string;
};

type Profile = Tables<'profiles'> | null;

type PortalClient = {
    id: string;
    nome: string;
    slug: string;
    email_responsavel: string;
    status: string;
    profile_data?: Record<string, unknown>;
} | null;

type WandaPost = Tables<'wanda_posts'>;

type Tarefa = Tables<'tarefas'>;

type Projeto = Tables<'projetos'>;

interface GlobalContextType {
    loading: boolean;
    user: User | null;
    profile: Profile;
    client: PortalClient;
    posts: WandaPost[];
    tarefas: Tarefa[];
    projetos: Projeto[];
    refreshData: () => Promise<void>;
    setSpoofedClient: (id: string | null) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [client, setClient] = useState<PortalClient>(null);
    const [posts, setPosts] = useState<WandaPost[]>([]);
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [profile, setProfile] = useState<Profile>(null);

    async function loadData() {
        try {
            const supabase = await createSPASassClient();
            const sb = supabase.getSupabaseClient();

            // FASE A — auth (1 roundtrip)
            const { data: { user } } = await sb.auth.getUser();
            if (!user) throw new Error('User not found');

            // FASE B — role + profile + vínculo de cliente em paralelo (1 roundtrip combinado)
            const [roleRes, profileRes, linkRes] = await Promise.all([
                sb.from('user_roles').select('role').eq('user_id', user.id).single(),
                sb.from('profiles')
                  .select('id, display_name, avatar_url, bio, telefone, cargo, timezone, idioma, updated_at')
                  .eq('id', user.id).single(),
                sb.from('portal_client_users').select('client_id').eq('user_id', user.id).maybeSingle(),
            ]);

            const role = roleRes.data?.role || 'cliente';
            setUser({
                email: user.email!,
                id: user.id,
                registered_at: new Date(user.created_at),
                role,
            });
            setProfile((profileRes.data as Profile) || null);

            // Spoofing master/admin tem precedência sobre vínculo real
            let clientId: string | null = null;
            if (role === 'master' || role === 'admin') {
                clientId = localStorage.getItem('totum_spoofed_client_id');
            }
            if (!clientId && role === 'cliente') {
                clientId = linkRes.data?.client_id ?? null;
            }

            if (!clientId) {
                setClient(null);
                setPosts([]);
                setTarefas([]);
                setProjetos([]);
                return;
            }

            // FASE C — portal_client + posts + tarefas + projetos em paralelo (1 roundtrip combinado)
            const [pcRes, postsRes, tarefasRes, projetosRes] = await Promise.all([
                sb.from('portal_clients')
                  .select('id, nome, slug, email_responsavel, status, profile_data')
                  .eq('id', clientId).maybeSingle(),
                sb.from('wanda_posts')
                  .select('id, subject, tipo, published_at, views, likes, engagement_rate')
                  .eq('portal_client_id', clientId)
                  .order('published_at', { ascending: false }).limit(10),
                sb.from('tarefas')
                  .select('id, titulo, status, prioridade, data_limite, departamento')
                  .eq('portal_client_id', clientId)
                  .order('created_at', { ascending: false }).limit(10),
                sb.from('projetos')
                  .select('id, nome, descricao, cor')
                  .eq('portal_client_id', clientId),
            ]);

            const pc = pcRes.data;
            if (pc) {
                setClient({
                    id: pc.id,
                    nome: pc.nome,
                    slug: pc.slug,
                    email_responsavel: pc.email_responsavel || '',
                    status: pc.status || '',
                    profile_data: pc.profile_data as Record<string, unknown> | undefined,
                });
            } else {
                setClient(null);
            }
            setPosts((postsRes.data || []) as WandaPost[]);
            setTarefas((tarefasRes.data || []) as Tarefa[]);
            setProjetos((projetosRes.data || []) as Projeto[]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSetSpoofedClient = (id: string | null) => {
        if (id) {
            localStorage.setItem('totum_spoofed_client_id', id);
        } else {
            localStorage.removeItem('totum_spoofed_client_id');
        }
        loadData();
    };

    return (
        <GlobalContext.Provider value={{ loading, user, profile, client, posts, tarefas, projetos, refreshData: loadData, setSpoofedClient: handleSetSpoofedClient }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};
