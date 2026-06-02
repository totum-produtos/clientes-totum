// Estado vazio padrão. Substitui:
//  <p className="text-sm text-muted-soft">Nenhum X cadastrado.</p>
//  <h2>Nenhum X Vinculado</h2>...
//
// Uso:
//   <EmptyState title="Nenhum cliente ativo" />
//   <EmptyState icon={Building2} title="..." description="..." />
//   <EmptyState ... action={<Link href="/...">Criar primeiro</Link>} />
//   <EmptyState variant="card" ... />  // wrapped num card branco

import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "plain" | "card" | "full";
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = "plain",
  className = "",
}: EmptyStateProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-soft" />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );

  if (variant === "card") {
    return (
      <div className="bg-canvas rounded-lg border border-hairline shadow-airbnb p-10">
        {content}
      </div>
    );
  }
  if (variant === "full") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        {content}
      </div>
    );
  }
  return <div className="py-8">{content}</div>;
}
