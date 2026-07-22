"use client";
import React, { useEffect, useState } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { LayoutGrid, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

type PortalClient = {
    id: string;
    nome: string;
    slug: string;
    status: string | null;
    cor_primaria?: string | null;
    cor_secundaria?: string | null;
};

export default function CentralConteudoPage() {
    const { user, loading: globalLoading } = useGlobal();
    const router = useRouter();
    const [clients, setClients] = useState<PortalClient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (globalLoading) return; // aguarda o GlobalContext resolver o usuário antes de decidir
        if (!user || (user.role !== 'master' && user.role !== 'admin')) {
            router.push('/app'); // Redirect if not admin/master
            return;
        }
        fetchClients();
    }, [user, globalLoading]);

    async function fetchClients() {
        const supabase = await createSPASassClient();
        const { data, error } = await supabase.getSupabaseClient()
            .from('portal_clients')
            .select('id, nome, slug, status, cor_primaria, cor_secundaria')
            .eq('status', 'active')
            .order('nome', { ascending: true });

        if (!error && data) {
            setClients(data);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-display-sm font-cereal text-ink flex items-center gap-3">
                    <LayoutGrid className="w-8 h-8 text-rausch" />
                    Central de Conteúdos
                </h1>
                <p className="text-muted mt-2">
                    Acesse os calendários e conteúdos de forma individual por cliente.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {clients.map(client => (
                    <Link
                        key={client.id}
                        href={`/app/calendario?client=${client.id}`}
                        className="group block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-hairline bg-canvas h-48 relative flex flex-col"
                    >
                        {/* Cover Color Area */}
                        <div 
                            className="h-2/3 w-full transition-colors opacity-90 group-hover:opacity-100 flex items-center justify-center"
                            style={{ backgroundColor: client.cor_primaria || '#FF385C' }}
                        >
                            {!client.cor_primaria && <Building2 className="w-8 h-8 text-white/50" />}
                        </div>
                        
                        {/* Info Area */}
                        <div className="flex-1 p-4 flex items-center justify-between bg-canvas">
                            <div>
                                <h3 className="font-semibold text-sm text-ink truncate max-w-[150px]">
                                    {client.nome}
                                </h3>
                                <p className="text-xs text-muted">Acessar Calendário</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center group-hover:bg-rausch group-hover:text-white transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                ))}
                
                {clients.length === 0 && (
                    <div className="col-span-full">
                        <EmptyState
                            icon={Building2}
                            title="Nenhum cliente ativo encontrado"
                            description="Quando houver clientes ativos no portal, eles aparecerão aqui."
                            variant="card"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
