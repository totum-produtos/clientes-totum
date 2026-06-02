'use client';

import { Suspense, useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Key } from 'lucide-react';

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="bg-canvas py-8 px-4 shadow sm:rounded-lg sm:px-10" />}>
            <ResetPasswordPageInner />
        </Suspense>
    );
}

function ResetPasswordPageInner() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isInvite = searchParams.get('invite') === 'true';

    // Initialise session from invite link.
    // The Supabase admin-generated invite redirects with tokens in the URL fragment
    // (#access_token=...&refresh_token=...) when PKCE is not negotiated. The
    // @supabase/ssr browser client defaults to PKCE so it does NOT auto-parse
    // the fragment, so we parse it ourselves and call setSession.
    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            // Try to extract tokens from URL fragment
            if (typeof window !== 'undefined' && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (accessToken && refreshToken) {
                    const { error: setErr } = await client.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                    if (!mounted) return;
                    if (setErr) {
                        setError('Link de recuperação inválido ou expirado. Solicite um novo.');
                        return;
                    }
                    // Clear sensitive fragment from URL
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    return;
                }
            }

            // No fragment: maybe we already have a session (forgot-password flow)
            const { data: { session } } = await client.auth.getSession();
            if (!mounted) return;
            if (!session) {
                setError('Link de recuperação inválido ou expirado. Solicite um novo.');
            }
        };

        initSession();
        return () => { mounted = false; };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            setError('A senha precisa ter no mínimo 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.getSupabaseClient().auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push(isInvite ? '/app/meu-cadastro' : '/app');
            }, 3000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Falha ao redefinir a senha');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-canvas py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-success" />
                    </div>

                    <h2 className="text-2xl font-bold text-ink mb-2">
                        {isInvite ? 'Senha criada com sucesso' : 'Senha redefinida com sucesso'}
                    </h2>

                    <p className="text-body mb-8">
                        {isInvite
                            ? 'Estamos te direcionando para preencher os dados da sua empresa…'
                            : 'Sua senha foi redefinida. Você será redirecionado para o portal em instantes.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-canvas py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <Key className="h-12 w-12 text-rausch" />
                </div>
                <h2 className="text-2xl font-bold text-center text-ink mb-2">
                    {isInvite ? 'Bem-vindo! Crie sua senha' : 'Criar nova senha'}
                </h2>
                {isInvite && (
                    <p className="text-sm text-center text-body mb-6">
                        Defina uma senha para acessar o portal. Depois você preencherá os dados da sua empresa.
                    </p>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 text-sm text-danger-text bg-danger-bg rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-ink">
                        Nova senha
                    </label>
                    <div className="mt-1">
                        <input
                            id="new-password"
                            name="new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-hairline px-3 py-2 shadow-airbnb focus:border-rausch focus:outline-none focus:ring-rausch"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-ink">
                        Confirme a nova senha
                    </label>
                    <div className="mt-1">
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-hairline px-3 py-2 shadow-airbnb focus:border-rausch focus:outline-none focus:ring-rausch"
                        />
                    </div>
                    <p className="mt-2 text-sm text-muted">
                        A senha precisa ter no mínimo 6 caracteres
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-rausch py-2 px-4 text-sm font-medium text-white shadow-airbnb hover:bg-rausch-active focus:outline-none focus:ring-2 focus:ring-rausch focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Redefinindo…' : 'Redefinir senha'}
                    </button>
                </div>
            </form>
        </div>
    );
}