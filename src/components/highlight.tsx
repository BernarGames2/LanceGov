"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Grifo marca-texto: o traço lima passa por trás da palavra (400 ms) quando
 * ela entra na tela. Use só sobre fundo claro; o texto continua em tinta.
 * A transição fica no CSS (.grifo), que já respeita prefers-reduced-motion.
 */
export function Highlight({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });

  return (
    <span ref={ref} data-grifado={inView ? "" : undefined} className={cn("grifo", className)}>
      {children}
    </span>
  );
}
