import { cacheLife } from "next/cache";

export type SiteStats = {
  /** Soma das licitações abertas monitoradas hoje, em reais. */
  valorMonitoradoHoje: number | null;
  /** Editais lidos pela IA nos últimos 7 dias. */
  editaisLidosSemana: number | null;
};

const EMPTY: SiteStats = { valorMonitoradoHoje: null, editaisLidosSemana: null };

/**
 * Contadores da home (faixa de confiança e prova social).
 * Defina LANCEGOV_STATS_URL com um endpoint que devolva SiteStats em JSON.
 * Sem ele, ou se a chamada falhar, os contadores mostram "—".
 */
export async function getSiteStats(): Promise<SiteStats> {
  "use cache";
  cacheLife("minutes");

  const url = process.env.LANCEGOV_STATS_URL;
  if (!url) return EMPTY;

  try {
    const response = await fetch(url);
    if (!response.ok) return EMPTY;
    const data: Partial<SiteStats> = await response.json();
    return {
      valorMonitoradoHoje: toNumberOrNull(data.valorMonitoradoHoje),
      editaisLidosSemana: toNumberOrNull(data.editaisLidosSemana),
    };
  } catch {
    return EMPTY;
  }
}

function toNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
