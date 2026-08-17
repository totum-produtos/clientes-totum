"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { ImageSlider, type SliderImage } from "@/components/ui/image-slider";
import { GoogleIcon } from "@/components/ui/auth-icons";
import { cn } from "@/lib/utils";

const SLIDER_IMAGES: SliderImage[] = [
  { src: "/login/slide-01.jpg", alt: "Seus projetos Totum" },
  { src: "/login/slide-02.jpg", alt: "Resultados e entregas" },
  { src: "/login/slide-03.jpg", alt: "Acompanhamento em tempo real" },
];

const pillButton =
  "inline-flex items-center justify-center gap-2 rounded-full text-[16px] font-normal transition-all duration-300 outline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-rausch disabled:pointer-events-none disabled:opacity-50";

const ghostButton = cn(
  pillButton,
  "h-11 px-5 bg-transparent text-white shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.1)] hover:bg-[#272333]"
);

const primaryButton = cn(
  pillButton,
  "h-12 w-full bg-rausch text-white shadow-[inset_0_1px_1px_#ffffff33,0_1px_2px_#08080833,0_4px_4px_#08080814,inset_0_6px_12px_#ffffff1f]",
  "hover:shadow-[inset_0_1px_1px_#ffffff33,0_1px_2px_#08080833,0_4px_4px_#08080814,inset_0_6px_12px_#ffffff1f,0_7px_80px_-12px_#da2128]"
);

const fieldClass =
  "flex h-11 w-full rounded-[6px] bg-navy-elevated px-3 py-2 text-[16px] text-white-soft shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.08)] transition-shadow placeholder:text-muted-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-rausch disabled:cursor-not-allowed disabled:opacity-50";

interface LoginScreenProps {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword: () => void;

  onGoogleClick: () => void;
  googleLoading: boolean;
  googleError: string;

  magicLinkEmail: string;
  onMagicLinkEmailChange: (value: string) => void;
  onMagicLinkSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  magicLinkLoading: boolean;
  magicLinkError: string;
  magicLinkSent: boolean;
  onMagicLinkReset: () => void;
}

export function LoginScreen({
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
  onGoogleClick,
  googleLoading,
  googleError,
  magicLinkEmail,
  onMagicLinkEmailChange,
  onMagicLinkSubmit,
  magicLinkLoading,
  magicLinkError,
  magicLinkSent,
  onMagicLinkReset,
}: LoginScreenProps) {
  const [mode, setMode] = React.useState<"password" | "magic-link">("password");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1b1728] p-4">
      <div className="grid h-[680px] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[24px] bg-[#272333] shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.1),inset_0_1px_0_0_hsla(0,0%,100%,0.1)] lg:grid-cols-2">
        {/* Slider */}
        <div className="hidden lg:block">
          <ImageSlider images={SLIDER_IMAGES} interval={10000} />
        </div>

        {/* Formulário */}
        <div className="flex flex-col justify-center overflow-y-auto p-8 md:p-12">
          <div className="mx-auto w-full max-w-sm">
            <Image
              src="/login/logo.svg"
              alt="Clientes Totum"
              width={140}
              height={35}
              priority
              className="animate-element animate-delay-100 mb-10 h-8 w-auto"
            />

            <h1 className="animate-element animate-delay-200 mb-2 text-[38px] font-light leading-[1.2] tracking-[-0.02em] text-white">
              Bem-vindo de volta
            </h1>
            <p className="animate-element animate-delay-300 mb-8 text-[20px] font-light leading-[1.25] text-white-soft">
              Seus projetos e entregas da Totum, acompanhados em tempo real.
            </p>

            {magicLinkSent ? (
              <div className="animate-element animate-delay-400 space-y-6">
                <div className="flex items-start gap-2 rounded-[6px] bg-navy-elevated p-4 text-sm text-white-soft shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.08)]">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  <span>
                    Enviamos um link para <span className="text-white">{magicLinkEmail}</span>. Ele expira em
                    15 minutos.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onMagicLinkReset();
                    setMode("password");
                  }}
                  className="text-[14px] text-rausch hover:underline"
                >
                  Voltar para senha
                </button>
              </div>
            ) : (
              <>
                {error && mode === "password" ? (
                  <div className="animate-element mb-6 flex items-start gap-2 rounded-[6px] bg-danger-bg p-4 text-sm text-danger-text shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.08)]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                ) : null}

                {googleError ? (
                  <div className="animate-element mb-6 flex items-start gap-2 rounded-[6px] bg-danger-bg p-4 text-sm text-danger-text shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.08)]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{googleError}</span>
                  </div>
                ) : null}

                <div className="animate-element animate-delay-400 mb-6 grid grid-cols-2 gap-3">
                  <button type="button" className={ghostButton} onClick={onGoogleClick} disabled={googleLoading}>
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <GoogleIcon className="h-4 w-4" />
                    )}
                    Google
                  </button>
                  <button
                    type="button"
                    className={ghostButton}
                    onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Magic Link
                  </button>
                </div>

                <div className="animate-element animate-delay-500 relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="h-px w-full bg-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#272333] px-3 text-[12px] text-muted-soft">
                      {mode === "password" ? "ou continue com e-mail" : "vamos enviar um link de acesso"}
                    </span>
                  </div>
                </div>

                {mode === "password" ? (
                  <form className="space-y-5" onSubmit={onSubmit}>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[14px] text-muted-soft">
                        E-mail
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="voce@empresa.com"
                        className={fieldClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-[14px] text-muted-soft">
                          Senha
                        </label>
                        <button
                          type="button"
                          onClick={onResetPassword}
                          className="text-[14px] text-rausch hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      </div>
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
                          className={cn(fieldClass, "pr-11")}
                        />
                        <button
                          type="button"
                          onClick={onTogglePassword}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-soft transition-colors hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={cn(primaryButton, "group")}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <>
                          Entrar
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form className="space-y-5" onSubmit={onMagicLinkSubmit}>
                    {magicLinkError ? (
                      <div className="flex items-start gap-2 rounded-[6px] bg-danger-bg p-4 text-sm text-danger-text shadow-[inset_0_0_0_1px_hsla(0,0%,100%,0.08)]">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{magicLinkError}</span>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <label htmlFor="magic-link-email" className="text-[14px] text-muted-soft">
                        E-mail
                      </label>
                      <input
                        id="magic-link-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={magicLinkEmail}
                        onChange={(e) => onMagicLinkEmailChange(e.target.value)}
                        placeholder="voce@empresa.com"
                        className={fieldClass}
                      />
                    </div>

                    <button type="submit" disabled={magicLinkLoading} className={cn(primaryButton, "group")}>
                      {magicLinkLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <>
                          Enviar link de acesso
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("password")}
                      className="w-full text-center text-[14px] text-muted-soft hover:text-white"
                    >
                      Voltar para senha
                    </button>
                  </form>
                )}
              </>
            )}

            <p className="animate-element animate-delay-800 mt-8 text-center text-[14px] text-muted-soft">
              Ainda não tem conta?{" "}
              <Link href="/auth/register" className="text-rausch hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
