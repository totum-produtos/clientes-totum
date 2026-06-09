"use client";

import React, { useEffect, useState } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { ChevronDown, Users } from "lucide-react";

export default function SpoofingSelector() {
    const { user, client, setSpoofedClient } = useGlobal();
    const [isOpen, setIsOpen] = useState(false);
    const [clientes, setClientes] = useState<{ id: string, nome: string }[]>([]);

    const isMaster = user?.role === "master" || user?.role === "admin";

    useEffect(() => {
        if (!isMaster || !isOpen) return;
        async function fetchClientes() {
            const supabase = await createSPASassClient();
            const { data } = await supabase.getSupabaseClient()
                .from("portal_clients")
                .select("id, nome")
                .eq("status", "active")
                .order("nome");
            if (data) {
                setClientes(data);
            }
        }
        fetchClientes();
    }, [isMaster, isOpen]);

    if (!isMaster) return null;

    return (
        <div className="relative ml-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-soft border border-hairline rounded-md text-xs font-medium text-ink hover:bg-surface-strong transition-colors"
            >
                <Users className="w-3.5 h-3.5 text-rausch" />
                <span className="truncate max-w-[120px]">
                    {client ? client.nome : "Visão Global"}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-canvas rounded-md shadow-airbnb border border-hairline z-50 max-h-80 flex flex-col">
                    <div className="p-2 border-b border-hairline bg-surface-soft flex justify-between items-center">
                        <span className="text-xs font-bold text-muted uppercase tracking-wide">Visão como Cliente</span>
                        {client && (
                            <button
                                onClick={() => { setSpoofedClient(null); setIsOpen(false); }}
                                className="text-xs text-danger-text hover:underline"
                            >
                                Limpar
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto p-1">
                        <button
                            onClick={() => { setSpoofedClient(null); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${!client ? "bg-rausch/10 text-rausch font-medium" : "text-ink hover:bg-surface-soft"}`}
                        >
                            Visão Global (Admin)
                        </button>
                        {clientes.map(c => (
                            <button
                                key={c.id}
                                onClick={() => { setSpoofedClient(c.id); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${client?.id === c.id ? "bg-rausch/10 text-rausch font-medium" : "text-ink hover:bg-surface-soft"}`}
                            >
                                {c.nome}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
