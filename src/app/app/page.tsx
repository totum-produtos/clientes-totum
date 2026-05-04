"use client";
import React from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, FolderOpen, FileText, BarChart3, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { kpis, entregas } from '@/lib/mocks';

export default function DashboardPage() {
    const { loading, user, client } = useGlobal();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

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
                            <p className="text-sm text-gray-500">Investimento</p>
                            <p className="text-lg font-bold">{kpis.investimento}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Leads</p>
                            <p className="text-lg font-bold">{kpis.leads}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">CPL</p>
                            <p className="text-lg font-bold">{kpis.cpl}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ROAS</p>
                            <p className="text-lg font-bold">{kpis.roas}</p>
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
                            Próximas entregas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {entregas.slice(0, 4).map((e, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm">{e.titulo}</p>
                                    <p className="text-xs text-gray-500">{e.prazo}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${e.status === 'Em dia' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {e.status}
                                </span>
                            </div>
                        ))}
                        <Link href="/app/contrato" className="text-sm text-primary-600 hover:underline block mt-2">Ver todas →</Link>
                    </CardContent>
                </Card>

                {/* Acesso rápido */}
                <Card>
                    <CardHeader>
                        <CardTitle>Acesso rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <Link href="/app/calendario" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="p-2 bg-primary-50 rounded-full">
                                <CalendarDays className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">Calendário de postagens</h3>
                                <p className="text-sm text-gray-500">Veja o conteúdo agendado</p>
                            </div>
                        </Link>
                        <Link href="/app/arquivos" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="p-2 bg-primary-50 rounded-full">
                                <FolderOpen className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">Arquivos compartilhados</h3>
                                <p className="text-sm text-gray-500">Acesse documentos e materiais</p>
                            </div>
                        </Link>
                        <Link href="/app/campanhas" className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="p-2 bg-primary-50 rounded-full">
                                <BarChart3 className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-medium">Dashboard de campanhas</h3>
                                <p className="text-sm text-gray-500">Resultados e métricas</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
