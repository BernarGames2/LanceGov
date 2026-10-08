/**
 * Consentimento de cookies (LGPD). Cookies essenciais estão sempre ativos;
 * análise só depois de o visitante aceitar.
 */

export type Consent = {
  analytics: boolean;
  decidedAt: string;
};

const STORAGE_KEY = "lancegov:consentimento:v1";
export const OPEN_PREFERENCES_EVENT = "lancegov:abrir-preferencias-cookies";

const listeners = new Set<() => void>();
let current: Consent | null | undefined;

/** null = visitante ainda não decidiu. */
export function getConsent(): Consent | null {
  if (current !== undefined) return current;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    current = raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    current = null;
  }
  return current;
}

export function saveConsent(analytics: boolean) {
  current = { analytics, decidedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Sem storage (modo privado): vale só para esta visita.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hasAnalyticsConsent() {
  return getConsent()?.analytics === true;
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
