// Spinner padrão do projeto. Substitui as ~15 variantes de
// `<div className="animate-spin..." />` espalhadas pelas páginas.
//
// Uso:
//   <LoadingSpinner />                    // 8x8 vermelho (rausch)
//   <LoadingSpinner size="sm" />          // 4x4 — dentro de botão
//   <LoadingSpinner inverted />           // borda branca — botão vermelho
//   <PageLoader />                        // ocupa toda a viewport, centralizado

import React from "react";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<SpinnerSize, string> = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-10 h-10 border-4",
};

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  inverted?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  inverted = false,
  className = "",
}: LoadingSpinnerProps) {
  const palette = inverted
    ? "border-white/30 border-t-white"
    : "border-rausch/30 border-t-rausch";
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={`rounded-full animate-spin ${SIZE_MAP[size]} ${palette} ${className}`}
    />
  );
}

export function PageLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`min-h-screen bg-surface-soft flex items-center justify-center ${className}`}>
      <LoadingSpinner size="md" />
    </div>
  );
}
