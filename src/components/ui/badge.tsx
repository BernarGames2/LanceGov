import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-linha bg-folha text-tinta",
        destaque: "border-transparent bg-marca-texto text-tinta",
        vitoria: "border-vitoria/30 bg-vitoria/10 text-vitoria-escuro",
        prazo: "border-prazo/40 bg-prazo/15 text-tinta",
        risco: "border-risco/30 bg-risco/10 text-risco-escuro",
        escuro: "border-papel/15 bg-papel/10 text-papel",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
