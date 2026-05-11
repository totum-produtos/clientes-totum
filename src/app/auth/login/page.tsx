'use client';

import { createSPASassClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SSOButtons from '@/components/SSOButtons';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMFAPrompt, setShowMFAPrompt] = useState(false);
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
        <div>
            <div className="text-center mb-8">
                <Image
                    src="/logo.png"
                    alt="Totum"
                    width={140}
                    height={64}
                    className="h-12 w-auto mx-auto mb-6"
                    priority
                />
                <h1 className="text-2xl font-bold text-ink tracking-tight">
                    Portal do Cliente
                </h1>
                <p className="text-sm text-muted mt-2">
                    Acesse sua central de conteúdo
                </p>
            </div>

            <div className="bg-canvas border border-hairline rounded-lg p-8 shadow-airbnb">
                {error && (
                    <div className="mb-6 p-4 text-sm text-danger-text bg-danger-bg border border-danger-bg rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-ink">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full bg-canvas border border-hairline rounded-md px-4 py-3 text-sm text-ink placeholder-muted focus:outline-none focus:border-rausch focus:ring-2 focus:ring-rausch/20 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-ink">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-canvas border border-hairline rounded-md px-4 py-3 pr-11 text-sm text-ink placeholder-muted focus:outline-none focus:border-rausch focus:ring-2 focus:ring-rausch/20 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors"
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-rausch hover:text-rausch-active transition-colors"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-rausch hover:bg-rausch-active text-white font-medium py-3 px-4 rounded-md shadow-airbnb focus:outline-none focus:ring-2 focus:ring-rausch focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-hairline" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-canvas text-muted">ou continue com</span>
                    </div>
                </div>

                <SSOButtons onError={setError} compact />

                <div className="mt-6 text-center">
                    <span className="text-sm text-muted">Não tem uma conta?</span>
                    {' '}
                    <Link
                        href="/auth/register"
                        className="text-sm font-medium text-rausch hover:text-rausch-active transition-colors"
                    >
                        Criar conta
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-muted">
                    © {new Date().getFullYear()} Grupo Totum. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
