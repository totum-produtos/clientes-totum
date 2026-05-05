"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { TrendingUp, Eye, Heart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Post = {
    id: number;
    subject: string;
    tipo: string;
    views: number;
    likes: number;
    engagement_rate: number;
    conversion_rate: number;
    published_at: string;
};

export default function CampanhasPage() {
    const { client } = useGlobal();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            if (!client) return;
            const supabase = await createSPASassClient();
            const { data } = await supabase.getSupabaseClient()
                .from('wanda_posts')
                .select('id, subject, tipo, views, likes, engagement_rate, conversion_rate, published_at')
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

    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const avgEngagement = posts.length > 0 ? (posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / posts.length).toFixed(1) : '0';
    const avgConversion = posts.length > 0 ? (posts.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / posts.length).toFixed(1) : '0';

    const chartData = posts.slice(0, 10).map(p => ({
        nome: p.subject.slice(0, 15) + '...',
        views: p.views || 0,
        likes: p.likes || 0,
        engagement: p.engagement_rate || 0,
    })).reverse();

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de conteúdo</h1>
                <p className="text-gray-500">Métricas dos posts publicados</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg"><Eye className="h-5 w-5 text-primary-600" /></div>
                        <div><p className="text-sm text-gray-500">Total Views</p><p className="text-lg font-bold">{totalViews.toLocaleString()}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg"><Heart className="h-5 w-5 text-primary-600" /></div>
                        <div><p className="text-sm text-gray-500">Total Likes</p><p className="text-lg font-bold">{totalLikes.toLocaleString()}</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg"><BarChart3 className="h-5 w-5 text-primary-600" /></div>
                        <div><p className="text-sm text-gray-500">Engajamento médio</p><p className="text-lg font-bold">{avgEngagement}%</p></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg"><TrendingUp className="h-5 w-5 text-primary-600" /></div>
                        <div><p className="text-sm text-gray-500">Conversão média</p><p className="text-lg font-bold">{avgConversion}%</p></div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Performance por post (últimos 10)</CardTitle></CardHeader>
                <CardContent>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="views" fill="#d81220" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Todos os posts</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {posts.map((p) => (
                        <div key={p.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{p.subject}</p>
                                <p className="text-xs text-gray-500">{p.tipo} • {new Date(p.published_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <span className="text-xs text-gray-500 shrink-0">{p.views} views</span>
                            <span className="text-xs text-gray-500 shrink-0">{p.engagement_rate}% eng</span>
                        </div>
                    ))}
                    {posts.length === 0 && <p className="text-sm text-gray-400">Nenhum post vinculado.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
