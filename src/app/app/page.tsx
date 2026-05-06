"use client";
import React from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarDays, FolderOpen, BarChart3, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { loading, client, posts, tarefas, projetos } = useGlobal();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rausch"></div>
            </div>
        );
    }

    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const avgEngagement = posts.length > 0 ? (posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / posts.length).toFixed(1) : '0';
    const tarefasPendentes = tarefas.filter(t => t.status !== 'concluido').length;

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-ink">Olá, {client?.nome || 'Cliente'}! 👋</h1>
                <p className="text-muted">Bem-vindo à sua Central de Conteúdo Totum</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rausch/5 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-rausch" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Posts publicados</p>
                            <p className="text-lg font-bold">{posts.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rausch/5 rounded-lg">
                            <Users className="h-5 w-5 text-rausch" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Total de views</p>
                            <p className="text-lg font-bold">{totalViews.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rausch/5 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-rausch" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Engajamento médio</p>
                            <p className="text-lg font-bold">{avgEngagement}%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rausch/5 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-rausch" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Tarefas pendentes</p>
                            <p className="text-lg font-bold">{tarefasPendentes}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Próximas entregas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-rausch" />
                            Entregas recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tarefas.slice(0, 4).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-surface-soft rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{t.titulo}</p>
                                    <p className="text-xs text-muted">{t.departamento} • {t.prioridade}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'concluido' ? 'bg-success-bg text-success-text' : 'bg-warning-bg text-warning-text'}`}>
                                    {t.status}
                                </span>
                            </div>
                        ))}
                        {tarefas.length === 0 && <p className="text-sm text-muted-soft">Nenhuma tarefa vinculada.</p>}
                        <Link href="/app/contrato" className="text-sm text-rausch hover:underline block mt-2">Ver todas →</Link>
                    </CardContent>
                </Card>

                {/* Posts recentes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-rausch" />
                            Posts recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {posts.slice(0, 4).map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-surface-soft rounded-lg">
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{p.subject}</p>
                                    <p className="text-xs text-muted">{p.tipo} • {p.views} views</p>
                                </div>
                                <span className="text-xs text-muted shrink-0">{p.engagement_rate}%</span>
                            </div>
                        ))}
                        {posts.length === 0 && <p className="text-sm text-muted-soft">Nenhum post vinculado.</p>}
                        <Link href="/app/calendario" className="text-sm text-rausch hover:underline block mt-2">Ver calendário →</Link>
                    </CardContent>
                </Card>
            </div>

            {projetos.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Projetos ativos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-3 flex-wrap">
                        {projetos.map((p) => (
                            <div key={p.id} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: p.cor || 'rausch' }}>
                                {p.nome}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
