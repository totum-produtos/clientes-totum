'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import {useState} from "react";
import {createSPASassClient} from "@/lib/supabase/client";

export default function VerifyEmailPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const resendVerificationEmail = async () => {
        if (!email) {
            setError('Por favor, informe seu email');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const supabase = await createSPASassClient();
            const {error} = await supabase.resendVerificationEmail(email);
            if(error) {
                setError(error.message);
                return;
            }
            setSuccess(true);
        } catch (err: Error | unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido');
            }
        } finally {
            setLoading(false);
        }
    }

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
                    Enviamos um email com um link de verificação.
                    Acesse sua caixa de entrada e clique no link para confirmar sua conta.
                </p>

                <div className="space-y-4">
                    <p className="text-sm text-muted">
                        Não recebeu o email? Verifique a pasta de spam ou informe seu email para reenviar:
                    </p>

                    {error && (
                        <div className="text-sm text-danger-text bg-danger-bg rounded-md p-3">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-sm text-success-text bg-success-bg rounded-md p-3">
                            Email de verificação reenviado com sucesso.
                        </div>
                    )}

                    <div className="mt-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu email"
                            className="block w-full appearance-none rounded-md border border-hairline px-3 py-2 shadow-airbnb focus:border-rausch focus:outline-none focus:ring-rausch text-sm"
                        />
                    </div>

                    <button
                        className="text-rausch hover:text-rausch text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={resendVerificationEmail}
                        disabled={loading}
                    >
                        {loading ? 'Enviando…' : 'Clique aqui para reenviar'}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-hairline">
                    <Link
                        href="/auth/login"
                        className="text-sm font-medium text-rausch hover:text-rausch"
                    >
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    );
}