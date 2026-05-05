"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { Folder, ExternalLink, Link2, Unlink, Cloud } from 'lucide-react';

export default function DrivePage() {
  const { client } = useGlobal();
  const [driveUrl, setDriveUrl] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDriveConfig() {
      if (!client) return;
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
      alert('URL inválida. Cole um link de pasta do Google Drive (ex: https://drive.google.com/drive/folders/...)');
      return;
    }
    setSaving(true);
    const supabase = await createSPASassClient();
    const { error } = await supabase.getSupabaseClient()
      .from('portal_clients')
      .update({ drive_folder_cliente_id: id })
      .eq('id', client.id);

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      setFolderId(id);
      alert('Pasta do Google Drive vinculada com sucesso!');
    }
    setSaving(false);
  }

  async function disconnectDrive() {
    if (!client || !confirm('Remover vínculo com Google Drive?')) return;
    const supabase = await createSPASassClient();
    await supabase.getSupabaseClient()
      .from('portal_clients')
      .update({ drive_folder_cliente_id: null })
      .eq('id', client.id);
    setFolderId(null);
    setDriveUrl('');
  }

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Drive</h1>
        <p className="text-gray-500">Acesse as pastas e arquivos compartilhados da Totum</p>
      </div>

      {!folderId ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-[#d81220]" />
              Vincular pasta do Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Cole abaixo o link da pasta do Google Drive que a Totum compartilhou com você.
              Você pode encontrar este link no email de onboarding ou solicitar ao seu gestor.
            </p>
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/1aBcD..."
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d81220]"
            />
            <button
              onClick={saveDriveFolder}
              disabled={saving || !driveUrl}
              className="w-full py-3 px-4 bg-[#d81220] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] disabled:opacity-50 transition-colors"
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
                  <Folder className="h-5 w-5 text-yellow-500" />
                  Pasta vinculada
                </span>
                <button
                  onClick={disconnectDrive}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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

      <p className="text-xs text-gray-400">
        Dica: se a pré-visualização não carregar, clique em "Abrir no Google Drive" para acessar diretamente.
      </p>
    </div>
  );
}
