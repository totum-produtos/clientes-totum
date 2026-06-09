"use client";
import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

const circuloDouradoOptions = [
  { value: 'porque', label: 'Porquê', desc: 'Propósito, causa, crença' },
  { value: 'oque', label: 'O que', desc: 'Produto, serviço, resultado' },
  { value: 'como', label: 'Como', desc: 'Processo, diferencial, método' },
];

export interface Post {
  id?: number;
  subject?: string;
  tipo?: string;
  published_at?: string | null;
  views?: number | null;
  likes?: number | null;
  engagement_rate?: number | null;
}

interface Props {
  isOpen: boolean;
  date: Date | null;
  post: Post | null;
  clientName?: string;
  onSave: (data: Post) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
  isAdmin?: boolean;
}

export default function PostModal({ isOpen, date, post, clientName, onSave, onDelete, onClose, isAdmin = false }: Props) {
  // All hooks MUST be declared before any early return (Rules of Hooks)
  const [subject, setSubject] = useState('');
  const [tipo, setTipo] = useState('porque');
  const [publishedAt, setPublishedAt] = useState('');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [engagementRate, setEngagementRate] = useState('');

  useEffect(() => {
    if (post) {
      setSubject(post.subject || '');
      setTipo(post.tipo || 'porque');
      setPublishedAt(post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '');
      setViews(post.views?.toString() || '');
      setLikes(post.likes?.toString() || '');
      setEngagementRate(post.engagement_rate?.toString() || '');
    } else if (date) {
      setSubject('');
      setTipo('porque');
      setPublishedAt(new Date(date).toISOString().slice(0, 16));
      setViews('');
      setLikes('');
      setEngagementRate('');
    }
  }, [post, date]);

  // Early return AFTER hooks
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: post?.id,
      subject,
      tipo,
      published_at: publishedAt,
      views: views ? parseInt(views) : null,
      likes: likes ? parseInt(likes) : null,
      engagement_rate: engagementRate ? parseFloat(engagementRate) : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-canvas rounded-md max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {post ? (isAdmin ? 'Editar Post' : 'Visualizar Post') : 'Novo Post'}
            </h2>
            {clientName && (
              <span className="text-rausch font-semibold text-sm block mt-0.5">
                para {clientName}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-strong rounded">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Assunto</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!isAdmin}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rausch disabled:bg-surface-soft disabled:text-muted disabled:cursor-default"
              placeholder="Ex: Por que escolhemos a Totum?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Tipo (Círculo Dourado)</label>
            <div className="grid grid-cols-3 gap-2">
              {circuloDouradoOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => isAdmin && setTipo(opt.value)}
                  disabled={!isAdmin}
                  className={`p-2 rounded-lg text-xs font-medium border transition-colors text-center ${
                    tipo === opt.value
                      ? 'bg-ink text-white border-gray-900'
                      : 'bg-canvas text-body border-hairline'
                  } ${
                    isAdmin 
                      ? 'hover:bg-surface-soft cursor-pointer' 
                      : 'cursor-default'
                  }`}
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Data de publicação</label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              disabled={!isAdmin}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rausch disabled:bg-surface-soft disabled:text-muted disabled:cursor-default"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Views</label>
              <input
                type="number"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rausch disabled:bg-surface-soft disabled:text-muted disabled:cursor-default"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Likes</label>
              <input
                type="number"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rausch disabled:bg-surface-soft disabled:text-muted disabled:cursor-default"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Engajamento %</label>
              <input
                type="number"
                step="0.1"
                value={engagementRate}
                onChange={(e) => setEngagementRate(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rausch disabled:bg-surface-soft disabled:text-muted disabled:cursor-default"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {isAdmin ? (
              <>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-rausch text-white rounded-lg text-sm font-medium hover:bg-rausch-active transition-colors"
                >
                  {post ? 'Salvar alterações' : 'Criar post'}
                </button>
                {post && (
                  <button
                    type="button"
                    onClick={() => { if (post.id !== undefined) { onDelete(post.id); onClose(); } }}
                    className="py-2 px-3 border border-danger-bg text-danger-text rounded-lg text-sm hover:bg-danger-bg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
