// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';

type User = {
    email: string;
    id: string;
    registered_at: Date;
};

type PortalClient = {
    id: string;
    nome: string;
    slug: string;
    email_responsavel: string;
    status: string;
} | null;

interface GlobalContextType {
    loading: boolean;
    user: User | null;
    client: PortalClient;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [client, setClient] = useState<PortalClient>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = await createSPASassClient();
                const client = supabase.getSupabaseClient();

                const { data: { user } } = await client.auth.getUser();
                if (user) {
                    setUser({
                        email: user.email!,
                        id: user.id,
                        registered_at: new Date(user.created_at)
                    });

                    // Buscar cliente vinculado ao usuário
                    const { data: clientData } = await client
                        .from('portal_client_users')
                        .select('client_id, portal_clients(id, nome, slug, email_responsavel, status)')
                        .eq('user_id', user.id)
                        .single();

                    if (clientData && (clientData as any).portal_clients) {
                        const pc = (clientData as any).portal_clients;
                        setClient({
                            id: pc.id,
                            nome: pc.nome,
                            slug: pc.slug,
                            email_responsavel: pc.email_responsavel,
                            status: pc.status,
                        });
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

        loadData();
    }, []);

    return (
        <GlobalContext.Provider value={{ loading, user, client }}>
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
