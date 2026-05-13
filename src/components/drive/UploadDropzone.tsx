"use client";

import React, { useCallback, useState } from "react";
import { Upload, Loader2, X, FileUp } from "lucide-react";

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export default function UploadDropzone({ onUpload, disabled }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || uploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      await uploadFile(files[0]);
    },
    [disabled, uploading, onUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await uploadFile(file);
      e.target.value = ""; // reset
    },
    [onUpload]
  );

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    setProgress(`Enviando ${file.name}...`);

    try {
      await onUpload(file);
      setProgress(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar arquivo";
      setError(msg);
      setProgress(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? "border-rausch bg-rausch/5"
            : "border-hairline bg-canvas hover:border-muted"
        } ${disabled || uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-rausch animate-spin" />
            <p className="text-sm text-muted">{progress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted" />
            </div>
            <p className="text-sm font-medium text-ink">
              Arraste um arquivo aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-soft">
              Máximo recomendado: 100 MB por arquivo
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-md text-sm text-danger-text">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
