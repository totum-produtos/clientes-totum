"use client";

import React from "react";
import { Cloud, Unlink, Loader2 } from "lucide-react";

interface ConnectButtonProps {
  connected: boolean;
  loading?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ConnectButton({
  connected,
  loading,
  onConnect,
  onDisconnect,
}: ConnectButtonProps) {
  if (connected) {
    return (
      <button
        onClick={onDisconnect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger-text border border-danger rounded-md hover:bg-danger/5 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Unlink className="h-4 w-4" />
        )}
        Desconectar Google Drive
      </button>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-rausch text-white rounded-md text-sm font-medium hover:bg-rausch-active transition-colors disabled:opacity-50 shadow-airbnb"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Cloud className="h-4 w-4" />
      )}
      Conectar Google Drive
    </button>
  );
}
