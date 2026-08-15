"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Extraído do padrão de abas manuais em src/app/app/campanhas/page.tsx,
// acrescentando role/aria que faltavam ali. Sem Radix: o repositório só tem
// dialog/alert-dialog/slot instalados e o comportamento aqui é simples o
// suficiente para não justificar dependência nova.

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Componentes de Tabs precisam estar dentro de <Tabs>.");
  return ctx;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div role="tablist" className={cn("flex gap-2 border-b border-hairline", className)}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { value: active, setValue } = useTabsContext();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-selected={selected}
      aria-controls={`tabpanel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
        selected
          ? "border-rausch text-rausch"
          : "border-transparent text-muted hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={className}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
