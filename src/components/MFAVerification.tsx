// src/components/MFAVerification.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createSPASassClient } from '@/lib/supabase/client';
import { CheckCircle, Smartphone } from 'lucide-react';
import { Factor } from '@supabase/auth-js';

interface MFAVerificationProps {
    onVerified: () => void;
}

export function MFAVerification({ onVerified }: MFAVerificationProps) {
    const [verifyCode, setVerifyCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [factors, setFactors] = useState<Factor[]>([]);
    const [selectedFactorId, setSelectedFactorId] = useState<string>('');
    const [loadingFactors, setLoadingFactors] = useState(true);

    useEffect(() => {
        loadFactors();
    }, []);

    const loadFactors = async () => {
        try {
            const supabase = await createSPASassClient();
            const { data, error } = await supabase.getSupabaseClient().auth.mfa.listFactors();

            if (error) throw error;

            const totpFactors = data.totp || [];
            setFactors(totpFactors);

            // If there's only one factor, select it automatically
            if (totpFactors.length === 1) {
                setSelectedFactorId(totpFactors[0].id);
            }
        } catch (err) {
            console.error('Error loading MFA factors:', err);
            setError('Falha ao carregar dispositivos de autenticação');
        } finally {
            setLoadingFactors(false);
        }
    };

    const handleVerification = async () => {
        if (!selectedFactorId) {
            setError('Selecione um dispositivo de autenticação');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            // Create challenge
            const { data: challengeData, error: challengeError } = await client.auth.mfa.challenge({
                factorId: selectedFactorId
            });

            if (challengeError) throw challengeError;

            // Verify the challenge
            const { error: verifyError } = await client.auth.mfa.verify({
                factorId: selectedFactorId,
                challengeId: challengeData.id,
                code: verifyCode
            });

            if (verifyError) throw verifyError;

            onVerified();
        } catch (err) {
            console.error('MFA verification error:', err);
            setError(err instanceof Error ? err.message : 'Falha ao verificar o código MFA');
        } finally {
            setLoading(false);
        }
    };

    if (loadingFactors) {
        return (
            <Card className="w-full">
                <CardContent className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rausch"></div>
                </CardContent>
            </Card>
        );
    }

    if (factors.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="py-8">
                    <Alert variant="destructive">
                        <AlertDescription>
                            Nenhum dispositivo de autenticação encontrado. Entre em contato com o suporte.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Autenticação em duas etapas</CardTitle>
                <CardDescription>
                    Digite o código de verificação do seu aplicativo autenticador
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    {factors.length > 1 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-ink">
                                Selecione o dispositivo de autenticação
                            </label>
                            <div className="grid gap-3">
                                {factors.map((factor) => (
                                    <button
                                        key={factor.id}
                                        onClick={() => setSelectedFactorId(factor.id)}
                                        className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                                            selectedFactorId === factor.id
                                                ? 'border-rausch bg-rausch/5 text-rausch-active'
                                                : 'border-hairline hover:border-hairline-soft hover:bg-surface-soft'
                                        }`}
                                    >
                                        <Smartphone className="h-5 w-5" />
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">
                                                {factor.friendly_name || 'Dispositivo autenticador'}
                                            </p>
                                            <p className="text-sm text-muted">
                                                Adicionado em {new Date(factor.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        {selectedFactorId === factor.id && (
                                            <CheckCircle className="h-5 w-5 text-rausch" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-ink">
                            Código de verificação
                        </label>
                        <input
                            type="text"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value.trim())}
                            className="block w-full rounded-md border border-hairline px-3 py-2 shadow-airbnb focus:border-rausch focus:outline-none focus:ring-rausch sm:text-sm"
                            placeholder="Digite o código de 6 dígitos"
                            maxLength={6}
                        />
                        <p className="text-sm text-muted">
                            Digite o código de 6 dígitos do seu aplicativo autenticador
                        </p>
                    </div>

                    <button
                        onClick={handleVerification}
                        disabled={loading || verifyCode.length !== 6 || !selectedFactorId}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-airbnb text-sm font-medium text-white bg-rausch hover:bg-rausch-active focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rausch disabled:opacity-50"
                    >
                        {loading ? 'Verificando…' : 'Verificar'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}