"use client";

import React, { useState, useEffect } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  Bell, Clock, CheckCircle, XCircle, FileText, Check, Trash2, Filter
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string | null;
  data?: any;
}

type FilterType = "todas" | "nao_lidas" | "lidas";

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const supabase = await createSPASassClient();
      const { data } = await supabase.getSupabaseClient()
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    const supabase = await createSPASassClient();
    await supabase.getSupabaseClient().from("notifications").update({ read: true }).eq("id", id);
    loadNotifications();
  }

  async function markAllAsRead() {
    const supabase = await createSPASassClient();
    await supabase.getSupabaseClient().from("notifications").update({ read: true }).eq("read", false);
    loadNotifications();
  }

  async function deleteNotification(id: string) {
    const supabase = await createSPASassClient();
    await supabase.getSupabaseClient().from("notifications").delete().eq("id", id);
    loadNotifications();
  }

  const filtered = notifications.filter(n => {
    if (filter === "nao_lidas") return !n.read;
    if (filter === "lidas") return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string, read: boolean) => {
    const opacity = read ? "opacity-50" : "";
    switch (type) {
      case "alteracao_pendente": return <Clock className={`w-5 h-5 text-amber-500 ${opacity}`} />;
      case "alteracao_aprovada": return <CheckCircle className={`w-5 h-5 text-success ${opacity}`} />;
      case "alteracao_rejeitada": return <XCircle className={`w-5 h-5 text-danger-text ${opacity}`} />;
      default: return <FileText className={`w-5 h-5 text-muted-soft ${opacity}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      <div className="bg-canvas border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-ink">NOTIFICAÇÕES</h1>
              <p className="text-sm text-muted mt-1">Acompanhe todas as suas notificações</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors">
                <Check className="w-4 h-4" /> Marcar todas como lidas
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-soft" />
          {(["todas", "nao_lidas", "lidas"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === f
                  ? "bg-rausch text-white shadow"
                  : "bg-canvas text-body hover:bg-surface-strong border"
              }`}
            >
              {f === "todas" ? "Todas" : f === "nao_lidas" ? `Não lidas (${unreadCount})` : "Lidas"}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-canvas rounded-lg border shadow-airbnb p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-soft mb-4" />
            <h3 className="text-lg font-medium text-ink mb-1">Nenhuma notificação</h3>
            <p className="text-sm text-muted">Você não tem notificações {filter === "nao_lidas" ? "não lidas" : filter === "lidas" ? "lidas" : ""} no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(n => (
              <div
                key={n.id}
                className={`bg-canvas rounded-lg border shadow-airbnb p-5 flex items-start gap-4 transition-all ${!n.read ? "border-hairline bg-surface-soft/30" : ""}`}
              >
                <div className="mt-0.5">{getIcon(n.type, n.read)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm ${!n.read ? "font-semibold text-ink" : "text-ink"}`}>{n.title}</h4>
                    {!n.read && <span className="px-2 py-0.5 bg-surface-soft text-rausch text-[10px] font-bold rounded-full uppercase">Nova</span>}
                  </div>
                  <p className="text-sm text-muted">{n.message}</p>
                  <p className="text-xs text-muted-soft mt-2">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="p-2 text-muted-soft hover:text-success-text hover:bg-success-bg rounded-lg transition-colors" title="Marcar como lida">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="p-2 text-muted-soft hover:text-danger-text hover:bg-danger-bg rounded-lg transition-colors" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
