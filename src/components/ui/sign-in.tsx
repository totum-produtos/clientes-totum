"use client";

import React from "react";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

// Componente de login do portal Totum.
// Layout split-screen: form à esquerda, hero da marca à direita.
// Paleta segue tokens do design system (rausch, ink, body, muted,
// canvas, surface-soft, hairline, danger-bg). Sem dependência de
// tokens shadcn default não configurados.

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  brandTagline?: string;
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword?: () => void;
  footer?: React.ReactNode;
}

const FieldWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-hairline bg-canvas transition-colors focus-within:border-rausch focus-within:ring-2 focus-within:ring-rausch/15">
    {children}
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title,
  description,
  heroImageSrc,
  brandTagline = "Marketing para Resultados",
  email,
  password,
  showPassword,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onResetPassword,
  footer,
}) => {
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-surface-soft overflow-auto">
      {/* Coluna esquerda — formulário */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 bg-canvas">
        <div className="w-full max-w-md">
          <div className="animate-element animate-delay-100 mb-10 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Totum"
              width={140}
              height={48}
              priority
              className="h-10 w-auto"
            />
          </div>

          <h1 className="animate-element animate-delay-200 text-3xl md:text-4xl font-bold text-ink tracking-tight leading-tight">
            {title || "Portal do Cliente"}
          </h1>
          <p className="animate-element animate-delay-300 mt-3 text-base text-body">
            {description || "Acesse sua central de conteúdo e acompanhe o trabalho da Totum em tempo real."}
          </p>

          {error && (
            <div className="animate-element animate-delay-400 mt-6 flex items-start gap-2 p-4 rounded-2xl border border-danger-bg bg-danger-bg text-sm text-danger-text">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div className="animate-element animate-delay-500">
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                Email
              </label>
              <FieldWrapper>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent text-sm text-ink placeholder-muted px-4 py-4 rounded-2xl focus:outline-none"
                />
              </FieldWrapper>
            </div>

            <div className="animate-element animate-delay-600">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  Senha
                </label>
                {onResetPassword && (
                  <button
                    type="button"
                    onClick={onResetPassword}
                    className="text-xs text-rausch hover:text-rausch-active transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <FieldWrapper>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-ink placeholder-muted px-4 py-4 pr-12 rounded-2xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={onTogglePassword}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-body transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </FieldWrapper>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="animate-element animate-delay-700 w-full flex items-center justify-center gap-2 rounded-2xl bg-rausch py-4 text-sm font-semibold text-white shadow-airbnb hover:bg-rausch-active disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {footer && (
            <div className="animate-element animate-delay-800 mt-8">
              {footer}
            </div>
          )}

          <p className="animate-element animate-delay-900 mt-12 text-xs text-muted text-center">
            © {new Date().getFullYear()} Grupo Totum &middot; Marketing para Resultados
          </p>
        </div>
      </section>

      {/* Coluna direita — hero da marca */}
      <section className="hidden md:flex flex-1 relative p-4">
        <div
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl overflow-hidden bg-rausch"
          style={
            heroImageSrc
              ? {
                  backgroundImage: `url(${heroImageSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundImage:
                    "radial-gradient(circle at 50% 60%, hsl(349 100% 55%) 0%, hsl(349 80% 32%) 55%, hsl(0 0% 8%) 100%)",
                }
          }
        >
          {/* gradiente para legibilidade da tagline */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* tagline */}
          <div className="absolute bottom-10 left-0 right-0 px-10 text-center">
            <p className="animate-element animate-delay-1000 text-[11px] font-semibold tracking-[0.3em] uppercase text-white/70 mb-2">
              Grupo Totum
            </p>
            <p className="animate-element animate-delay-1200 text-lg md:text-xl font-medium text-white tracking-tight">
              {brandTagline}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
