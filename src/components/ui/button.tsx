import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-marca-texto-forte",
        dark: "bg-tinta text-papel hover:bg-tinta/90",
        outline: "border border-tinta/15 bg-folha text-tinta hover:border-tinta/30 hover:bg-muted",
        ghost: "text-tinta hover:bg-tinta/5",
        link: "rounded-sm px-0 text-tinta underline decoration-tinta/30 underline-offset-4 hover:decoration-tinta",
      },
      size: {
        default: "h-12 px-6 text-base",
        sm: "h-10 px-4 text-[15px]",
        lg: "h-14 px-7 text-base sm:text-[17px]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
