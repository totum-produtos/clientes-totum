"use client";

import React from "react";
import FileItem, { DriveFile } from "./FileItem";
import { FolderOpen } from "lucide-react";

interface FileListProps {
  files: DriveFile[];
  onFolderClick: (id: string, name: string) => void;
  loading?: boolean;
}

export default function FileList({ files, onFolderClick, loading }: FileListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-canvas border border-hairline rounded-lg animate-pulse"
          >
            <div className="h-10 w-10 bg-surface-strong rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-strong rounded w-1/3" />
              <div className="h-3 bg-surface-strong rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center mb-4">
          <FolderOpen className="h-8 w-8 text-muted" />
        </div>
        <p className="text-sm font-medium text-muted">Nenhum arquivo encontrado</p>
        <p className="text-xs text-muted-soft mt-1">
          Esta pasta está vazia ou não há resultados para a busca.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileItem key={file.id} file={file} onFolderClick={onFolderClick} />
      ))}
    </div>
  );
}
