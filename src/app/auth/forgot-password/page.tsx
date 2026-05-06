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
                setError('An unknown error occurred');
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
                        Check your email
                    </h2>

                    <p className="text-body mb-8">
                        We have sent a password reset link to your email address.
                        Please check your inbox and follow the instructions to reset your password.
                    </p>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/auth/login" className="font-medium text-rausch hover:text-rausch">
                            Return to login
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
                    Reset your password
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
                        Email address
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
                        Enter your email address and we will send you a link to reset your password.
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-rausch py-2 px-4 text-sm font-medium text-white shadow-airbnb hover:bg-rausch-active focus:outline-none focus:ring-2 focus:ring-rausch focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Sending reset link...' : 'Send reset link'}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-body">Remember your password?</span>
                {' '}
                <Link href="/auth/login" className="font-medium text-rausch hover:text-rausch">
                    Sign in
                </Link>
            </div>
        </div>
    );
}