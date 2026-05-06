"use client";
import React, { useEffect, useState, useMemo } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import {
  CalendarDays,
  List,
  FolderOpen,
  Cloud,
  Search,
  ChevronRight,
  LayoutGrid,
  User,
  Filter,
  Download,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/components/ui/ToastProvider";

interface Cliente {
  id: string;
  nome: string;
  slug: string;
  email_responsavel: string;
  status: string | null;
  cor_primaria: string | null;
}

interface Post {
  id: number;
  subject: string;
  tipo: string;
  published_at: string | null;
  views: number | null;
  likes: number | null;
  engagement_rate: number | null;
}

export default function CentralConteudoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "calendario">("posts");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [postsCountMap, setPostsCountMap] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchPosts(selectedCliente.id);
    }
  }, [selectedCliente]);

  // Realtime: notificações de novos posts
  useEffect(() => {
    if (!selectedCliente) return;
    let channel: any = null;

    async function setupRealtime() {
      const supabase = await createSPASassClient();
      channel = supabase
        .getSupabaseClient()
        .channel("central-conteudo-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "wanda_posts",
            filter: selectedCliente ? `portal_client_id=eq.${selectedCliente.id}` : undefined,
          },
          (payload: any) => {
            const novoPost = payload.new;
            setToastMessage(
              `Novo post: "${novoPost.subject?.slice(0, 40)}${
                novoPost.subject?.length > 40 ? "..." : ""
              }"`
            );
            if (selectedCliente) fetchPosts(selectedCliente.id);
          }
        )
        .subscribe();
    }
    setupRealtime();

    return () => {
      if (channel) {
        createSPASassClient().then((s) =>
          s.getSupabaseClient().removeChannel(channel)
        );
      }
    };
  }, [selectedCliente?.id]);

  async function fetchClientes() {
    setLoading(true);
    const supabase = await createSPASassClient();
    const sb = supabase.getSupabaseClient();

    const { data } = await sb
      .from("portal_clients")
      .select("id, nome, slug, email_responsavel, status, cor_primaria")
      .order("nome", { ascending: true });
    const list = data || [];
    setClientes(list);
    if (list.length > 0 && !selectedCliente) {
      setSelectedCliente(list[0]);
    }

    // Buscar contagem de posts do mês atual para cada cliente
    const inicio = new Date();
    inicio.setDate(1);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0, 23, 59, 59);

    const { data: countData } = await sb
      .from("wanda_posts")
      .select("portal_client_id, id")
      .gte("published_at", inicio.toISOString())
      .lte("published_at", fim.toISOString());

    const counts: Record<string, number> = {};
    (countData || []).forEach((p: any) => {
      counts[p.portal_client_id] = (counts[p.portal_client_id] || 0) + 1;
    });
    setPostsCountMap(counts);

    setLoading(false);
  }

  async function fetchPosts(clientId: string) {
    const supabase = await createSPASassClient();
    const { data } = await supabase
      .getSupabaseClient()
      .from("wanda_posts")
      .select("id, subject, tipo, published_at, views, likes, engagement_rate")
      .eq("portal_client_id", clientId)
      .order("published_at", { ascending: false });
    setPosts(data || []);
  }

  async function moverPost(postId: number, dias: number) {
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.published_at) return;
    const novaData = new Date(post.published_at);
    novaData.setDate(novaData.getDate() + dias);

    const supabase = await createSPASassClient();
    const { error } = await supabase
      .getSupabaseClient()
      .from("wanda_posts")
      .update({ published_at: novaData.toISOString() })
      .eq("id", postId);

    if (error) {
      showError("Erro ao mover: " + error.message);
    } else {
      showSuccess("Post movido com sucesso");
      fetchPosts(selectedCliente!.id);
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  const postsFiltrados = useMemo(() => {
    if (filtroTipo === "todos") return posts;
    return posts.filter((p) => p.tipo === filtroTipo);
  }, [posts, filtroTipo]);

  const handleExportCSV = () => {
    const headers = "subject,tipo,published_at,views,likes,engagement_rate\n";
    const rows = postsFiltrados
      .map(
        (p) =>
          `"${p.subject.replace(/"/g, '""')}",${p.tipo},${p.published_at},${p.views || 0},${p.likes || 0},${p.engagement_rate || 0}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posts_${selectedCliente?.slug || "cliente"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calcular gaps: dias do mês atual sem posts (até hoje)
  const gapDias = useMemo(() => {
    const hoje = new Date().getDate();
    const diasComPost = new Set(
      posts
        .filter((p) => {
          if (!p.published_at) return false;
          const d = new Date(p.published_at);
          return d.getMonth() === new Date().getMonth();
        })
        .map((p) => p.published_at ? new Date(p.published_at).getDate() : 0)
    );
    const gaps: number[] = [];
    for (let d = 1; d <= hoje; d++) {
      if (!diasComPost.has(d)) gaps.push(d);
    }
    return gaps;
  }, [posts]);

  const tipoColors: Record<string, string> = {
    porque: "bg-danger",
    o_que: "bg-surface-soft",
    como: "bg-success",
  };

  const tipoLabels: Record<string, string> = {
    porque: "Porquê",
    o_que: "O que",
    como: "Como",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-b-2 border-rausch rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Sidebar — lista de clientes */}
      <div className="w-72 bg-canvas border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-ink flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-rausch" />
            Central de Conteúdo
          </h1>
          <p className="text-xs text-muted mt-1">Visão master de todos os clientes</p>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-soft" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-rausch"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {clientesFiltrados.map((c) => {
            const count = postsCountMap[c.id] || 0;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCliente(c)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                  selectedCliente?.id === c.id
                    ? "bg-ink text-white"
                    : "text-ink hover:bg-surface-strong"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: c.cor_primaria || "rausch" }}
                >
                  {c.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{c.nome}</p>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          selectedCliente?.id === c.id
                            ? "bg-canvas/20 text-white"
                            : "bg-surface-strong text-body"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-70 truncate">{c.email_responsavel}</p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 ${
                    selectedCliente?.id === c.id ? "text-white" : "text-muted-soft"
                  }`}
                />
              </button>
            );
          })}
          {clientesFiltrados.length === 0 && (
            <p className="text-sm text-muted-soft text-center py-4">
              Nenhum cliente encontrado
            </p>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto bg-surface-soft">
        {selectedCliente ? (
          <div className="max-w-4xl mx-auto p-6">
            {/* Header do cliente */}
            <div className="bg-canvas rounded-md border p-6 mb-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-md flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: selectedCliente.cor_primaria || "rausch" }}
                  >
                    {selectedCliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink">
                      {selectedCliente.nome}
                    </h2>
                    <p className="text-sm text-muted">
                      {selectedCliente.email_responsavel}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        selectedCliente.status === "ativo"
                          ? "bg-success-bg text-success-text"
                          : "bg-surface-strong text-body"
                      }`}
                    >
                      {selectedCliente.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/app/calendario?client=${selectedCliente.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-surface-soft transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" /> Calendário
                  </a>
                  <a
                    href={`/app/arquivos?client=${selectedCliente.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-surface-soft transition-colors"
                  >
                    <FolderOpen className="h-4 w-4" /> Arquivos
                  </a>
                  <a
                    href={`/app/drive?client=${selectedCliente.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-surface-soft transition-colors"
                  >
                    <Cloud className="h-4 w-4" /> Drive
                  </a>
                </div>
              </div>
            </div>

            {/* Alerta de gaps */}
            {gapDias.length > 0 && activeTab === "calendario" && (
              <div className="bg-warning-bg border border-warning-bg rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning-text shrink-0" />
                <p className="text-sm text-warning-text">
                  <span className="font-semibold">{gapDias.length} dia(s)</span> sem post
                  neste mês até hoje: {gapDias.slice(0, 10).join(", ")}
                  {gapDias.length > 10 ? "..." : ""}
                </p>
              </div>
            )}

            {/* Tabs + filtros + export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex gap-1 bg-canvas rounded-lg border p-1 w-fit">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "posts"
                      ? "bg-ink text-white"
                      : "text-body hover:bg-surface-strong"
                  }`}
                >
                  <List className="h-4 w-4 inline mr-1.5" />
                  Posts ({postsFiltrados.length})
                </button>
                <button
                  onClick={() => setActiveTab("calendario")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "calendario"
                      ? "bg-ink text-white"
                      : "text-body hover:bg-surface-strong"
                  }`}
                >
                  <CalendarDays className="h-4 w-4 inline mr-1.5" />
                  Calendário
                </button>
              </div>

              {activeTab === "posts" && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-canvas rounded-lg border px-2 py-1">
                    <Filter className="h-3.5 w-3.5 text-muted-soft ml-1" />
                    {(["todos", "porque", "o_que", "como"] as const).map(
                      (tipo) => (
                        <button
                          key={tipo}
                          onClick={() => setFiltroTipo(tipo)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            filtroTipo === tipo
                              ? "bg-ink text-white"
                              : "text-muted hover:bg-surface-strong"
                          }`}
                        >
                          {tipo === "todos"
                            ? "Todos"
                            : tipoLabels[tipo] || tipo}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm hover:bg-surface-soft transition-colors"
                    title="Exportar posts para CSV"
                  >
                    <Download className="h-4 w-4" /> Exportar
                  </button>
                </div>
              )}
            </div>

            {/* Lista de posts */}
            {activeTab === "posts" && (
              <div className="space-y-3">
                {postsFiltrados.map((post) => (
                  <div
                    key={post.id}
                    className="bg-canvas rounded-lg border p-4 hover:shadow-airbnb transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              tipoColors[post.tipo] || "bg-muted"
                            }`}
                          />
                          <span className="text-xs font-medium text-muted">
                            {tipoLabels[post.tipo] || post.tipo}
                          </span>
                          <span className="text-xs text-muted-soft">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            ) : "—"}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-ink">
                          {post.subject}
                        </h3>
                      </div>
                      <div className="text-right text-xs text-muted space-y-0.5">
                        <p>{post.views?.toLocaleString("pt-BR")} views</p>
                        <p>{post.likes?.toLocaleString("pt-BR")} likes</p>
                        <p>{post.engagement_rate}% eng</p>
                      </div>
                    </div>

                    {/* Ações rápidas: mover data */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-hairline-soft">
                      <span className="text-[11px] text-muted-soft uppercase font-medium">
                        Mover:
                      </span>
                      <button
                        onClick={() => moverPost(post.id, -1)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] border hover:bg-surface-soft transition-colors"
                        title="Voltar 1 dia"
                      >
                        <ArrowLeft className="h-3 w-3" /> -1 dia
                      </button>
                      <button
                        onClick={() => moverPost(post.id, 1)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] border hover:bg-surface-soft transition-colors"
                        title="Avançar 1 dia"
                      >
                        <ArrowRight className="h-3 w-3" /> +1 dia
                      </button>
                      <button
                        onClick={() => moverPost(post.id, 7)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] border hover:bg-surface-soft transition-colors"
                        title="Avançar 1 semana"
                      >
                        <ArrowRight className="h-3 w-3" /> +1 sem
                      </button>
                    </div>
                  </div>
                ))}
                {postsFiltrados.length === 0 && (
                  <div className="bg-canvas rounded-lg border p-8 text-center">
                    <List className="h-8 w-8 text-muted-soft mx-auto mb-2" />
                    <p className="text-sm text-muted">
                      Nenhum post para este cliente
                    </p>
                    {filtroTipo !== "todos" && (
                      <button
                        onClick={() => setFiltroTipo("todos")}
                        className="text-xs text-rausch mt-2 hover:underline"
                      >
                        Limpar filtro
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Calendário com gap indicator */}
            {activeTab === "calendario" && (
              <div className="bg-canvas rounded-lg border p-6">
                <h3 className="text-sm font-semibold text-ink mb-4">
                  Posts de{" "}
                  {new Date().toLocaleString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (d) => (
                      <div key={d} className="py-1 font-medium">
                        {d}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(1);
                    const firstDay = date.getDay();
                    const currentDay = i - firstDay + 1;
                    const daysInMonth = new Date(
                      date.getFullYear(),
                      date.getMonth() + 1,
                      0
                    ).getDate();
                    if (currentDay < 1 || currentDay > daysInMonth) {
                      return <div key={i} />;
                    }
                    const dayPosts = posts.filter((p) => {
                      if (!p.published_at) return false;
                      const d = new Date(p.published_at);
                      return (
                        d.getDate() === currentDay &&
                        d.getMonth() === new Date().getMonth()
                      );
                    });
                    const isToday = currentDay === new Date().getDate();
                    const isPast = currentDay < new Date().getDate();
                    const hasGap = isPast && dayPosts.length === 0;

                    return (
                      <div
                        key={i}
                        className={`min-h-[60px] border rounded-lg p-1 text-sm ${
                          isToday
                            ? "ring-2 ring-rausch ring-offset-1"
                            : ""
                        } ${
                          hasGap
                            ? "border-danger-bg bg-danger-bg"
                            : dayPosts.length > 0
                            ? "bg-surface-soft"
                            : ""
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            isToday
                              ? "text-rausch"
                              : hasGap
                              ? "text-danger-text"
                              : "text-ink"
                          }`}
                        >
                          {currentDay}
                        </span>
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {dayPosts.map((p) => (
                            <span
                              key={p.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                tipoColors[p.tipo] || "bg-muted"
                              }`}
                              title={p.subject}
                            />
                          ))}
                          {hasGap && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-danger"
                              title="Sem post"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    Dia sem post (passado)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-hairline" />
                    Dia futuro
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-soft mx-auto mb-3" />
              <p className="text-muted">
                Selecione um cliente para visualizar o conteúdo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
