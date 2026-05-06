'use client';

import { createSPASassClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from '@/components/SSOButtons';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMFAPrompt, setShowMFAPrompt] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

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
                return;
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro inesperado');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showMFAPrompt) {
            router.push('/auth/2fa');
        }
    }, [showMFAPrompt, router]);

    return (
        <div className="animate-fade-in-up">
            {/* Logo */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-[rausch] to-[rausch-active] mb-6 shadow-airbnb shadow-[rausch]/20">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Portal do Cliente
                </h1>
                <p className="text-sm text-muted-soft mt-2">
                    Acesse sua central de conteúdo
                </p>
            </div>

            {/* Card */}
            <div className="bg-canvas/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-lg p-8 shadow-2xl">
                {error && (
                    <div className="mb-6 p-4 text-sm text-red-300 bg-danger-bg0/10 border border-red-500/20 rounded-md animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-muted-soft">
                            Email
                        </label>
                        <div className="relative">
                            <Mail 
                                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                                    focusedField === 'email' ? 'text-[rausch]' : 'text-muted'
                                }`}
                            />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="seu@email.com"
                                className="w-full bg-canvas/[0.05] border border-white/[0.1] rounded-md pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 
                                    focus:outline-none focus:border-[rausch]/50 focus:ring-2 focus:ring-[rausch]/20 
                                    transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-muted-soft">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock 
                                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                                    focusedField === 'password' ? 'text-[rausch]' : 'text-muted'
                                }`}
                            />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="••••••••"
                                className="w-full bg-canvas/[0.05] border border-white/[0.1] rounded-md pl-11 pr-11 py-3 text-sm text-white placeholder-gray-500 
                                    focus:outline-none focus:border-[rausch]/50 focus:ring-2 focus:ring-[rausch]/20 
                                    transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-muted-soft transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Forgot password */}
                    <div className="flex items-center justify-end">
                        <Link 
                            href="/auth/forgot-password" 
                            className="text-sm text-muted-soft hover:text-[rausch] transition-colors"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[rausch] to-[rausch-active] hover:from-[#c0111d] hover:to-[#a01919] 
                            text-white font-medium py-3 px-4 rounded-md shadow-airbnb shadow-[rausch]/25 
                            focus:outline-none focus:ring-2 focus:ring-[rausch]/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]
                            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Entrar
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.08]" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-[#0f0f0f] text-muted">ou continue com</span>
                    </div>
                </div>

                <SSOButtons onError={setError} compact />

                {/* Register link */}
                <div className="mt-6 text-center">
                    <span className="text-sm text-muted">Não tem uma conta?</span>
                    {' '}
                    <Link 
                        href="/auth/register" 
                        className="text-sm font-medium text-[rausch] hover:text-[#ff3344] transition-colors"
                    >
                        Criar conta
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-xs text-body">
                    © {new Date().getFullYear()} Grupo Totum. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
