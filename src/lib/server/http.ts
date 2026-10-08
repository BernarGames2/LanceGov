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

const USER_AGENT = "LanceGov/1.0 (+https://lancegov.com.br)";

/**
 * GET de JSON com tempo limite. 204 (sem conteúdo) devolve null, como o PNCP
 * faz quando a busca não tem resultado.
 */
export async function getJson<T>(source: string, url: string, timeoutMs: number): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError" ? "tempo esgotado" : "falha de rede";
    throw new SourceError(source, 0, `${source}: ${reason}`);
  }

  if (response.status === 204) return null;
  if (!response.ok) {
    throw new SourceError(source, response.status, `${source} respondeu ${response.status}`);
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
export function memo<T>(ttlMs: number, maxEntries = 500) {
  const store = new Map<string, Entry<T>>();
  return (key: string, load: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    const hit = store.get(key);
    if (hit && hit.expires > now) return hit.value;

    const value = load();
    store.set(key, { value, expires: now + ttlMs });
    value.catch(() => store.delete(key));
    if (store.size > maxEntries) {
      const oldest = store.keys().next().value;
      if (oldest !== undefined) store.delete(oldest);
    }
    return value;
  };
}
