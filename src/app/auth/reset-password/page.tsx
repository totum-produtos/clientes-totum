'use client';

import { useState, useEffect } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle, Key } from 'lucide-react';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // Check if we have a valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            try {
                const supabase = await createSPASassClient();
                const { data: { user }, error } = await supabase.getSupabaseClient().auth.getUser();

                if (error || !user) {
                    setError('Invalid or expired reset link. Please request a new password reset.');
                }
            } catch {
                setError('Failed to verify reset session');
            }
        };

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
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
                router.push('/app');
            }, 3000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to reset password');
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
                        Password reset successful
                    </h2>

                    <p className="text-body mb-8">
                        Your password has been successfully reset.
                        You will be redirected to the app in a moment.
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
                <h2 className="text-2xl font-bold text-center text-ink mb-8">
                    Create new password
                </h2>
            </div>

            {error && (
                <div className="mb-4 p-4 text-sm text-danger-text bg-danger-bg rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-ink">
                        New Password
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
                        Confirm New Password
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
                        Password must be at least 6 characters long
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-rausch py-2 px-4 text-sm font-medium text-white shadow-airbnb hover:bg-rausch-active focus:outline-none focus:ring-2 focus:ring-rausch focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Resetting password...' : 'Reset password'}
                    </button>
                </div>
            </form>
        </div>
    );
}