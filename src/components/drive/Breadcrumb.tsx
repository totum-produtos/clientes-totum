"use client";

import React from "react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted flex-wrap">
      <button
        onClick={() => onNavigate("root")}
        className="flex items-center gap-1 hover:text-rausch transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Meu Drive</span>
      </button>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-3.5 w-3.5 text-muted-soft" />
          <button
            onClick={() => onNavigate(item.id)}
            className={`hover:text-rausch transition-colors ${
              index === items.length - 1 ? "text-ink font-medium" : ""
            }`}
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
