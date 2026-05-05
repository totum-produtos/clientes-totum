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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                <h1 className="text-2xl font-bold text-gray-900">Olá, {client?.nome || 'Cliente'}! 👋</h1>
                <p className="text-gray-500">Bem-vindo à sua Central de Conteúdo Totum</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Posts publicados</p>
                            <p className="text-lg font-bold">{posts.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total de views</p>
                            <p className="text-lg font-bold">{totalViews.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Engajamento médio</p>
                            <p className="text-lg font-bold">{avgEngagement}%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tarefas pendentes</p>
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
                            <CalendarDays className="h-5 w-5 text-primary-600" />
                            Entregas recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {tarefas.slice(0, 4).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{t.titulo}</p>
                                    <p className="text-xs text-gray-500">{t.departamento} • {t.prioridade}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'concluido' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {t.status}
                                </span>
                            </div>
                        ))}
                        {tarefas.length === 0 && <p className="text-sm text-gray-400">Nenhuma tarefa vinculada.</p>}
                        <Link href="/app/contrato" className="text-sm text-primary-600 hover:underline block mt-2">Ver todas →</Link>
                    </CardContent>
                </Card>

                {/* Posts recentes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary-600" />
                            Posts recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {posts.slice(0, 4).map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{p.subject}</p>
                                    <p className="text-xs text-gray-500">{p.tipo} • {p.views} views</p>
                                </div>
                                <span className="text-xs text-gray-500 shrink-0">{p.engagement_rate}%</span>
                            </div>
                        ))}
                        {posts.length === 0 && <p className="text-sm text-gray-400">Nenhum post vinculado.</p>}
                        <Link href="/app/calendario" className="text-sm text-primary-600 hover:underline block mt-2">Ver calendário →</Link>
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
                            <div key={p.id} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: p.cor || '#d81220' }}>
                                {p.nome}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
