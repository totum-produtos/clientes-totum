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
    profile_data?: any;
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
            const client = supabase.getSupabaseClient();

            const { data: { user } } = await client.auth.getUser();
            if (user) {
                // Buscar role do usuário
                const { data: roleData } = await client
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();

                setUser({
                    email: user.email!,
                    id: user.id,
                    registered_at: new Date(user.created_at),
                    role: roleData?.role || 'cliente'
                });

                // Buscar perfil do usuário
                const { data: profileData } = await client
                    .from('profiles')
                    .select('id, display_name, avatar_url, bio, telefone, cargo, timezone, idioma, updated_at')
                    .eq('id', user.id)
                    .single();
                setProfile((profileData as Profile) || null);

                // Buscar cliente vinculado ao usuário
                const { data: clientData } = await client
                    .from('portal_client_users')
                    .select('client_id, portal_clients(id, nome, slug, email_responsavel, status, profile_data)')
                    .eq('user_id', user.id)
                    .maybeSingle();

                let clientId: string | null = null;
                if (clientData && (clientData as any).portal_clients) {
                    const pc = (clientData as any).portal_clients;
                    clientId = pc.id;
                    setClient({
                        id: pc.id,
                        nome: pc.nome,
                        slug: pc.slug,
                        email_responsavel: pc.email_responsavel,
                        status: pc.status,
                        profile_data: pc.profile_data,
                    });
                }

                // Buscar dados reais se tiver cliente vinculado
                if (clientId) {
                    const { data: postsData } = await client
                        .from('wanda_posts')
                        .select('id, subject, tipo, published_at, views, likes, engagement_rate')
                        .eq('portal_client_id', clientId)
                        .order('published_at', { ascending: false })
                        .limit(10);
                    setPosts((postsData || []) as WandaPost[]);

                    const { data: tarefasData } = await client
                        .from('tarefas')
                        .select('id, titulo, status, prioridade, data_limite, departamento')
                        .eq('portal_client_id', clientId)
                        .order('created_at', { ascending: false })
                        .limit(10);
                    setTarefas((tarefasData || []) as Tarefa[]);

                    const { data: projetosData } = await client
                        .from('projetos')
                        .select('id, nome, descricao, cor')
                        .eq('portal_client_id', clientId);
                    setProjetos((projetosData || []) as Projeto[]);
                }
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <GlobalContext.Provider value={{ loading, user, profile, client, posts, tarefas, projetos, refreshData: loadData }}>
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
