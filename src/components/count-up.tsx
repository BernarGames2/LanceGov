"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

import { formatInteger } from "@/lib/format";

/**
 * Número que sobe até o valor quando entra na tela. O HTML do servidor já
 * traz o valor final; a animação só roda se o número começar fora da tela.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(value);
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = element.getBoundingClientRect();
    const visible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!reduceMotion && !visible) {
      // Fora da tela ninguém vê o zero; ele sobe quando o número aparecer.
      setDisplay(0);
      setArmed(true);
    }
  }, []);

  useEffect(() => {
    if (!inView || !armed) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => setArmed(false),
    });
    return () => controls.stop();
  }, [inView, armed, value]);

  return (
    <span ref={ref} className={className}>
      {formatInteger(display)}
    </span>
  );
}
