"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { createSPASassClient } from "@/lib/supabase/client";
import { useGlobal } from "@/lib/context/GlobalContext";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/db/notifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string | null;
  data?: unknown;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useGlobal();

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadNotifications() {
    if (!user) return;
    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      const { data } = await getNotifications(sb, user.id);
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  }

  async function markAsRead(id: string) {
    if (!user) return;
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    await markNotificationRead(sb, id, user.id);
    loadNotifications();
  }

  async function markAllAsRead() {
    if (!user) return;
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();
    await markAllNotificationsRead(sb, user.id);
    loadNotifications();
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "alteracao_pendente": return <Clock className="w-4 h-4 text-amber-500" />;
      case "alteracao_aprovada": return <CheckCircle className="w-4 h-4 text-success" />;
      case "alteracao_rejeitada": return <XCircle className="w-4 h-4 text-danger-text" />;
      default: return <FileText className="w-4 h-4 text-muted-soft" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-muted hover:text-ink hover:bg-surface-strong rounded-md transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-canvas rounded-lg border shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-ink">Notificações</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-rausch hover:underline font-medium">
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-soft">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Nenhuma notificação
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { markAsRead(n.id); }}
                  className={`px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-surface-soft transition-colors ${!n.read ? "bg-surface-soft/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-semibold text-ink" : "text-ink"}`}>{n.title}</p>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-soft mt-1">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-rausch rounded-full mt-1.5 shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t bg-surface-soft">
            <button
              onClick={() => { setOpen(false); router.push("/app/notificacoes"); }}
              className="w-full text-center text-xs text-rausch hover:underline font-medium py-1"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
