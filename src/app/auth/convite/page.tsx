"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

type InviteData = {
  client_id: string;
  email: string;
  expires_at: string | null;
  portal_clients: { nome: string } | null;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro desconhecido";
}

function ConviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [validando, setValidando] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [success, setSuccess] = useState(false);

  const validarToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/invite?token=${encodeURIComponent(token!)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Convite inválido. Solicite um novo convite.");
        setLoading(false);
        return;
      }

      setInviteData(data);
      setLoading(false);
    } catch (err: unknown) {
      setError("Erro ao validar convite: " + errorMessage(err));
      setLoading(false);
    }
  }, [token]);

  // Valida o token ao carregar
  useEffect(() => {
    if (!token) {
      setError("Link de convite inválido. Solicite um novo convite ao administrador.");
      setLoading(false);
      return;
    }
    validarToken();
  }, [token, validarToken]);

  async function handleCriarConta(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setValidando(true);

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setValidando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      setValidando(false);
      return;
    }

    try {
      const supabase = await createSPASassClient();
      const sb = supabase.getSupabaseClient();
      let activeSession = (await sb.auth.getSession()).data.session;
      if (!inviteData) {
        setError("Convite inválido. Solicite um novo convite ao administrador.");
        setValidando(false);
        return;
      }

      // 1. Cria o usuário no Supabase Auth
      const { data: authData, error: authError } = await sb.auth.signUp({
        email: inviteData.email,
        password: senha,
      });

      if (authError) {
        // Se o usuário já existe, tenta fazer login
        if (authError.message.includes("already registered") || authError.message.includes("User already registered")) {
          const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
            email: inviteData.email,
            password: senha,
          });
          if (signInError) {
            setError("Este email já está cadastrado. Use a senha existente ou recupere-a.");
            setValidando(false);
            return;
          }
          activeSession = signInData.session;
        } else {
          setError("Erro ao criar conta: " + authError.message);
          setValidando(false);
          return;
        }
      }

      const session = authData.session || activeSession || (await sb.auth.getSession()).data.session;
      if (!session?.access_token) {
        setError("Conta criada. Confirme seu email e faça login para concluir o acesso.");
        setValidando(false);
        return;
      }

      // 2. Vincula o usuário ao cliente
      const acceptResponse = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      });
      const acceptData = await acceptResponse.json();

      if (!acceptResponse.ok) {
        setError(acceptData.error || "Erro ao vincular ao cliente.");
        setValidando(false);
        return;
      }

      setSuccess(true);

      // Redireciona após 2 segundos
      setTimeout(() => {
        router.push("/app");
      }, 2000);
    } catch (err: unknown) {
      setError("Erro inesperado: " + errorMessage(err));
    } finally {
      setValidando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft">
        <Loader2 className="h-8 w-8 animate-spin text-rausch" />
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft p-4">
        <div className="bg-canvas rounded-lg border p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-danger mx-auto mb-4" />
          <h1 className="text-lg font-bold text-ink mb-2">Convite inválido</h1>
          <p className="text-sm text-muted mb-4">{error}</p>
          <a
            href="/auth/login"
            className="inline-block px-4 py-2 bg-rausch text-white rounded-lg text-sm font-medium hover:bg-rausch/90 transition-colors"
          >
            Ir para o login
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft p-4">
        <div className="bg-canvas rounded-lg border p-8 max-w-md w-full text-center">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h1 className="text-lg font-bold text-ink mb-2">Conta criada com sucesso!</h1>
          <p className="text-sm text-muted mb-4">
            Você está sendo redirecionado para o portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft p-4">
      <div className="bg-canvas rounded-lg border p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-rausch/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="h-6 w-6 text-rausch" />
          </div>
          <h1 className="text-xl font-bold text-ink">Complete seu cadastro</h1>
          <p className="text-sm text-muted mt-1">
            Você foi convidado para acessar o portal da{" "}
            <strong className="text-ink">{inviteData?.portal_clients?.nome}</strong>
          </p>
          <p className="text-xs text-muted-soft mt-1">{inviteData?.email}</p>
        </div>

        <form onSubmit={handleCriarConta} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Crie uma senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-soft" />
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-10 py-2 border rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-rausch"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-muted-soft hover:text-ink"
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Confirme a senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-soft" />
              <input
                type={mostrarSenha ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
                className="w-full pl-9 pr-3 py-2 border rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-rausch"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-danger-bg border border-danger-bg rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-danger-text shrink-0 mt-0.5" />
              <p className="text-sm text-danger-text">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={validando}
            className="w-full bg-rausch text-white py-2.5 rounded-lg text-sm font-medium hover:bg-rausch/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validando ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando conta...
              </span>
            ) : (
              "Criar conta e acessar"
            )}
          </button>
        </form>

        <p className="text-xs text-muted-soft text-center mt-4">
          Este link expira em 24 horas. Se expirar, solicite um novo convite.
        </p>
      </div>
    </div>
  );
}

export default function ConvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-soft">
        <Loader2 className="h-8 w-8 animate-spin text-rausch" />
      </div>
    }>
      <ConviteContent />
    </Suspense>
  );
}
