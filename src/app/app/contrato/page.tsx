"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { LoadingSpinner, PageLoader } from '@/components/ui/LoadingSpinner';
import { getTarefas } from "@/services/db/content";

type Tarefa = {
    id: string;
    titulo: string;
    status: string;
    prioridade: string;
    data_limite: string | null;
    departamento: string | null;
    descricao: string | null;
};

export default function ContratoPage() {
    const { client, loading: globalLoading, user } = useGlobal();
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [loading, setLoading] = useState(true);

    const isMaster = user?.role === "master" || user?.role === "admin";

    async function fetchTarefas() {
        if (!client) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const supabase = await createSPASassClient();
            const sb = supabase.getSupabaseClient();
            const { data } = await getTarefas(sb, client.id);
            setTarefas(data || []);
        } catch (error) {
            console.error("Critical error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTarefas();
    }, [client]);

    // Realtime subscription: atualiza tarefas sem refresh
    useEffect(() => {
        if (!client) return;
        let channel: RealtimeChannel | null = null;
        let cancelled = false;

        async function setupRealtime() {
            const supabase = await createSPASassClient();
            const clientId = client!.id;
            const sb = supabase.getSupabaseClient();
            const ch = sb
                .channel('tarefas-realtime-' + clientId)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'tarefas',
                    filter: `portal_client_id=eq.${clientId}`,
                }, () => {
                    fetchTarefas();
                })
                .subscribe();

            if (cancelled) {
                sb.removeChannel(ch); // cliente já trocou antes da subscription terminar de montar
                return;
            }
            channel = ch;
        }
        setupRealtime();

        return () => {
            cancelled = true;
            if (channel) {
                createSPASassClient().then(s => s.getSupabaseClient().removeChannel(channel!));
            }
        };
    }, [client]);

    if (globalLoading) {
        return <PageLoader />;
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-canvas border p-8 rounded-xl shadow-xl max-w-md w-full">
                    <FileText className="w-12 h-12 text-rausch mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-ink mb-2">Nenhum Cliente Selecionado</h2>
                    <p className="text-muted text-sm mb-6">
                        Você precisa selecionar um cliente para ver as tarefas e acompanhamento do contrato.
                    </p>
                    {isMaster ? (
                        <Link href="/app/central-conteudo" className="block w-full py-3 bg-rausch text-white font-medium rounded-lg hover:bg-rausch-active text-center transition-colors">
                            Ir para Central de Conteúdos
                        </Link>
                    ) : (
                        <Link href="/app" className="block w-full py-3 bg-rausch text-white font-medium rounded-lg hover:bg-rausch-active text-center transition-colors">
                            Voltar ao Início
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    }

    const concluidas = tarefas.filter(t => t.status === 'concluido').length;
    const pendentes = tarefas.filter(t => t.status !== 'concluido').length;

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-ink">Contrato e entregas</h1>
                <p className="text-muted">Acompanhamento de tarefas e entregas</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rausch/5 rounded-lg">
                            <FileText className="h-5 w-5 text-rausch" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Total de tarefas</p>
                            <p className="text-lg font-bold">{tarefas.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-success-bg rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-success-text" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Concluídas</p>
                            <p className="text-lg font-bold">{concluidas}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-warning-bg rounded-lg">
                            <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Pendentes</p>
                            <p className="text-lg font-bold">{pendentes}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-rausch" />
                        Lista de tarefas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {tarefas.map((t) => (
                        <div key={t.id} className="flex items-start gap-3 p-3 bg-surface-soft rounded-lg">
                            {t.status === 'concluido' ? (
                                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                            ) : (
                                <Clock className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className="text-sm font-medium">{t.titulo}</p>
                                {t.descricao && <p className="text-xs text-muted">{t.descricao}</p>}
                                <p className="text-xs text-muted-soft mt-1">{t.departamento} • {t.prioridade}{t.data_limite ? ` • até ${new Date(t.data_limite).toLocaleDateString('pt-BR')}` : ''}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${t.status === 'concluido' ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
                                {t.status}
                            </span>
                        </div>
                    ))}
                    {tarefas.length === 0 && <p className="text-sm text-muted-soft">Nenhuma tarefa vinculada a este cliente.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
