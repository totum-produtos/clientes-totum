"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { FileText, CheckCircle2, Clock, Calendar } from 'lucide-react';

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
    const { client } = useGlobal();
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchTarefas() {
        if (!client) return;
        const supabase = await createSPASassClient();
        const { data } = await supabase.getSupabaseClient()
            .from('tarefas')
            .select('id, titulo, status, prioridade, data_limite, departamento, descricao')
            .eq('portal_client_id', client.id)
            .order('created_at', { ascending: false });
        setTarefas(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchTarefas();
    }, [client]);

    // Realtime subscription: atualiza tarefas sem refresh
    useEffect(() => {
        if (!client) return;
        let channel: any = null;

        async function setupRealtime() {
            const supabase = await createSPASassClient();
            const clientId = client!.id;
            channel = supabase.getSupabaseClient()
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
        }
        setupRealtime();

        return () => {
            if (channel) {
                createSPASassClient().then(s => s.getSupabaseClient().removeChannel(channel!));
            }
        };
    }, [client]);

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-rausch rounded-full"></div></div>;
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
