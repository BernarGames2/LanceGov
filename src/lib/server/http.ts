/** Falha ao consultar uma fonte externa. `status` é o HTTP da fonte (0 = rede/tempo). */
export class SourceError extends Error {
  constructor(
    readonly source: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "SourceError";
  }
}

/** Formato de robô conhecido: alguns firewalls barram agentes sem cara de navegador. */
const USER_AGENT = "Mozilla/5.0 (compatible; LanceGov/1.0; +https://lancegov.com.br)";

/**
 * GET de JSON com tempo limite. 204 (sem conteúdo) devolve null, como o PNCP
 * faz quando a busca não tem resultado. `signal` cancela antes do tempo.
 */
export async function getJson<T>(
  source: string,
  url: string,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T | null> {
  let response: Response;
  try {
    const timeout = AbortSignal.timeout(timeoutMs);
    response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: signal ? AbortSignal.any([timeout, signal]) : timeout,
      cache: "no-store",
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    const reason = name === "TimeoutError" ? "tempo esgotado" : name === "AbortError" ? "cancelada" : "falha de rede";
    const detail = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
    throw new SourceError(source, 0, `${source}: ${reason}${detail}`);
  }

  if (response.status === 204) return null;
  if (!response.ok) {
    const body = (await response.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 160);
    throw new SourceError(source, response.status, `${source} respondeu ${response.status}${body ? `: ${body}` : ""}`);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new SourceError(source, response.status, `${source} devolveu algo que não é JSON`);
  }
}

type Entry<T> = { value: Promise<T>; expires: number };

/**
 * Cache em memória por instância do servidor. Guarda só resultados que deram
 * certo, para uma falha passageira não ficar presa no cache.
 */
export function memo<T>(ttlMs: number, maxEntries = 500, keep: (value: T) => boolean = () => true) {
  const store = new Map<string, Entry<T>>();
  return (key: string, load: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    const hit = store.get(key);
    if (hit && hit.expires > now) return hit.value;

    const value = load();
    const entry = { value, expires: now + ttlMs };
    store.set(key, entry);
    const forget = () => {
      if (store.get(key) === entry) store.delete(key);
    };
    // Falhas e resultados parciais não ficam guardados.
    value.then((result) => keep(result) || forget(), forget);
    if (store.size > maxEntries) {
      const oldest = store.keys().next().value;
      if (oldest !== undefined) store.delete(oldest);
    }
    return value;
  };
}
