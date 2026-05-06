"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASassClient } from '@/lib/supabase/client';
import { FileText, Download, Upload, Trash2, FileArchive, FileSpreadsheet, Image, File } from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-danger-text" />,
  ZIP: <FileArchive className="h-5 w-5 text-yellow-500" />,
  XLSX: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  DOCX: <FileText className="h-5 w-5 text-blue-500" />,
  PNG: <Image className="h-5 w-5 text-purple-500" />,
  JPG: <Image className="h-5 w-5 text-purple-500" />,
};

type Arquivo = {
  name: string;
  id: string;
  updated_at: string;
  metadata?: { mimetype?: string; size?: number };
};

export default function ArquivosPage() {
  const { client } = useGlobal();
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const bucket = 'client_files';

  async function fetchArquivos() {
    if (!client) return;
    setLoading(true);
    setError('');
    try {
      const supabase = await createSPASassClient();
      const { data, error } = await supabase.getSupabaseClient()
        .storage
        .from(bucket)
        .list(client.id, { sortBy: { column: 'updated_at', order: 'desc' } });

      if (error) {
        // Bucket pode não existir ainda
        if (error.message.includes('not found') || error.message.includes('Bucket')) {
          setError('Bucket de storage não configurado. Crie "client_files" no Supabase Dashboard > Storage.');
        } else {
          setError(error.message);
        }
        setArquivos([]);
      } else {
        setArquivos((data || []).filter((f: any) => f.name !== '.emptyFolderPlaceholder'));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArquivos();
  }, [client]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!client || !e.target.files?.length) return;
    setUploading(true);
    setError('');

    const supabase = await createSPASassClient();
    const file = e.target.files[0];
    const path = `${client.id}/${file.name}`;

    const { error } = await supabase.getSupabaseClient()
      .storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      setError('Erro no upload: ' + error.message);
    } else {
      await fetchArquivos();
    }
    setUploading(false);
    e.target.value = '';
  }, [client]);

  async function handleDownload(name: string) {
    if (!client) return;
    const supabase = await createSPASassClient();
    const { data, error } = await supabase.getSupabaseClient()
      .storage
      .from(bucket)
      .createSignedUrl(`${client.id}/${name}`, 60);

    if (error || !data?.signedUrl) {
      alert('Erro ao gerar link: ' + (error?.message || 'unknown'));
      return;
    }
    window.open(data.signedUrl, '_blank');
  }

  async function handleDelete(name: string) {
    if (!client || !confirm(`Remover "${name}"?`)) return;
    const supabase = await createSPASassClient();
    const { error } = await supabase.getSupabaseClient()
      .storage
      .from(bucket)
      .remove([`${client.id}/${name}`]);

    if (error) {
      alert('Erro ao remover: ' + error.message);
    } else {
      await fetchArquivos();
    }
  }

  function formatSize(bytes?: number) {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getExt(name: string) {
    const ext = name.split('.').pop()?.toUpperCase() || '';
    return typeIcons[ext] ? ext : 'FILE';
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Arquivos compartilhados</h1>
          <p className="text-muted">Documentos e materiais da sua conta</p>
        </div>
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[rausch] text-white rounded-lg text-sm font-medium hover:bg-[rausch-active] transition-colors disabled:opacity-50">
          <Upload className="h-4 w-4" />
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading || !client} />
        </label>
      </div>

      {error && (
        <div className="bg-warning-bg border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 text-sm rounded">
          ⚠️ {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Arquivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-b-2 border-primary-600 rounded-full"></div>
            </div>
          ) : arquivos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-soft mx-auto mb-2" />
              <p className="text-sm text-muted-soft">Nenhum arquivo enviado ainda.</p>
              <p className="text-xs text-muted-soft mt-1">Clique em "Enviar arquivo" para começar.</p>
            </div>
          ) : (
            arquivos.map((arquivo) => (
              <div key={arquivo.id || arquivo.name} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-surface-soft transition-colors">
                <div className="shrink-0">{typeIcons[getExt(arquivo.name)] || <File className="h-5 w-5 text-muted" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{arquivo.name}</p>
                  <p className="text-xs text-muted">
                    {formatSize(arquivo.metadata?.size)} • {new Date(arquivo.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(arquivo.name)}
                  className="p-2 hover:bg-surface-strong rounded-lg shrink-0"
                  title="Download"
                >
                  <Download className="h-4 w-4 text-muted" />
                </button>
                <button
                  onClick={() => handleDelete(arquivo.name)}
                  className="p-2 hover:bg-danger-bg rounded-lg shrink-0"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4 text-danger-text" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
