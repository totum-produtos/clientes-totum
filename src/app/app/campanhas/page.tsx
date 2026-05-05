"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { TrendingUp, Eye, Heart, BarChart3, Megaphone, Link2, Unlink, RefreshCw, DollarSign, Target, MousePointerClick } from 'lucide-react';
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

type AdCampaign = {
    id: string;
    platform: 'meta' | 'google';
    name: string;
    status: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    leads_count: number;
    cost_per_lead: number;
    roi: number;
};

export default function CampanhasPage() {
    const { client } = useGlobal();
    const [posts, setPosts] = useState<Post[]>([]);
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<'meta' | 'google' | null>(null);
    const [metaAccountId, setMetaAccountId] = useState('');
    const [metaToken, setMetaToken] = useState('');
    const [googleCustomerId, setGoogleCustomerId] = useState('');
    const [googleDevToken, setGoogleDevToken] = useState('');
    const [activeTab, setActiveTab] = useState<'organic' | 'paid'>('organic');

    useEffect(() => {
        async function fetchData() {
            if (!client) return;
            const supabase = await createSPASassClient();
            const sb = supabase.getSupabaseClient();

            // Posts orgânicos
            const { data: postsData } = await sb
                .from('wanda_posts')
                .select('id, subject, tipo, views, likes, engagement_rate, conversion_rate, published_at')
                .eq('portal_client_id', client.id)
                .order('published_at', { ascending: false });
            setPosts(postsData || []);

            // Campanhas pagas
            const { data: campaignsData } = await sb
                .from('ad_campaigns')
                .select('*')
                .eq('portal_client_id', client.id)
                .order('spend', { ascending: false });
            setCampaigns(campaignsData || []);

            setLoading(false);
        }
        fetchData();
    }, [client]);

    async function connectMeta() {
        if (!client || !metaAccountId || !metaToken) return;
        setConnecting('meta');
        const supabase = await createSPASassClient();
        const { error } = await supabase.getSupabaseClient()
            .from('portal_clients')
            .update({
                meta_ad_account_id: metaAccountId,
                meta_access_token: metaToken,
            })
            .eq('id', client.id);
        setConnecting(null);
        if (!error) {
            setMetaAccountId('');
            setMetaToken('');
            alert('Meta Ads conectado! A sincronização ocorre em background.');
        } else {
            alert('Erro: ' + error.message);
        }
    }

    async function connectGoogle() {
        if (!client || !googleCustomerId || !googleDevToken) return;
        setConnecting('google');
        const supabase = await createSPASassClient();
        const { error } = await supabase.getSupabaseClient()
            .from('portal_clients')
            .update({
                google_customer_id: googleCustomerId,
                google_developer_token: googleDevToken,
            })
            .eq('id', client.id);
        setConnecting(null);
        if (!error) {
            setGoogleCustomerId('');
            setGoogleDevToken('');
            alert('Google Ads conectado! A sincronização ocorre em background.');
        } else {
            alert('Erro: ' + error.message);
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>;
    }

    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const avgEngagement = posts.length > 0 ? (posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / posts.length).toFixed(1) : '0';

    const totalAdSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const totalAdClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalAdLeads = campaigns.reduce((sum, c) => sum + (c.leads_count || 0), 0);
    const avgCPL = campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (c.cost_per_lead || 0), 0) / campaigns.length).toFixed(2) : '0';

    const chartData = posts.slice(0, 10).map(p => ({
        nome: p.subject.slice(0, 15) + '...',
        views: p.views || 0,
        likes: p.likes || 0,
        engagement: p.engagement_rate || 0,
    })).reverse();

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Campanhas</h1>
                <p className="text-gray-500">Métricas de conteúdo orgânico e campanhas pagas</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('organic')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'organic' ? 'border-[#d81220] text-[#d81220]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Conteúdo Orgânico
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'paid' ? 'border-[#d81220] text-[#d81220]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Campanhas Pagas
                </button>
            </div>

            {activeTab === 'organic' ? (
                <>
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
                                <div><p className="text-sm text-gray-500">Posts</p><p className="text-lg font-bold">{posts.length}</p></div>
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
                </>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-orange-50 rounded-lg"><DollarSign className="h-5 w-5 text-orange-600" /></div>
                                <div><p className="text-sm text-gray-500">Investimento</p><p className="text-lg font-bold">R$ {totalAdSpend.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg"><MousePointerClick className="h-5 w-5 text-blue-600" /></div>
                                <div><p className="text-sm text-gray-500">Cliques</p><p className="text-lg font-bold">{totalAdClicks.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-green-50 rounded-lg"><Target className="h-5 w-5 text-green-600" /></div>
                                <div><p className="text-sm text-gray-500">Leads</p><p className="text-lg font-bold">{totalAdLeads.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-purple-50 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                                <div><p className="text-sm text-gray-500">CPL médio</p><p className="text-lg font-bold">R$ {avgCPL}</p></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Conectar contas */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-blue-600" /> Meta Ads</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <input
                                    placeholder="Ad Account ID (ex: act_123456789)"
                                    value={metaAccountId}
                                    onChange={(e) => setMetaAccountId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="Access Token"
                                    value={metaToken}
                                    onChange={(e) => setMetaToken(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <button
                                    onClick={connectMeta}
                                    disabled={connecting === 'meta' || !metaAccountId || !metaToken}
                                    className="w-full py-2 px-4 bg-[#d81220] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] disabled:opacity-50"
                                >
                                    {connecting === 'meta' ? 'Conectando...' : 'Conectar Meta Ads'}
                                </button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-green-600" /> Google Ads</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <input
                                    placeholder="Customer ID (ex: 123-456-7890)"
                                    value={googleCustomerId}
                                    onChange={(e) => setGoogleCustomerId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="Developer Token"
                                    value={googleDevToken}
                                    onChange={(e) => setGoogleDevToken(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <button
                                    onClick={connectGoogle}
                                    disabled={connecting === 'google' || !googleCustomerId || !googleDevToken}
                                    className="w-full py-2 px-4 bg-[#d81220] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] disabled:opacity-50"
                                >
                                    {connecting === 'google' ? 'Conectando...' : 'Conectar Google Ads'}
                                </button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Campanhas sincronizadas</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {campaigns.map((c) => (
                                <div key={c.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{c.name}</p>
                                        <p className="text-xs text-gray-500">{c.platform === 'meta' ? 'Meta Ads' : 'Google Ads'} • {c.status}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 shrink-0">R$ {c.spend}</span>
                                    <span className="text-xs text-gray-500 shrink-0">{c.clicks} cliques</span>
                                    <span className="text-xs text-gray-500 shrink-0">{c.ctr}% CTR</span>
                                </div>
                            ))}
                            {campaigns.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-400">Nenhuma campanha sincronizada.</p>
                                    <p className="text-xs text-gray-400 mt-1">Conecte sua conta de anúncios acima para começar.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
