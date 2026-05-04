"use client";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { postsAgendados } from '@/lib/mocks';
import { Instagram, Facebook, Linkedin, Music2 } from 'lucide-react';

const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  Facebook: <Facebook className="h-4 w-4" />,
  LinkedIn: <Linkedin className="h-4 w-4" />,
  TikTok: <Music2 className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  Aprovado: 'bg-green-100 text-green-700',
  'Em revisão': 'bg-yellow-100 text-yellow-700',
  Pendente: 'bg-gray-100 text-gray-700',
};

export default function CalendarioPage() {
  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendário de postagens</h1>
        <p className="text-gray-500">Conteúdo agendado para o período</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maio 2026</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {postsAgendados.map((post) => (
            <div key={post.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary-50 rounded-lg shrink-0">
                <span className="text-xs text-primary-600 font-medium">{post.data.split('-')[2]}</span>
                <span className="text-[10px] text-primary-500">MAI</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{post.titulo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400">{platformIcons[post.plataforma]}</span>
                  <span className="text-xs text-gray-500">{post.plataforma} • {post.tipo}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColors[post.status] || 'bg-gray-100 text-gray-700'}`}>
                {post.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400">TODO: substituir por fetch real do totum-system (Fase 2)</p>
    </div>
  );
}
