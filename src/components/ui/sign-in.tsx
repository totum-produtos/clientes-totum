"use client";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSPASassClient } from '@/lib/supabase/client';
import SSOButtons from '@/components/SSOButtons';

const AnimatedSignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setFormVisible(true), 300);
  }, []);

  useEffect(() => {
    if (showMFAPrompt) {
      router.push('/auth/2fa');
    }
  }, [showMFAPrompt, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const client = await createSPASassClient();
      const { error: signInError } = await client.loginEmail(email, password);

      if (signInError) throw signInError;

      const supabase = client.getSupabaseClient();
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (mfaError) throw mfaError;

      if (mfaData.nextLevel === 'aal2' && mfaData.nextLevel !== mfaData.currentLevel) {
        setShowMFAPrompt(true);
      } else {
        router.push('/app');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#fafafa]">
      <div className="flex min-h-screen items-center justify-center p-4 md:p-0">
        <div
          className={`w-full max-w-6xl overflow-hidden rounded-lg bg-canvas shadow-xl shadow-gray-200 transition-all duration-500 ${
            formVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left side - Images and stats */}
            <div
              className="hidden md:block w-full md:w-3/5 bg-surface-soft p-6"
              style={{
                opacity: formVisible ? 1 : 0,
                transition: 'opacity 0.8s ease-out',
              }}
            >
              <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full min-h-[560px]">
                <div className="overflow-hidden rounded-md relative h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80"
                    alt="Equipe Totum"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div
                  className="rounded-md flex flex-col justify-center items-center p-6 text-white bg-rausch"
                  style={{
                    transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
                    opacity: formVisible ? 1 : 0,
                    transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                    transitionDelay: '0.2s',
                  }}
                >
                  <h2 className="text-5xl font-bold mb-2">36</h2>
                  <p className="text-center text-sm">posts publicados este mês</p>
                </div>
                <div className="overflow-hidden rounded-md relative h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
                    alt="Marketing digital"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="overflow-hidden rounded-md relative h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80"
                    alt="Estratégia"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div
                  className="rounded-md flex flex-col justify-center items-center p-6 text-white bg-ink"
                  style={{
                    transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
                    opacity: formVisible ? 1 : 0,
                    transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                    transitionDelay: '0.4s',
                  }}
                >
                  <h2 className="text-5xl font-bold mb-2">4.2x</h2>
                  <p className="text-center text-sm">ROAS médio das campanhas</p>
                </div>
                <div className="overflow-hidden rounded-md relative h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80"
                    alt="Campanha"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Right side - Sign in form */}
            <div
              className="w-full md:w-2/5 p-8 md:p-12 bg-canvas text-ink flex flex-col justify-center"
              style={{
                transform: formVisible ? 'translateX(0)' : 'translateX(20px)',
                opacity: formVisible ? 1 : 0,
                transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
              }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1 text-ink">
                  Bem-vindo à <span className="text-rausch">Totum</span>
                </h1>
                <p className="text-sm text-body">
                  Acesse sua Central do Cliente e acompanhe todo o conteúdo da sua marca.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-danger-bg text-danger-text rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-ink">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-hairline py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rausch focus:border-transparent sm:text-sm bg-canvas text-ink placeholder:text-muted-soft"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-ink">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border border-hairline py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-rausch focus:border-transparent sm:text-sm bg-canvas text-ink placeholder:text-muted-soft"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-rausch hover:text-[rausch-active]">
                      Esqueceu a senha?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md py-3 px-4 text-sm font-semibold text-white shadow-airbnb transition-all duration-300 bg-rausch hover:bg-rausch-active disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>

              <SSOButtons onError={setError} />

              <div className="mt-6 text-center text-sm">
                <span className="text-body">Não tem uma conta?</span>{' '}
                <Link href="/auth/register" className="font-medium text-rausch hover:text-[rausch-active]">
                  Cadastre-se
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AnimatedSignIn };
