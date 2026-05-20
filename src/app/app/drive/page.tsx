"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { Folder, ExternalLink, Unlink, Cloud } from 'lucide-react';
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DrivePage() {
  const { client, loading: globalLoading, user } = useGlobal();
  const { showSuccess, showError } = useToast();
  const [driveUrl, setDriveUrl] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isMaster = user?.role === "master" || user?.role === "admin";

  useEffect(() => {
    async function loadDriveConfig() {
      if (!client) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = await createSPASassClient();
      const { data } = await supabase.getSupabaseClient()
        .from('portal_clients')
        .select('drive_folder_id, drive_folder_cliente_id')
        .eq('id', client.id)
        .single();

      if (data?.drive_folder_id) {
        setFolderId(data.drive_folder_id);
        setDriveUrl(`https://drive.google.com/drive/folders/${data.drive_folder_id}`);
      }
      setLoading(false);
    }
    loadDriveConfig();
  }, [client]);

  function extractFolderId(url: string): string | null {
    // Match patterns:
    // https://drive.google.com/drive/folders/FOLDER_ID
    // https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
    // https://drive.google.com/open?id=FOLDER_ID
    const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    const matchOpen = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchOpen) return matchOpen[1];
    return null;
  }

  async function saveDriveFolder() {
    if (!client || !driveUrl) return;
    const id = extractFolderId(driveUrl);
    if (!id) {
      showError('URL inválida. Cole um link de pasta do Google Drive (ex: https://drive.google.com/drive/folders/...)');
      return;
    }
    setSaving(true);
    const supabase = await createSPASassClient();
    const { error } = await supabase.getSupabaseClient()
      .from('portal_clients')
      .update({ drive_folder_cliente_id: id })
      .eq('id', client.id);

    if (error) {
      showError('Erro: ' + error.message);
    } else {
      setFolderId(id);
      showSuccess('Pasta do Google Drive vinculada com sucesso!');
    }
    setSaving(false);
  }

  async function disconnectDrive() {
    if (!client) return;
    setConfirmOpen(true);
  }

  const confirmDisconnect = async () => {
    if (!client) return;
    const supabase = await createSPASassClient();
    await supabase.getSupabaseClient()
      .from('portal_clients')
      .update({ drive_folder_cliente_id: null })
      .eq('id', client.id);
    setFolderId(null);
    setDriveUrl('');
    showSuccess('Vínculo com Google Drive removido');
    setConfirmOpen(false);
  };

  if (globalLoading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    if (isMaster) {
      return (
        <div className="space-y-6 p-2">
          <div>
            <h1 className="text-2xl font-bold text-ink">Google Drive (Matriz)</h1>
            <p className="text-muted">Acesso global ao drive da agência</p>
          </div>
          <Card>
            <CardHeader><CardTitle>Acesso Raiz</CardTitle></CardHeader>
            <CardContent>
              <a
                href="https://drive.google.com/drive/u/0/my-drive"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir Meu Drive (Totum)
              </a>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-canvas border p-8 rounded-xl shadow-airbnb max-w-md w-full">
          <Cloud className="w-12 h-12 text-rausch mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">Nenhum Cliente Selecionado</h2>
          <p className="text-muted text-sm mb-6">
            Você precisa selecionar um cliente para acessar a pasta do Google Drive.
          </p>
          <Link href="/app/central-conteudo" className="block w-full py-3 bg-rausch text-white font-medium rounded-md hover:bg-rausch-active text-center transition-colors">
            Ir para Central de Conteúdos
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-rausch rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-ink">Google Drive</h1>
        <p className="text-muted">Acesse as pastas e arquivos compartilhados da Totum</p>
      </div>

      {!folderId ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-rausch" />
              Vincular pasta do Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-body">
              Cole abaixo o link da pasta do Google Drive que a Totum compartilhou com você.
              Você pode encontrar este link no email de onboarding ou solicitar ao seu gestor.
            </p>
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/1aBcD..."
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full px-4 py-3 border rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-rausch"
            />
            <button
              onClick={saveDriveFolder}
              disabled={saving || !driveUrl}
              className="w-full py-3 px-4 bg-rausch text-white rounded-lg text-sm font-medium hover:bg-rausch-active disabled:opacity-50 transition-colors"
            >
              {saving ? 'Salvando...' : 'Vincular pasta'}
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-warning" />
                  Pasta vinculada
                </span>
                <button
                  onClick={disconnectDrive}
                  disabled={saving}
                  className="text-xs text-danger-text hover:text-danger-text flex items-center gap-1 disabled:opacity-50"
                >
                  <Unlink className="h-3 w-3" /> Remover vínculo
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`https://drive.google.com/drive/folders/${folderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rausch text-white rounded-lg text-sm font-medium hover:bg-rausch-active transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir no Google Drive
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pré-visualização</CardTitle></CardHeader>
            <CardContent>
              <iframe
                src={`https://drive.google.com/embeddedfolderview?id=${folderId}#list`}
                className="w-full h-96 border rounded-lg"
                sandbox="allow-scripts allow-same-origin"
              />
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-soft">
        Dica: se a pré-visualização não carregar, clique em &quot;Abrir no Google Drive&quot; para acessar diretamente.
      </p>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Remover vínculo"
        message="Remover vínculo com Google Drive?"
        onConfirm={confirmDisconnect}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
