"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { Key, Mail, Save } from 'lucide-react';

export default function ConfiguracoesPage() {
    const { user } = useGlobal();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const client = await createSPASassClient();
            const supabase = client.getSupabaseClient();
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            setMessage(err.message || 'Erro ao atualizar senha');
        }
    };

    return (
        <div className="space-y-6 p-2">
            <div>
                <h1 className="text-2xl font-bold text-ink">Configurações</h1>
                <p className="text-muted">Gerencie sua conta</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary-600" />
                        Informações da conta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted">Email</span>
                        <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary-600" />
                        Alterar senha
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1">Nova senha</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Atualizar senha
                        </button>
                        {message && (
                            <p className={`text-sm ${message.includes('sucesso') ? 'text-success-text' : 'text-danger-text'}`}>{message}</p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
