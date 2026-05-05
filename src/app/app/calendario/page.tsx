"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { Instagram, TrendingUp, Eye, Heart } from 'lucide-react';

type Post = {
    id: number;
    subject: string;
    tipo: string;
    published_at: string;
    views: number;
    likes: number;
    engagement_rate: number;
};

const tipoColors: Record<string, string> = {
    viral: 'bg-purple-100 text-purple-700',
    conversion: 'bg-green-100 text-green-700',
    educational: 'bg-blue-100 text-blue-700',
};

export default function CalendarioPage() {
    const { client } = useGlobal();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            if (!client) return;
            const supabase = await createSPASassClient();
            const { data } = await supabase.getSupabaseClient()
                .from('wanda_posts')
                .select('id, subject, tipo, published_at, views, likes, engagement_rate')
                .eq('portal_client_id', client.id)
                .order('published_at', { ascending: false });
            setPosts(data || []);
            setLoading(false);
        }
        fetchPosts();
    }, [client]);

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>;
    }

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendário de postagens</h1>
                <p className="text-gray-500">Conteúdo publicado</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Posts publicados ({posts.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {posts.map((post) => {
                        const date = new Date(post.published_at);
                        return (
                            <div key={post.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary-50 rounded-lg shrink-0">
                                    <span className="text-xs text-primary-600 font-medium">{date.getDate()}</span>
                                    <span className="text-[10px] text-primary-500">{date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{post.subject}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${tipoColors[post.tipo] || 'bg-gray-100 text-gray-700'}`}>
                                            {post.tipo}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 shrink-0">
                                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>
                                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {post.engagement_rate}%</span>
                                </div>
                            </div>
                        );
                    })}
                    {posts.length === 0 && <p className="text-sm text-gray-400">Nenhum post vinculado a este cliente.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
