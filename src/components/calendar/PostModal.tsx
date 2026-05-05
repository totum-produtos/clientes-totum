"use client";
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

interface Post {
    id?: number;
    subject: string;
    tipo: string;
    published_at: string;
    views?: number;
    likes?: number;
    engagement_rate?: number;
    portal_client_id?: string;
}

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (post: Post) => void;
    onDelete?: (id: number) => void;
    post?: Post | null;
    selectedDate?: Date;
    clientId: string;
}

const tipos = ['viral', 'conversion', 'educational'];

export default function PostModal({ isOpen, onClose, onSave, onDelete, post, selectedDate, clientId }: PostModalProps) {
    const [form, setForm] = useState<Post>({
        subject: '',
        tipo: 'viral',
        published_at: selectedDate ? selectedDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        views: 0,
        likes: 0,
        engagement_rate: 0,
        portal_client_id: clientId,
    });

    useEffect(() => {
        if (post) {
            setForm({
                ...post,
                published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            });
        } else {
            setForm({
                subject: '',
                tipo: 'viral',
                published_at: selectedDate ? selectedDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                views: 0,
                likes: 0,
                engagement_rate: 0,
                portal_client_id: clientId,
            });
        }
    }, [post, selectedDate, clientId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{post?.id ? 'Editar post' : 'Novo post'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título/Assunto</label>
                        <input
                            required
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            placeholder="Ex: Lançamento campanha Mães"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                value={form.tipo}
                                onChange={e => setForm({ ...form, tipo: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora</label>
                            <input
                                type="datetime-local"
                                required
                                value={form.published_at}
                                onChange={e => setForm({ ...form, published_at: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Views</label>
                            <input
                                type="number"
                                value={form.views || 0}
                                onChange={e => setForm({ ...form, views: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
                            <input
                                type="number"
                                value={form.likes || 0}
                                onChange={e => setForm({ ...form, likes: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Engajamento %</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.engagement_rate || 0}
                                onChange={e => setForm({ ...form, engagement_rate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="btn-primary flex-1 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                            <Save className="h-4 w-4" /> Salvar
                        </button>
                        {post?.id && onDelete && (
                            <button
                                type="button"
                                onClick={() => post.id && onDelete(post.id)}
                                className="px-4 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Excluir
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
