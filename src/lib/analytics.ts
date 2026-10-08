import { hasAnalyticsConsent } from "./consent";

export type AnalyticsEvent =
  | "cta_click"
  | "cnpj_submit"
  | "cnpj_invalid"
  | "raiox_view"
  | "plan_select"
  | "whatsapp_click"
  | "faq_open";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Registra um evento de produto. Nada sai do navegador sem consentimento de
 * análise. Para ligar PostHog, GA4 ou outro, troque o corpo de `send`.
 * Não envie o CNPJ digitado: para MEI ele identifica uma pessoa.
 */
export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;

  const allowed = hasAnalyticsConsent();
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, props, allowed ? "" : "(sem consentimento: não enviado)");
  }
  if (!allowed) return;

  send(event, props);
}

function send(event: AnalyticsEvent, props: Props) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...props });
}
