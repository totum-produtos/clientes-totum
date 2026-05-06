"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  children?: React.ReactNode;
}

const statusMap: Record<string, { label: string; className: string }> = {
  concluido: { label: "Concluído", className: "bg-success-bg text-success-text" },
  concluído: { label: "Concluído", className: "bg-success-bg text-success-text" },
  pendente: { label: "Pendente", className: "bg-warning-bg text-warning-text" },
  aprovado: { label: "Aprovado", className: "bg-success-bg text-success-text" },
  rejeitado: { label: "Rejeitado", className: "bg-danger-bg text-danger-text" },
  ativo: { label: "Ativo", className: "bg-success-bg text-success-text" },
  inactive: { label: "Inativo", className: "bg-danger-bg text-danger-text" },
  inativo: { label: "Inativo", className: "bg-danger-bg text-danger-text" },
  paid: { label: "Pago", className: "bg-success-bg text-success-text" },
  unpaid: { label: "Pendente", className: "bg-warning-bg text-warning-text" },
  organic: { label: "Orgânico", className: "bg-success-bg text-success-text" },
  paid_post: { label: "Pago", className: "bg-warning-bg text-warning-text" },
};

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = statusMap[status.toLowerCase()] || {
    label: status,
    className: "bg-surface-soft text-muted",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {children || config.label}
    </span>
  );
}
