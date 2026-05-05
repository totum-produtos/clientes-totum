"use client";
import React, { useEffect, useState } from "react";
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
} from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  slug: string;
  email_responsavel: string;
  status: string;
  primary_color: string | null;
}

interface Post {
  id: number;
  subject: string;
  tipo: string;
  published_at: string;
  views: number;
  likes: number;
  engagement_rate: number;
}

export default function CentralConteudoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "calendario">("posts");

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      fetchPosts(selectedCliente.id);
    }
  }, [selectedCliente]);

  async function fetchClientes() {
    setLoading(true);
    const supabase = await createSPASassClient();
    const { data } = await supabase
      .getSupabaseClient()
      .from("portal_clients")
      .select("id, nome, slug, email_responsavel, status, primary_color")
      .order("nome", { ascending: true });
    const list = data || [];
    setClientes(list);
    if (list.length > 0 && !selectedCliente) {
      setSelectedCliente(list[0]);
    }
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

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  const tipoColors: Record<string, string> = {
    porque: "bg-red-500",
    o_que: "bg-blue-500",
    como: "bg-green-500",
  };

  const tipoLabels: Record<string, string> = {
    porque: "Porquê",
    o_que: "O que",
    como: "Como",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-b-2 border-[#d81220] rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4">
      {/* Sidebar — lista de clientes */}
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-[#d81220]" />
            Central de Conteúdo
          </h1>
          <p className="text-xs text-gray-500 mt-1">Visão master de todos os clientes</p>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d81220]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {clientesFiltrados.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCliente(c)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                selectedCliente?.id === c.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{
                  backgroundColor: c.primary_color || "#d81220",
                }}
              >
                {c.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{c.nome}</p>
                <p className="text-xs opacity-70 truncate">{c.email_responsavel}</p>
              </div>
              <ChevronRight
                className={`h-4 w-4 shrink-0 ${
                  selectedCliente?.id === c.id ? "text-white" : "text-gray-400"
                }`}
              />
            </button>
          ))}
          {clientesFiltrados.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum cliente encontrado</p>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {selectedCliente ? (
          <div className="max-w-4xl mx-auto p-6">
            {/* Header do cliente */}
            <div className="bg-white rounded-xl border p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: selectedCliente.primary_color || "#d81220" }}
                  >
                    {selectedCliente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCliente.nome}</h2>
                    <p className="text-sm text-gray-500">{selectedCliente.email_responsavel}</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        selectedCliente.status === "ativo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedCliente.status}
                    </span>
                  </div>
                </div>

                {/* Links rápidos */}
                <div className="flex gap-2">
                  <a
                    href={`/app/calendario?client=${selectedCliente.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" /> Calendário
                  </a>
                  <a
                    href={`/app/arquivos?client=${selectedCliente.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 transition-colors"
                  >
                    <FolderOpen className="h-4 w-4" /> Arquivos
                  </a>
                  <a
                    href={`/app/drive?client=${selectedCliente.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Cloud className="h-4 w-4" /> Drive
                  </a>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white rounded-lg border p-1 w-fit">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "posts"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="h-4 w-4 inline mr-1.5" />
                Posts ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab("calendario")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "calendario"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CalendarDays className="h-4 w-4 inline mr-1.5" />
                Calendário
              </button>
            </div>

            {/* Lista de posts */}
            {activeTab === "posts" && (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              tipoColors[post.tipo] || "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs font-medium text-gray-500">
                            {tipoLabels[post.tipo] || post.tipo}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(post.published_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">{post.subject}</h3>
                      </div>
                      <div className="text-right text-xs text-gray-500 space-y-0.5">
                        <p>{post.views?.toLocaleString("pt-BR")} views</p>
                        <p>{post.likes?.toLocaleString("pt-BR")} likes</p>
                        <p>{post.engagement_rate}% eng</p>
                      </div>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="bg-white rounded-lg border p-8 text-center">
                    <List className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum post para este cliente</p>
                  </div>
                )}
              </div>
            )}

            {/* Calendário simples */}
            {activeTab === "calendario" && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Posts de {new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <div key={d} className="py-1 font-medium">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(1);
                    const firstDay = date.getDay();
                    const currentDay = i - firstDay + 1;
                    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    if (currentDay < 1 || currentDay > daysInMonth) {
                      return <div key={i} />;
                    }
                    const dayPosts = posts.filter((p) => {
                      const d = new Date(p.published_at);
                      return (
                        d.getDate() === currentDay &&
                        d.getMonth() === new Date().getMonth()
                      );
                    });
                    const isToday = currentDay === new Date().getDate();
                    return (
                      <div
                        key={i}
                        className={`min-h-[60px] border rounded-lg p-1 text-sm ${
                          isToday ? "ring-2 ring-[#d81220] ring-offset-1" : ""
                        } ${dayPosts.length > 0 ? "bg-gray-50" : ""}`}
                      >
                        <span className={`font-medium ${isToday ? "text-[#d81220]" : "text-gray-700"}`}>{currentDay}</span>
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {dayPosts.map((p) => (
                            <span
                              key={p.id}
                              className={`w-1.5 h-1.5 rounded-full ${
                                tipoColors[p.tipo] || "bg-gray-400"
                              }`}
                              title={p.subject}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Selecione um cliente para visualizar o conteúdo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
