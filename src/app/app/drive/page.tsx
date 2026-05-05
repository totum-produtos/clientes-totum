"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { driveItens } from '@/lib/mocks';
import { Folder, File, ExternalLink } from 'lucide-react';

export default function DrivePage() {
  return (
    <div className="space-y-6 p-2">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 text-sm rounded">
        ⚠️ <strong>Em construção.</strong> Os dados exibidos abaixo são exemplos.
        A integração com dados reais está prevista para a Fase 2.
      </div>
      {/* TODO(phase-2): substituir mock por Google Drive OAuth + listagem de pasta compartilhada */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Drive</h1>
        <p className="text-gray-500">Pastas e arquivos compartilhados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary-600" />
            Conectar Drive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Em breve você poderá acessar diretamente as pastas do Google Drive da Totum.
          </p>
          <button disabled className="btn-primary px-4 py-2 rounded-lg text-sm opacity-50 cursor-not-allowed">
            Conectar Google Drive
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pastas e arquivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {driveItens.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="shrink-0">
                {item.tipo === 'pasta' ? (
                  <Folder className="h-5 w-5 text-yellow-500" />
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.nome}</p>
                <p className="text-xs text-gray-500">{item.tipo} • {item.data}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">TODO: substituir por integração real Google Drive API (Fase 2)</p>
    </div>
  );
}
