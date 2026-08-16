import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Mesmo padrão de pill que já se repete em gestao-clientes/page.tsx e
// admin/planejamentos/page.tsx, extraído para componente único.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-badge font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-surface-soft text-muted",
        success: "bg-success-bg text-success-text",
        warning: "bg-warning-bg text-warning-text",
        danger: "bg-danger-bg text-danger-text",
        accent: "bg-rausch/10 text-rausch",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
