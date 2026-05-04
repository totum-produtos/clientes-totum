"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { arquivosCompartilhados } from '@/lib/mocks';
import { FileText, Download, FileArchive, FileSpreadsheet } from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-red-500" />,
  ZIP: <FileArchive className="h-5 w-5 text-yellow-500" />,
  XLSX: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  DOCX: <FileText className="h-5 w-5 text-blue-500" />,
};

export default function ArquivosPage() {
  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Arquivos compartilhados</h1>
        <p className="text-gray-500">Documentos e materiais da sua conta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {arquivosCompartilhados.map((arquivo, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="shrink-0">{typeIcons[arquivo.tipo] || <FileText className="h-5 w-5 text-gray-500" />}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{arquivo.nome}</p>
                <p className="text-xs text-gray-500">{arquivo.tipo} • {arquivo.tamanho}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{arquivo.data}</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg shrink-0">
                <Download className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">TODO: substituir por fetch real do Supabase Storage (Fase 2)</p>
    </div>
  );
}
