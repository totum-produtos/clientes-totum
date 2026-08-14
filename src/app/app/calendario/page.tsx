"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { persistOrThrow } from "@/lib/persist";
import { Plus, Upload, RefreshCw, CalendarDays, ArrowLeft } from "lucide-react";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import PostModal, { type Post as PostModalData } from "@/components/calendar/PostModal";
import BulkPostModal, { type BulkPost } from "@/components/calendar/BulkPostModal";
import type { TablesInsert, TablesUpdate } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageError } from "@/components/ui/PageError";
import { getClientNome } from "@/services/db/clients";
import { getPostsByClient, updatePost, insertPost, insertPosts, deletePost } from "@/services/db/calendar";

type Post = {
  id: number;
  subject: string;
  tipo: string;
  published_at: string | null;
  views: number | null;
  likes: number | null;
  engagement_rate: number | null;
};

function CalendarioContent() {
  const { client, user } = useGlobal();
  const { showSuccess, showError } = useToast();
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get("client"); // Filtro por cliente (vindo da Central de Conteúdos)
  const isMaster = user?.role === "master" || user?.role === "admin";
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [overrideClientName, setOverrideClientName] = useState<string>("");

  async function fetchPosts() {
    const targetClientId = clientIdParam || client?.id;
    if (!targetClientId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const supabase = await createSPASassClient();
      const db = supabase.getSupabaseClient();

      // If browsing via Central de Conteúdos, also fetch client name
      if (clientIdParam && clientIdParam !== client?.id) {
        const { data: clientInfo } = await getClientNome(db, clientIdParam);
        if (clientInfo) setOverrideClientName(clientInfo.nome);
      }

      const { data, error } = await getPostsByClient(db, targetClientId);
      if (error) {
        showError("Erro ao carregar posts");
        console.error("Erro ao carregar posts:", error);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error("Critical error fetching posts:", error);
      showError("Erro inesperado ao carregar calendário.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [client, clientIdParam]);

  const events = posts
    .filter((p) => p.published_at)
    .map((p) => ({
      id: p.id,
      title: p.subject,
      date: new Date(p.published_at!),
      type: p.tipo,
    }));

  const handleDayClick = (date: Date) => {
    if (!isMaster) return; // Clientes não podem criar posts
    setSelectedDate(date);
    setSelectedPost(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: {
    id: string | number;
    title: string;
    date: Date;
    type: string;
  }) => {
    const post = posts.find((p) => p.id === event.id);
    if (post) {
      setSelectedPost(post);
      setSelectedDate(post.published_at ? new Date(post.published_at) : new Date());
      setModalOpen(true);
    }
  };

  const handleSavePost = async (postData: PostModalData) => {
    const targetClientId = clientIdParam || client?.id;
    if (!targetClientId) return;
    const supabase = await createSPASassClient();
    const payload = {
      ...postData,
      portal_client_id: targetClientId,
      creator: user?.id,
      published_at: new Date(postData.published_at ?? "").toISOString(),
    };

    if (selectedPost?.id) {
      const sb = supabase.getSupabaseClient();
      try {
        await persistOrThrow(
          updatePost(sb, selectedPost.id, payload as TablesUpdate<"wanda_posts">),
          { db: sb, source: "calendario:handleSavePost", metadata: { postId: selectedPost.id, clientId: targetClientId } },
        );
        showSuccess("Post atualizado com sucesso");
        setModalOpen(false);
        fetchPosts();
      } catch (error) {
        showError("Erro ao atualizar post");
        console.error("Erro ao atualizar:", error);
      }
    } else {
      const sb2 = supabase.getSupabaseClient();
      const { error } = await insertPost(sb2, { ...payload, post_id: `post_${Date.now()}` } as unknown as TablesInsert<"wanda_posts">);
      if (error) {
        showError("Erro ao criar post");
        console.error("Erro ao criar:", error);
      } else {
        showSuccess("Post criado com sucesso");
        setModalOpen(false);
        fetchPosts();
      }
    }
  };

  const handleDeletePost = async (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    const supabase = await createSPASassClient();
    const sbDel = supabase.getSupabaseClient();
    const { error } = await deletePost(sbDel, pendingDeleteId);
    if (error) {
      showError("Erro ao excluir post");
      console.error("Erro ao excluir:", error);
    } else {
      showSuccess("Post excluído com sucesso");
      setModalOpen(false);
      fetchPosts();
    }
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleBulkSave = async (bulkPosts: BulkPost[]) => {
    const targetClientId = clientIdParam || client?.id;
    if (!targetClientId) return;
    const supabase = await createSPASassClient();
    const payload = bulkPosts.map((p, idx) => ({
      ...p,
      portal_client_id: targetClientId,
      post_id: `post_${Date.now()}_${idx}`,
      published_at: new Date(p.published_at).toISOString(),
    }));
    const sbBulk = supabase.getSupabaseClient();
    const { error } = await insertPosts(sbBulk, payload as unknown as TablesInsert<"wanda_posts">[]);
    if (error) {
      showError("Erro ao criar posts em massa");
      console.error("Erro ao criar posts:", error);
    } else {
      showSuccess("Posts criados com sucesso");
      setBulkModalOpen(false);
      fetchPosts();
    }
  };

  const monthPosts = posts.filter((p) => {
    if (!p.published_at) return false;
    const d = new Date(p.published_at);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  });

  const currentClientName = overrideClientName || client?.nome || "";

  const targetClientId = clientIdParam || client?.id;

  if (!loading && !targetClientId) {
    return (
      <PageError
        title="Nenhum cliente selecionado"
        description="Você precisa selecionar um cliente para ver o calendário de postagens."
        action={isMaster ? (
          <Link href="/app/central-conteudo" className="block w-full py-3 bg-rausch text-white font-medium rounded-md hover:bg-rausch-active text-center transition-colors">
            Ir para Central de Conteúdos
          </Link>
        ) : null}
        defaultBack={null}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft pb-12">
      {/* Header */}
      <div className="bg-canvas border-b border-hairline">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Back button when browsing from Central */}
          {clientIdParam && (
            <Link href="/app/central-conteudo" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar para Central de Conteúdos
            </Link>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display-lg font-cereal text-ink flex items-center gap-3">
                <CalendarDays className="w-7 h-7 text-rausch" />
                Calendário de postagens
                {currentClientName && <span className="text-lg font-normal text-muted">{currentClientName}</span>}
              </h1>
              <p className="text-body-sm text-muted mt-1">
                Visualize e gerencie o conteúdo programado
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchPosts}
                disabled={loading}
                className="btn-ghost p-2"
                title="Atualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              {isMaster && (
                <>
                  <button
                    onClick={() => setBulkModalOpen(true)}
                    disabled={loading}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" /> Em massa
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      setSelectedDate(new Date());
                      setModalOpen(true);
                    }}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Novo post
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Legenda */}
        <div className="flex gap-6 text-caption">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-danger" />
            Porquê
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            O que
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success" />
            Como
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <CalendarGrid
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            events={events}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            isAdmin={isMaster}
          />
        )}

        {/* Lista de posts do mês */}
        <div className="bg-canvas rounded-md border border-hairline shadow-airbnb overflow-hidden">
          <div className="px-6 py-4 border-b border-hairline-soft">
            <h2 className="text-title-sm font-cereal text-ink">
              Posts de {currentMonth.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
            </h2>
          </div>
          <div className="p-6 space-y-2">
            {monthPosts.length === 0 ? (
              <p className="text-body-sm text-muted-soft text-center py-4">
                Nenhum post programado para este mês.
              </p>
            ) : (
              monthPosts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 border border-hairline rounded-md hover:bg-surface-soft cursor-pointer transition-colors"
                  onClick={() =>
                    handleEventClick({
                      id: p.id,
                      title: p.subject,
                      date: p.published_at ? new Date(p.published_at) : new Date(),
                      type: p.tipo,
                    })
                  }
                >
                  <div>
                    <p className="font-medium text-sm text-ink">{p.subject}</p>
                    <p className="text-xs text-muted">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString("pt-BR") : "—"} • {p.tipo}
                    </p>
                  </div>
                  <span className="text-xs text-muted-soft">
                    {p.views} views • {p.engagement_rate}% eng
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        post={selectedPost}
        date={selectedDate || null}
        clientName={currentClientName}
        isAdmin={isMaster}
      />

      <BulkPostModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSave={handleBulkSave}
        clientId={clientIdParam || client?.id || ""}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Excluir post"
        message="Tem certeza que deseja excluir este post?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}

export default function CalendarioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    }>
      <CalendarioContent />
    </Suspense>
  );
}
