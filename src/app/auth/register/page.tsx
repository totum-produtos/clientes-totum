'use client';

import {createSPASassClient} from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SSOButtons from "@/components/SSOButtons";

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!acceptedTerms) {
            setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.registerEmail(email, password);

            if (error) throw error;

            router.push('/auth/verify-email');
        } catch (err: Error | unknown) {
            if(err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-canvas py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-ink">
                        Senha
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-hairline px-3 py-2 shadow-airbnb focus:border-rausch focus:outline-none focus:ring-rausch"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
                        Confirme a senha
                    </label>
                    <div className="mt-1">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-hairline px-3 py-2 shadow-airbnb focus:border-rausch focus:outline-none focus:ring-rausch"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="h-4 w-4 rounded border-hairline text-rausch focus:ring-rausch"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-body">
                                Concordo com os{' '}
                                <Link
                                    href="/legal/terms"
                                    className="font-medium text-rausch hover:text-rausch"
                                    target="_blank"
                                >
                                    Termos de Uso
                                </Link>{' '}
                                e a{' '}
                                <Link
                                    href="/legal/privacy"
                                    className="font-medium text-rausch hover:text-rausch"
                                    target="_blank"
                                >
                                    Política de Privacidade
                                </Link>
                            </label>
                        </div>
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-rausch py-2 px-4 text-sm font-medium text-white shadow-airbnb hover:bg-rausch-active focus:outline-none focus:ring-2 focus:ring-rausch focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Criando conta…' : 'Criar conta'}
                    </button>
                </div>
            </form>

            <SSOButtons onError={setError}/>

            <div className="mt-6 text-center text-sm">
                <span className="text-body">Já tem uma conta?</span>
                {' '}
                <Link href="/auth/login" className="font-medium text-rausch hover:text-rausch">
                    Entrar
                </Link>
            </div>
        </div>
    );
}