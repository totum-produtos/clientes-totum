"use client";

import React from "react";
import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  File,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  modifiedTime?: string | null;
  size?: string | null;
  iconLink?: string | null;
}

interface FileItemProps {
  file: DriveFile;
  onFolderClick?: (id: string, name: string) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType === "application/vnd.google-apps.folder") {
    return <Folder className="h-10 w-10 text-warning" />;
  }
  if (mimeType.startsWith("image/")) {
    return <Image className="h-10 w-10 text-rausch" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-10 w-10 text-purple-500" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-10 w-10 text-green-500" />;
  }
  if (
    mimeType === "application/pdf" ||
    mimeType === "application/vnd.google-apps.document" ||
    mimeType === "application/vnd.google-apps.spreadsheet" ||
    mimeType === "application/vnd.google-apps.presentation"
  ) {
    return <FileText className="h-10 w-10 text-blue-500" />;
  }
  return <File className="h-10 w-10 text-muted" />;
}

function formatSize(bytes?: string | null): string {
  if (!bytes) return "";
  const n = parseInt(bytes, 10);
  if (isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function FileItem({ file, onFolderClick }: FileItemProps) {
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";

  const handleClick = () => {
    if (isFolder && onFolderClick) {
      onFolderClick(file.id, file.name);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.webViewLink) {
      window.open(file.webViewLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-4 p-4 bg-canvas border border-hairline rounded-lg transition-all ${
        isFolder
          ? "hover:border-warning hover:shadow-sm cursor-pointer"
          : "hover:border-rausch hover:shadow-sm"
      }`}
    >
      {/* Thumbnail or Icon */}
      <div className="shrink-0">
        {file.thumbnailLink ? (
          <img
            src={file.thumbnailLink}
            alt={file.name}
            className="h-10 w-10 object-cover rounded"
          />
        ) : (
          getFileIcon(file.mimeType)
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{file.name}</p>
        <p className="text-xs text-muted mt-0.5">
          {formatSize(file.size)}
          {file.size && file.modifiedTime ? " · " : ""}
          {formatDate(file.modifiedTime)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!isFolder && file.webViewLink && (
          <button
            onClick={handleOpen}
            className="p-2 text-muted hover:text-rausch hover:bg-surface-soft rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Abrir no Google Drive"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
        {isFolder && (
          <ChevronRight className="h-4 w-4 text-muted-soft" />
        )}
      </div>
    </div>
  );
}
