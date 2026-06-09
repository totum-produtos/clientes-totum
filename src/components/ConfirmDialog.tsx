"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = "Confirmar ação",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmStyles = {
    danger: "bg-danger text-white hover:bg-danger-text",
    warning: "bg-warning text-white hover:bg-warning-text",
    primary: "bg-rausch text-white hover:bg-rausch-active",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-scrim/50" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative bg-canvas rounded-md border border-hairline shadow-airbnb p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-warning-bg flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-title" className="text-title-sm font-cereal text-ink">
              {title}
            </h3>
            <p id="confirm-message" className="text-body-sm text-muted mt-1">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="btn-ghost">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`btn-primary ${confirmStyles[variant]}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
