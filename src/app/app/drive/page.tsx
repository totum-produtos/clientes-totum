"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGlobal } from "@/lib/context/GlobalContext";
import { createSPASassClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { Search, X, AlertCircle } from "lucide-react";
import ConnectButton from "@/components/drive/ConnectButton";
import Breadcrumb from "@/components/drive/Breadcrumb";
import FileList from "@/components/drive/FileList";
import UploadDropzone from "@/components/drive/UploadDropzone";
import { DriveFile } from "@/components/drive/FileItem";

interface BreadcrumbItem {
  id: string;
  name: string;
}

function DrivePageContent() {
  const { user, client } = useGlobal();
  const { showSuccess, showError } = useToast();
  const searchParams = useSearchParams();

  const [connected, setConnected] = useState<boolean | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [folderId, setFolderId] = useState("root");
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Check for OAuth callback params
  const oauthError = searchParams.get("error");
  const oauthConnected = searchParams.get("connected");

  useEffect(() => {
    if (oauthError) {
      showError(`Erro na conexão: ${oauthError}`);
    }
    if (oauthConnected) {
      showSuccess("Google Drive conectado com sucesso!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthError, oauthConnected]);

  // Check connection status
  useEffect(() => {
    if (!user) return;
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load files when connected or folder changes
  useEffect(() => {
    if (connected === true) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, folderId, searchQuery]);

  async function checkConnection() {
    try {
      const supabase = await createSPASassClient();
      const { data } = await supabase
        .getSupabaseClient()
        .from("google_drive_tokens")
        .select("user_id")
        .eq("user_id", user!.id)
        .single();
      setConnected(!!data);
    } catch {
      setConnected(false);
    }
  }

  async function loadFiles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folderId && folderId !== "root" && !searchQuery) {
        params.set("folderId", folderId);
      }
      if (searchQuery) {
        params.set("q", searchQuery);
      }
      params.set("pageSize", "50");

      const res = await fetch(`/api/drive/files?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao carregar arquivos");
      setFiles(data.files || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar arquivos";
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleConnect = async () => {
    setConnectLoading(true);
    try {
      const clientId = client?.id || "";
      const res = await fetch(`/api/drive/oauth/url?client_id=${clientId}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Erro ao gerar URL de autorização");
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao conectar";
      showError(msg);
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnectLoading(true);
    try {
      const res = await fetch("/api/drive/disconnect", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao desconectar");

      setConnected(false);
      setFiles([]);
      setFolderId("root");
      setBreadcrumb([]);
      showSuccess("Google Drive desconectado");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao desconectar";
      showError(msg);
    } finally {
      setDisconnectLoading(false);
    }
  };

  const handleFolderClick = useCallback((id: string, name: string) => {
    setBreadcrumb((prev) => [...prev, { id, name }]);
    setFolderId(id);
    setSearchQuery("");
    setSearchInput("");
  }, []);

  const handleBreadcrumbNavigate = useCallback((id: string) => {
    if (id === "root") {
      setBreadcrumb([]);
      setFolderId("root");
    } else {
      const idx = breadcrumb.findIndex((b) => b.id === id);
      if (idx >= 0) {
        setBreadcrumb((prev) => prev.slice(0, idx + 1));
        setFolderId(id);
      }
    }
    setSearchQuery("");
    setSearchInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumb]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId && folderId !== "root") {
      formData.append("folderId", folderId);
    }

    const res = await fetch("/api/drive/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao enviar arquivo");

    showSuccess(`"${file.name}" enviado com sucesso!`);
    await loadFiles();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  if (connected === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">Google Drive</h1>
          <p className="text-muted text-sm mt-1">
            {connected
              ? "Gerencie seus arquivos diretamente pela plataforma"
              : "Conecte seu Google Drive para acessar e enviar arquivos"}
          </p>
        </div>
        <ConnectButton
          connected={connected}
          loading={connectLoading || disconnectLoading}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </div>

      {/* Not Connected State */}
      {!connected && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-2">
              Google Drive não conectado
            </h3>
            <p className="text-sm text-muted max-w-md mx-auto mb-6">
              Conecte sua conta do Google Drive para visualizar, enviar e gerenciar
              arquivos diretamente pela plataforma da Totum.
            </p>
            <ConnectButton
              connected={false}
              loading={connectLoading}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </CardContent>
        </Card>
      )}

      {/* Connected State */}
      {connected && (
        <>
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enviar arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadDropzone onUpload={handleUpload} />
            </CardContent>
          </Card>

          {/* Files Area */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base">Arquivos</CardTitle>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Buscar arquivos..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-9 pr-8 py-2 text-sm border border-hairline rounded-md focus:outline-none focus:ring-2 focus:ring-rausch w-64"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 text-sm bg-rausch text-white rounded-md hover:bg-rausch-active transition-colors"
                  >
                    Buscar
                  </button>
                </form>
              </div>
              <div className="mt-3">
                <Breadcrumb items={breadcrumb} onNavigate={handleBreadcrumbNavigate} />
              </div>
            </CardHeader>
            <CardContent>
              <FileList
                files={files}
                onFolderClick={handleFolderClick}
                loading={loading}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function DrivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DrivePageContent />
    </Suspense>
  );
}
