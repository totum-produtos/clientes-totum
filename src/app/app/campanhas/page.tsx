"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { TrendingUp, Eye, Heart, BarChart3, Megaphone, DollarSign, Target, MousePointerClick } from 'lucide-react';
import { useToast } from "@/components/ui/ToastProvider";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LoadingSpinner, PageLoader } from '@/components/ui/LoadingSpinner';

type Post = {
    id: number;
    subject: string;
    tipo: string;
    views: number | null;
    likes: number | null;
    engagement_rate: number | null;
    conversion_rate: number | null;
    published_at: string | null;
};

type AdCampaign = {
    id: string;
    platform: string;
    name: string;
    status: string | null;
    spend: number | null;
    impressions: number | null;
    clicks: number | null;
    ctr: number | null;
    conversions: number | null;
    leads_count: number | null;
    cost_per_lead: number | null;
    roi: number | null;
};

export default function CampanhasPage() {
  const { showSuccess, showError } = useToast();
    const { client, loading: globalLoading, user } = useGlobal();
    const [posts, setPosts] = useState<Post[]>([]);
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<'meta' | 'google' | null>(null);
    const [metaAccountId, setMetaAccountId] = useState('');
    const [metaToken, setMetaToken] = useState('');
    const [googleCustomerId, setGoogleCustomerId] = useState('');
    const [googleDevToken, setGoogleDevToken] = useState('');
    const [activeTab, setActiveTab] = useState<'organic' | 'paid'>('organic');

    const isMaster = user?.role === "master" || user?.role === "admin";

    useEffect(() => {
        async function fetchData() {
            if (!client) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
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
            } catch (error) {
                console.error("Critical error fetching campaigns data:", error);
            } finally {
                setLoading(false);
            }
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
            showSuccess('Meta Ads conectado! A sincronização ocorre em background.');
        } else {
            showError('Erro: ' + error.message);
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
            showSuccess('Google Ads conectado! A sincronização ocorre em background.');
        } else {
            showError('Erro: ' + error.message);
        }
    }

    if (globalLoading) {
        return <PageLoader />;
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-canvas border p-8 rounded-xl shadow-xl max-w-md w-full">
                    <BarChart3 className="w-12 h-12 text-rausch mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-ink mb-2">Nenhum cliente selecionado</h2>
                    <p className="text-muted text-sm mb-6">
                        Você precisa selecionar um cliente para ver o dashboard de campanhas.
                    </p>
                    {isMaster ? (
                        <Link href="/app/central-conteudo" className="block w-full py-3 bg-rausch text-white font-medium rounded-md hover:bg-rausch-active text-center transition-colors">
                            Ir para Central de Conteúdos
                        </Link>
                    ) : (
                        <Link href="/app" className="block w-full py-3 bg-rausch text-white font-medium rounded-md hover:bg-rausch-active text-center transition-colors">
                            Voltar ao Início
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
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
                <h1 className="text-2xl font-bold text-ink">Dashboard de Campanhas</h1>
                <p className="text-muted">Métricas de conteúdo orgânico e campanhas pagas</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hairline">
                <button
                    onClick={() => setActiveTab('organic')}
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'organic' ? 'border-rausch text-rausch' : 'border-transparent text-muted hover:text-ink'}`}
                >
                    Conteúdo Orgânico
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    disabled={loading}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'paid' ? 'border-rausch text-rausch' : 'border-transparent text-muted hover:text-ink'}`}
                >
                    Campanhas Pagas
                </button>
            </div>

            {activeTab === 'organic' ? (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-rausch/5 rounded-lg"><Eye className="h-5 w-5 text-rausch" /></div>
                                <div><p className="text-sm text-muted">Total Views</p><p className="text-lg font-bold">{totalViews.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-rausch/5 rounded-lg"><Heart className="h-5 w-5 text-rausch" /></div>
                                <div><p className="text-sm text-muted">Total Likes</p><p className="text-lg font-bold">{totalLikes.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-rausch/5 rounded-lg"><BarChart3 className="h-5 w-5 text-rausch" /></div>
                                <div><p className="text-sm text-muted">Engajamento médio</p><p className="text-lg font-bold">{avgEngagement}%</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-rausch/5 rounded-lg"><TrendingUp className="h-5 w-5 text-rausch" /></div>
                                <div><p className="text-sm text-muted">Posts</p><p className="text-lg font-bold">{posts.length}</p></div>
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
                                        <Bar dataKey="views" fill="rausch" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Todos os posts</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {posts.map((p) => (
                                <div key={p.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-surface-soft transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{p.subject}</p>
                                        <p className="text-xs text-muted">{p.tipo} • {p.published_at ? new Date(p.published_at).toLocaleDateString('pt-BR') : '—'}</p>
                                    </div>
                                    <span className="text-xs text-muted shrink-0">{p.views} views</span>
                                    <span className="text-xs text-muted shrink-0">{p.engagement_rate}% eng</span>
                                </div>
                            ))}
                            {posts.length === 0 && <p className="text-sm text-muted-soft">Nenhum post vinculado.</p>}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-surface-soft rounded-lg"><DollarSign className="h-5 w-5 text-muted" /></div>
                                <div><p className="text-sm text-muted">Investimento</p><p className="text-lg font-bold">R$ {totalAdSpend.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-surface-soft rounded-lg"><MousePointerClick className="h-5 w-5 text-rausch" /></div>
                                <div><p className="text-sm text-muted">Cliques</p><p className="text-lg font-bold">{totalAdClicks.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-success-bg rounded-lg"><Target className="h-5 w-5 text-success-text" /></div>
                                <div><p className="text-sm text-muted">Leads</p><p className="text-lg font-bold">{totalAdLeads.toLocaleString()}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-surface-soft rounded-lg"><TrendingUp className="h-5 w-5 text-ink" /></div>
                                <div><p className="text-sm text-muted">CPL médio</p><p className="text-lg font-bold">R$ {avgCPL}</p></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Conectar contas */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-rausch" /> Meta Ads</CardTitle></CardHeader>
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
                                    className="w-full py-2 px-4 bg-rausch text-white rounded-lg text-sm font-medium hover:bg-rausch-active disabled:opacity-50"
                                >
                                    {connecting === 'meta' ? 'Conectando...' : 'Conectar Meta Ads'}
                                </button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-success-text" /> Google Ads</CardTitle></CardHeader>
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
                                    className="w-full py-2 px-4 bg-rausch text-white rounded-lg text-sm font-medium hover:bg-rausch-active disabled:opacity-50"
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
                                <div key={c.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-surface-soft transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{c.name}</p>
                                        <p className="text-xs text-muted">{c.platform === 'meta' ? 'Meta Ads' : 'Google Ads'} • {c.status}</p>
                                    </div>
                                    <span className="text-xs text-muted shrink-0">R$ {c.spend}</span>
                                    <span className="text-xs text-muted shrink-0">{c.clicks} cliques</span>
                                    <span className="text-xs text-muted shrink-0">{c.ctr}% CTR</span>
                                </div>
                            ))}
                            {campaigns.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-soft">Nenhuma campanha sincronizada.</p>
                                    <p className="text-xs text-muted-soft mt-1">Conecte sua conta de anúncios acima para começar.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
