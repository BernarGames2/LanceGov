"use client";

import Link from "next/link";

import { track, type AnalyticsEvent } from "@/lib/analytics";
import { RAIO_X_ANCHOR } from "@/lib/site";

export const RAIO_X_INPUT_ID = "cnpj-raio-x";

/**
 * Leva o visitante ao campo de CNPJ do topo da home. Na própria home rola
 * até o campo e dá foco; nas outras páginas navega para /#raio-x.
 */
export function focusRaioXInput() {
  const input = document.getElementById(RAIO_X_INPUT_ID);
  if (!(input instanceof HTMLInputElement) || !input.offsetParent) return false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  input.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  input.focus({ preventScroll: true });
  return true;
}

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & {
  event?: AnalyticsEvent;
  eventProps?: Record<string, string>;
};

export function RaioXLink({ event = "cta_click", eventProps, onClick, ...props }: Props) {
  return (
    <Link
      href={`/#${RAIO_X_ANCHOR}`}
      onClick={(e) => {
        track(event, eventProps);
        onClick?.(e);
        if (focusRaioXInput()) e.preventDefault();
      }}
      {...props}
    />
  );
}
