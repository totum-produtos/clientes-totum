"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { kpis, dadosGrafico, campanhasAtivas } from '@/lib/mocks';
import { TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CampanhasPage() {
  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de campanhas</h1>
        <p className="text-gray-500">Resultados e métricas do período</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary-600" />
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

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Leads por dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="leads" fill="#d81220" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campanhas ativas */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas ativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {campanhasAtivas.map((camp, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{camp.nome}</p>
                <p className="text-xs text-gray-500">{camp.plataforma} • {camp.orcamento}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${camp.status === 'Ativa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {camp.status}
              </span>
              <span className="text-xs text-gray-500 shrink-0">CTR {camp.ctr}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">TODO: substituir por fetch real do Upixel API (Fase 2)</p>
    </div>
  );
}
