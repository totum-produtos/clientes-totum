"use client";

import React, { useEffect, useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import { AlertCircle, CloudOff, FileWarning, Search } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type ClientePendencia = {
    id: string;
    nome: string;
    slug: string;
    pendencias: string[];
};

export default function PendenciasPage() {
    const [clientes, setClientes] = useState<ClientePendencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchPendencias() {
            setLoading(true);
            const supabase = await createSPASassClient();
            const { data } = await supabase.getSupabaseClient()
                .from("portal_clients")
                .select("id, nome, slug, drive_folder_cliente_id, profile_data")
                .eq("status", "active")
                .order("nome");

            if (data) {
                const pendentes: ClientePendencia[] = [];
                data.forEach(c => {
                    const pendencias = [];
                    if (!c.drive_folder_cliente_id) {
                        pendencias.push("drive_missing");
                    }
                    const pd = c.profile_data as Record<string, unknown>;
                    if (!pd || !pd.briefing_completed) {
                        pendencias.push("briefing_missing");
                    }

                    if (pendencias.length > 0) {
                        pendentes.push({
                            id: c.id,
                            nome: c.nome,
                            slug: c.slug,
                            pendencias
                        });
                    }
                });
                setClientes(pendentes);
            }
            setLoading(false);
        }
        fetchPendencias();
    }, []);

    const filtered = clientes.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-ink">Painel de Pendências</h1>
                <p className="text-muted">Acompanhe clientes com configurações de onboarding incompletas</p>
            </div>

            <div className="flex items-center gap-4 bg-canvas p-4 rounded-md shadow-airbnb border border-hairline">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar cliente pendente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-surface-soft border-none rounded-md text-sm focus:ring-2 focus:ring-rausch"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <LoadingSpinner />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-canvas rounded-md border border-hairline shadow-airbnb">
                    <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-success-text" />
                    </div>
                    <h3 className="text-lg font-bold text-ink mb-1">Nenhuma Pendência!</h3>
                    <p className="text-muted text-sm">Todos os clientes ativos estão com o onboarding concluído.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(c => (
                        <div key={c.id} className="bg-canvas border border-hairline rounded-md p-5 shadow-airbnb hover:shadow-airbnb-hover transition-all">
                            <h3 className="font-bold text-ink mb-3">{c.nome}</h3>
                            <div className="space-y-2 mb-5">
                                {c.pendencias.includes("drive_missing") && (
                                    <div className="flex items-center gap-2 text-sm text-warning-text bg-warning-bg px-2 py-1.5 rounded">
                                        <CloudOff className="w-4 h-4 shrink-0" />
                                        <span>Pasta do Drive ausente</span>
                                    </div>
                                )}
                                {c.pendencias.includes("briefing_missing") && (
                                    <div className="flex items-center gap-2 text-sm text-danger-text bg-danger-bg px-2 py-1.5 rounded">
                                        <FileWarning className="w-4 h-4 shrink-0" />
                                        <span>Briefing incompleto</span>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={`/app/admin/clientes/${c.id}`}
                                className="block w-full py-2 text-center bg-surface-soft text-ink text-sm font-medium hover:bg-surface-strong rounded transition-colors"
                            >
                                Resolver Pendência
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
