'use client';

import { useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function MagicLinkPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const client = await createSPASassClient();
            const { error: otpError } = await client.loginMagicLink(
                email,
                `${window.location.origin}/api/auth/callback?next=/app`
            );

            if (otpError) throw otpError;

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-canvas py-8 px-4 shadow sm:rounded-lg sm:px-10 font-cereal">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-success" />
                    </div>

                    <h2 className="text-2xl font-bold text-ink tracking-[-0.06em] mb-2">
                        Verifique seu email
                    </h2>

                    <p className="text-body">
                        Enviamos um link de acesso para <span className="text-ink">{email}</span>.
                        Abra o email e clique no link para entrar — sem precisar de senha.
                    </p>

                    <div className="mt-8 text-center text-sm">
                        <Link href="/auth/login" className="font-medium text-totum-secondary hover:text-totum-secondary/80">
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-canvas py-8 px-4 shadow sm:rounded-lg sm:px-10 font-cereal">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <Mail className="h-10 w-10 text-totum-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-center text-ink tracking-[-0.06em] mb-2">
                    Entrar sem senha
                </h2>
                <p className="text-center text-sm text-muted mb-8">
                    Informe seu email e enviaremos um link mágico para acessar sua conta.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 text-sm text-danger-text bg-danger-bg rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink tracking-[-0.06em]">
                        Email
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-hairline bg-navy-elevated px-3 py-2 text-ink shadow-airbnb focus:border-totum-secondary focus:outline-none focus:ring-totum-secondary"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-totum-secondary py-2 px-4 text-sm font-medium tracking-[-0.06em] text-on-primary shadow-airbnb hover:bg-totum-secondary/90 focus:outline-none focus:ring-2 focus:ring-totum-secondary focus:ring-offset-2 focus:ring-offset-canvas disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Enviando...' : 'Enviar Magic Link'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted">Prefere usar senha?</span>
                {' '}
                <Link href="/auth/login" className="font-medium text-totum-secondary hover:text-totum-secondary/80">
                    Entrar com senha
                </Link>
            </div>
        </div>
    );
}
