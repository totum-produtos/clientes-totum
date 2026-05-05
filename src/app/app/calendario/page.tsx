"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { Plus, Upload, RefreshCw } from 'lucide-react';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import PostModal from '@/components/calendar/PostModal';
import BulkPostModal from '@/components/calendar/BulkPostModal';
// TODO: substituir por toast real (Fase 2)

type Post = {
    id: number;
    subject: string;
    tipo: string;
    published_at: string;
    views: number;
    likes: number;
    engagement_rate: number;
};

export default function CalendarioPage() {
    const { client } = useGlobal();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    async function fetchPosts() {
        if (!client) return;
        setLoading(true);
        const supabase = await createSPASassClient();
        const { data, error } = await supabase.getSupabaseClient()
            .from('wanda_posts')
            .select('id, subject, tipo, published_at, views, likes, engagement_rate')
            .eq('portal_client_id', client.id)
            .order('published_at', { ascending: false });
        if (error) {
            console.error('Erro ao carregar posts:', error);
            alert('Erro ao carregar posts');
        } else {
            setPosts(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts();
    }, [client]);

    const events = posts.map(p => ({
        id: p.id,
        title: p.subject,
        date: new Date(p.published_at),
        type: p.tipo,
    }));

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedPost(null);
        setModalOpen(true);
    };

    const handleEventClick = (event: { id: string | number; title: string; date: Date; type: string }) => {
        const post = posts.find(p => p.id === event.id);
        if (post) {
            setSelectedPost(post);
            setSelectedDate(new Date(post.published_at));
            setModalOpen(true);
        }
    };

    const handleSavePost = async (postData: any) => {
        if (!client) return;
        const supabase = await createSPASassClient();
        const payload = {
            ...postData,
            portal_client_id: client.id,
            published_at: new Date(postData.published_at).toISOString(),
        };

        if (selectedPost?.id) {
            // Update
            const { error } = await supabase.getSupabaseClient()
                .from('wanda_posts')
                .update(payload)
                .eq('id', selectedPost.id);
            if (error) {
                alert('Erro ao atualizar: ' + error.message);
            } else {
                alert('Post atualizado!');
                setModalOpen(false);
                fetchPosts();
            }
        } else {
            // Insert
            const { error } = await supabase.getSupabaseClient()
                .from('wanda_posts')
                .insert({ ...payload, post_id: `post_${Date.now()}` });
            if (error) {
                alert('Erro ao criar: ' + error.message);
            } else {
                alert('Post criado!');
                setModalOpen(false);
                fetchPosts();
            }
        }
    };

    const handleDeletePost = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;
        const supabase = await createSPASassClient();
        const { error } = await supabase.getSupabaseClient()
            .from('wanda_posts')
            .delete()
            .eq('id', id);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            alert('Post excluído!');
            setModalOpen(false);
            fetchPosts();
        }
    };

    const handleBulkSave = async (bulkPosts: any[]) => {
        if (!client) return;
        const supabase = await createSPASassClient();
        const payload = bulkPosts.map((p, idx) => ({
            ...p,
            portal_client_id: client.id,
            post_id: `post_${Date.now()}_${idx}`,
            published_at: new Date(p.published_at).toISOString(),
        }));
        const { error } = await supabase.getSupabaseClient()
            .from('wanda_posts')
            .insert(payload);
        if (error) {
            alert('Erro ao criar posts: ' + error.message);
        } else {
            alert(`${payload.length} posts criados!`);
            setBulkModalOpen(false);
            fetchPosts();
        }
    };

    return (
        <div className="space-y-4 p-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calendário de postagens</h1>
                    <p className="text-gray-500">Visualize e gerencie o conteúdo</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchPosts} className="p-2 hover:bg-gray-100 rounded-lg border">
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => setBulkModalOpen(true)} className="px-3 py-2 rounded-lg border text-sm flex items-center gap-2 hover:bg-gray-50">
                        <Upload className="h-4 w-4" /> Em massa
                    </button>
                    <button onClick={() => { setSelectedPost(null); setSelectedDate(new Date()); setModalOpen(true); }} className="btn-primary px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Novo post
                    </button>
                </div>
            </div>

            {/* Legenda */}
            <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Porquê</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> O que</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Como</span>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>
            ) : (
                <CalendarGrid
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    events={events}
                    onDayClick={handleDayClick}
                    onEventClick={handleEventClick}
                />
            )}

            {/* Lista de posts do mês */}
            <Card>
                <CardHeader>
                    <CardTitle>Posts de {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {posts
                        .filter(p => {
                            const d = new Date(p.published_at);
                            return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                        })
                        .map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleEventClick({ id: p.id, title: p.subject, date: new Date(p.published_at), type: p.tipo })}>
                                <div>
                                    <p className="font-medium text-sm">{p.subject}</p>
                                    <p className="text-xs text-gray-500">{new Date(p.published_at).toLocaleDateString('pt-BR')} • {p.tipo}</p>
                                </div>
                                <span className="text-xs text-gray-500">{p.views} views • {p.engagement_rate}% eng</span>
                            </div>
                        ))}
                    {posts.filter(p => {
                        const d = new Date(p.published_at);
                        return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                    }).length === 0 && <p className="text-sm text-gray-400">Nenhum post neste mês.</p>}
                </CardContent>
            </Card>

            <PostModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSavePost}
                onDelete={handleDeletePost}
                post={selectedPost}
                selectedDate={selectedDate}
                clientId={client?.id || ''}
            />

            <BulkPostModal
                isOpen={bulkModalOpen}
                onClose={() => setBulkModalOpen(false)}
                onSave={handleBulkSave}
                clientId={client?.id || ''}
            />
        </div>
    );
}
