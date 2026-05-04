"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { contrato, entregas } from '@/lib/mocks';
import { FileText, Calendar, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function ContratoPage() {
  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contrato e entregas</h1>
        <p className="text-gray-500">Detalhes do seu plano e cronograma de entregas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Contrato atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-500">Tipo</span>
              <span className="text-sm font-medium">{contrato.tipo}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-500">Início</span>
              <span className="text-sm font-medium">{contrato.inicio}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-500">Fim</span>
              <span className="text-sm font-medium">{contrato.fim}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-500">Valor mensal</span>
              <span className="text-sm font-medium">{contrato.valor_mensal}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Verba mídia</span>
              <span className="text-sm font-medium">{contrato.verba_midia}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary-600" />
              Entregas do plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entregas.map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {e.status === 'Em dia' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.titulo}</p>
                  <p className="text-xs text-gray-500">{e.prazo}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${e.status === 'Em dia' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {e.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-gray-400">TODO: substituir por fetch real do totum-system (Fase 2)</p>
    </div>
  );
}
