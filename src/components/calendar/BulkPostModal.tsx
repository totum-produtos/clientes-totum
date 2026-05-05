"use client";
import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';

interface BulkPost {
    subject: string;
    tipo: string;
    published_at: string;
}

interface BulkPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (posts: BulkPost[]) => void;
    clientId: string;
}

const tipos = ['viral', 'conversion', 'educational'];

export default function BulkPostModal({ isOpen, onClose, onSave, clientId }: BulkPostModalProps) {
    const [posts, setPosts] = useState<BulkPost[]>([
        { subject: '', tipo: 'viral', published_at: new Date().toISOString().slice(0, 16) },
    ]);
    const [csvText, setCsvText] = useState('');
    const [mode, setMode] = useState<'form' | 'csv'>('form');

    if (!isOpen) return null;

    const addRow = () => {
        setPosts([...posts, { subject: '', tipo: 'viral', published_at: new Date().toISOString().slice(0, 16) }]);
    };

    const removeRow = (idx: number) => {
        setPosts(posts.filter((_, i) => i !== idx));
    };

    const updateRow = (idx: number, field: keyof BulkPost, value: string) => {
        const updated = [...posts];
        updated[idx] = { ...updated[idx], [field]: value };
        setPosts(updated);
    };

    const handleCsvParse = () => {
        const lines = csvText.trim().split('\n');
        const parsed: BulkPost[] = [];
        for (const line of lines) {
            const [subject, tipo, date] = line.split(',').map(s => s.trim());
            if (subject) {
                parsed.push({
                    subject,
                    tipo: tipos.includes(tipo) ? tipo : 'viral',
                    published_at: date ? new Date(date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                });
            }
        }
        setPosts(parsed.length > 0 ? parsed : posts);
        setMode('form');
    };

    const handleSubmit = () => {
        const valid = posts.filter(p => p.subject.trim() !== '');
        onSave(valid);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Adicionar posts em massa</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Mode toggle */}
                    <div className="flex gap-2">
                        <button onClick={() => setMode('form')} className={`px-3 py-1.5 rounded-lg text-sm ${mode === 'form' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                            Formulário
                        </button>
                        <button onClick={() => setMode('csv')} className={`px-3 py-1.5 rounded-lg text-sm ${mode === 'csv' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                            Importar CSV
                        </button>
                    </div>

                    {mode === 'csv' ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500">
                                Cole o CSV no formato: <code className="bg-gray-100 px-1 rounded">assunto,tipo,data</code>
                            </p>
                            <textarea
                                value={csvText}
                                onChange={e => setCsvText(e.target.value)}
                                rows={8}
                                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                                placeholder="Lançamento campanha Mães,viral,2026-05-10&#10;Bastidores produção,educational,2026-05-12"
                            />
                            <button onClick={handleCsvParse} className="btn-primary px-4 py-2 rounded-lg text-sm">
                                <Upload className="h-4 w-4 inline mr-1" /> Analisar CSV
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post, idx) => (
                                <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1 grid grid-cols-12 gap-2">
                                        <input
                                            placeholder="Título do post"
                                            value={post.subject}
                                            onChange={e => updateRow(idx, 'subject', e.target.value)}
                                            className="col-span-6 px-3 py-2 border rounded-lg text-sm"
                                        />
                                        <select
                                            value={post.tipo}
                                            onChange={e => updateRow(idx, 'tipo', e.target.value)}
                                            className="col-span-3 px-3 py-2 border rounded-lg text-sm"
                                        >
                                            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <input
                                            type="datetime-local"
                                            value={post.published_at}
                                            onChange={e => updateRow(idx, 'published_at', e.target.value)}
                                            className="col-span-3 px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                    {posts.length > 1 && (
                                        <button onClick={() => removeRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addRow} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
                                + Adicionar linha
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSubmit} className="btn-primary flex-1 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                            <Save className="h-4 w-4" /> Salvar {posts.filter(p => p.subject.trim()).length} posts
                        </button>
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
