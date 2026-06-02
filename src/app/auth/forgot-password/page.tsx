'use client';

import { useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.getSupabaseClient().auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido');
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
                        Verifique seu email
                    </h2>

                    <p className="text-body mb-8">
                        Enviamos um link de recuperação para seu email.
                        Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                    </p>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/auth/login" className="font-medium text-rausch hover:text-rausch">
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-canvas py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-2xl font-bold text-center text-ink mb-8">
                    Recuperar senha
                </h2>
            </div>

            {error && (
                <div className="mb-4 p-4 text-sm text-danger-text bg-danger-bg rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink">
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
                            className="block w-full appearance-none rounded-md border border-hairline px-3 py-2 shadow-airbnb focus:border-rausch focus:outline-none focus:ring-rausch"
                        />
                    </div>
                    <p className="mt-2 text-sm text-muted">
                        Informe seu email e enviaremos um link para redefinir sua senha.
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-rausch py-2 px-4 text-sm font-medium text-white shadow-airbnb hover:bg-rausch-active focus:outline-none focus:ring-2 focus:ring-rausch focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Enviando link…' : 'Enviar link de recuperação'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-body">Lembrou da senha?</span>
                {' '}
                <Link href="/auth/login" className="font-medium text-rausch hover:text-rausch">
                    Entrar
                </Link>
            </div>
        </div>
    );
}