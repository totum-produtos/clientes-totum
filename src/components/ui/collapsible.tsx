"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Não havia accordion no repositório. O SidebarGroup de AppLayout.tsx usa a
// mesma técnica de max-height + opacity para animar sem depender de Radix,
// reaproveitada aqui.
interface CollapsibleProps {
  title: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Collapsible({ title, defaultOpen = false, children, className }: CollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();

  return (
    <div className={cn("rounded-lg border border-hairline bg-navy-card", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-ink">{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <div
        id={id}
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}
