import { matchesTerm } from "../cnae-terms";
import type { Oportunidade } from "../raio-x";
import { getJson, memo, SourceError } from "./http";

/**
 * Licitações abertas no PNCP (Portal Nacional de Contratações Públicas).
 *
 * 1. Busca do portal (pncp.gov.br/api/search): aceita texto livre, então
 *    encontra direto os editais com os termos da empresa.
 * 2. Se a busca falhar, a API oficial de consulta
 *    (/api/consulta/v1/contratacoes/proposta), que não filtra por texto:
 *    baixa uma amostra das contratações abertas da UF e filtra aqui.
 *
 * Os dois formatos são lidos com tolerância (campos opcionais), porque o
 * PNCP muda e às vezes ignora filtros sem avisar. Todo resultado é conferido
 * contra o termo antes de ser mostrado.
 */

const BASE = "https://pncp.gov.br";
const SEARCH_TIMEOUT_MS = 8000;
const CONSULTA_TIMEOUT_MS = 8000;
const SEARCH_PAGE_SIZE = 50;

export type SearchResult = {
  items: Oportunidade[];
  /** Provavelmente existem mais resultados do que os trazidos. */
  haMais: boolean;
  /** A resposta veio incompleta (reserva por amostra ou páginas que falharam). */
  partial: boolean;
};

/** Resultados completos ficam guardados 10 minutos; parciais, não. */
const cachedSearch = memo<SearchResult>(10 * 60 * 1000, 500, (result) => !result.partial);
const cachedPool = memo<Pool>(10 * 60 * 1000, 60, (pool) => !pool.failedPages);

/**
 * O PNCP limita rajadas (429). Depois de um 429, não insiste no mesmo
 * servidor por um minuto: responde rápido que está ocupado.
 */
const BUSY_MS = 60_000;
let busyUntil = 0;

async function pncpJson<T>(source: string, url: string, timeoutMs: number) {
  if (Date.now() < busyUntil) throw new SourceError(source, 429, `${source}: ocupado (429 recente)`);
  try {
    return await getJson<T>(source, url, timeoutMs);
  } catch (error) {
    if (error instanceof SourceError && error.status === 429) busyUntil = Date.now() + BUSY_MS;
    throw error;
  }
}

/**
 * Licitações abertas que mencionam `term`, na UF (ou no Brasil todo sem UF).
 * `fallback: false` não usa a API de consulta se a busca falhar.
 */
export function searchOpen(term: string, uf?: string, { fallback = true } = {}): Promise<SearchResult> {
  return cachedSearch(`${term}|${uf ?? "BR"}|${fallback}`, async () => {
    try {
      return await searchPortal(term, uf);
    } catch (error) {
      // Sem reserva, ou com o PNCP limitando pedidos: a reserva bate no mesmo servidor.
      if (!fallback || !(error instanceof SourceError) || error.status === 429) throw error;
      console.warn(`[raio-x] busca do PNCP falhou (${error.message}); usando a API de consulta`);
      const pool = await openPool(uf);
      const items = pool.items.filter((item) => matchesTerm(item.objeto, term));
      return { items, haMais: pool.truncated, partial: true };
    }
  });
}

/* ------------------------------------------------------------------ */
/* Busca do portal                                                     */
/* ------------------------------------------------------------------ */

type SearchJson = {
  items?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  total?: number | string;
};

async function searchPortal(term: string, uf: string | undefined): Promise<SearchResult> {
  const params = new URLSearchParams({
    q: term,
    tipos_documento: "edital",
    ordenacao: "-data",
    pagina: "1",
    tam_pagina: String(SEARCH_PAGE_SIZE),
    status: "recebendo_proposta",
  });
  if (uf) params.set("ufs", uf);

  const json = await pncpJson<SearchJson>("PNCP (busca)", `${BASE}/api/search/?${params}`, SEARCH_TIMEOUT_MS);
  if (json === null) return { items: [], haMais: false, partial: false };

  const raw = Array.isArray(json.items) ? json.items : Array.isArray(json.data) ? json.data : null;
  if (!raw) {
    throw new SourceError("PNCP (busca)", 200, `formato inesperado: ${Object.keys(json).join(", ")}`);
  }
  if (raw.length > 0 && !raw.some(looksReadable)) {
    // Veio resultado, mas em campos que não conhecemos: melhor usar a API oficial.
    throw new SourceError("PNCP (busca)", 200, `campos desconhecidos: ${Object.keys(raw[0]).join(", ")}`);
  }

  // A busca é por relevância de palavras soltas: "material de limpeza" também
  // traz "material de construção". Fica só o que menciona o termo inteiro.
  const items = raw
    .filter((item) => matchesTerm(`${text(item.description) ?? ""} ${text(item.title) ?? ""} ${text(item.objeto) ?? ""}`, term))
    .map((item) => fromSearchItem(item))
    .filter((item): item is Oportunidade => item !== null);

  // Há mais páginas e a maior parte desta página era do assunto: deve haver mais.
  const total = Number(json.total);
  const haMais = Number.isFinite(total) && total > raw.length && items.length >= raw.length / 2;
  return { items, haMais, partial: false };
}

/** O item tem os campos que sabemos ler (mesmo que esteja vencido ou cancelado)? */
function looksReadable(item: Record<string, unknown>) {
  return Boolean(text(item.description) ?? text(item.objeto) ?? text(item.title)) && "orgao_nome" in item;
}

/** Item da busca do portal (campos em snake_case). */
export function fromSearchItem(item: Record<string, unknown>, now = new Date()): Oportunidade | null {
  if (item.cancelado === true) return null;
  const situacao = text(item.situacao_nome);
  if (situacao && /revogad|anulad|suspens|cancelad|deserta|fracassad|encerrad/i.test(situacao)) return null;

  const objeto = text(item.description) ?? text(item.objeto) ?? text(item.title);
  if (!objeto) return null;

  const encerramento = parseDate(
    text(item.data_fim_vigencia) ?? text(item.data_encerramento_proposta) ?? text(item.dataEncerramentoProposta),
  );
  if (encerramento && new Date(encerramento) < now) return null;

  const cnpj = text(item.orgao_cnpj);
  const ano = text(item.ano);
  const sequencial = text(item.numero_sequencial);
  const itemUrl = text(item.item_url);
  const url =
    cnpj && ano && sequencial
      ? `${BASE}/app/editais/${cnpj}/${ano}/${sequencial}`
      : itemUrl
        ? itemUrl.startsWith("http")
          ? itemUrl
          : itemUrl.startsWith("/app/")
            ? `${BASE}${itemUrl}`
            : `${BASE}/app${itemUrl.startsWith("/") ? "" : "/"}${itemUrl}`
        : undefined;

  return withFaixa({
    id: text(item.numero_controle_pncp) ?? text(item.id) ?? url ?? objeto,
    orgao: titleOrgao(text(item.orgao_nome) ?? text(item.unidade_nome) ?? "Órgão público"),
    municipio: text(item.municipio_nome),
    uf: text(item.uf)?.toUpperCase(),
    objeto: cleanObjeto(objeto),
    modalidade: text(item.modalidade_licitacao_nome) ?? "Licitação",
    valor: money(item.valor_global),
    encerramento,
    url,
  });
}

/* ------------------------------------------------------------------ */
/* API oficial de consulta (reserva)                                   */
/* ------------------------------------------------------------------ */

type ConsultaJson = {
  data?: Record<string, unknown>[];
  totalPaginas?: number;
};

type Pool = {
  items: Oportunidade[];
  /** Há mais páginas do que as baixadas: a amostra não cobre tudo. */
  truncated: boolean;
  /** Alguma página falhou. */
  failedPages: boolean;
};

/** Pregão eletrônico (6), dispensa (8) e concorrência eletrônica (4). */
const MODALIDADES = [6, 8, 4];
const PAGES = 2;
const PAGE_SIZE = 50;

/** Amostra das contratações com propostas abertas nos próximos 60 dias, da UF (ou do Brasil). */
function openPool(uf?: string): Promise<Pool> {
  return cachedPool(uf ?? "BR", async () => {
    const dataFinal = yyyymmdd(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
    const page = (modalidade: number, pagina: number) => {
      const params = new URLSearchParams({
        dataFinal,
        codigoModalidadeContratacao: String(modalidade),
        pagina: String(pagina),
        tamanhoPagina: String(PAGE_SIZE),
      });
      if (uf) params.set("uf", uf);
      return pncpJson<ConsultaJson>(
        "PNCP (consulta)",
        `${BASE}/api/consulta/v1/contratacoes/proposta?${params}`,
        CONSULTA_TIMEOUT_MS,
      );
    };

    // Primeira página de cada modalidade; as seguintes só se existirem.
    let truncated = false;
    let failedPages = false;
    const results = await Promise.allSettled(
      MODALIDADES.map(async (modalidade) => {
        const first = await page(modalidade, 1);
        const totalPaginas = Number(first?.totalPaginas) || 1;
        if (totalPaginas > PAGES) truncated = true;
        const rest = await Promise.allSettled(
          Array.from({ length: Math.min(PAGES, totalPaginas) - 1 }, (_, index) => page(modalidade, index + 2)),
        );
        if (rest.some((r) => r.status === "rejected")) failedPages = true;
        return [first, ...rest.map((r) => (r.status === "fulfilled" ? r.value : null))];
      }),
    );

    const ok = results.filter((result) => result.status === "fulfilled");
    if (ok.length === 0) {
      const first = results[0];
      throw first.status === "rejected" ? first.reason : new SourceError("PNCP (consulta)", 0, "sem resposta");
    }
    if (ok.length < results.length) failedPages = true;

    const byId = new Map<string, Oportunidade>();
    for (const json of ok.flatMap((result) => result.value)) {
      for (const raw of json?.data ?? []) {
        const item = fromConsultaItem(raw);
        if (item && !byId.has(item.id)) byId.set(item.id, item);
      }
    }
    return { items: [...byId.values()], truncated, failedPages };
  });
}

/** Contratação da API de consulta (campos em camelCase). */
export function fromConsultaItem(item: Record<string, unknown>, now = new Date()): Oportunidade | null {
  const objeto = text(item.objetoCompra);
  if (!objeto) return null;

  const encerramento = parseDate(text(item.dataEncerramentoProposta));
  if (encerramento && new Date(encerramento) < now) return null;

  const orgao = (item.orgaoEntidade ?? {}) as Record<string, unknown>;
  const unidade = (item.unidadeOrgao ?? {}) as Record<string, unknown>;
  const cnpj = text(orgao.cnpj);
  const ano = text(item.anoCompra);
  const sequencial = text(item.sequencialCompra);

  return withFaixa({
    id: text(item.numeroControlePNCP) ?? `${cnpj}-${ano}-${sequencial}`,
    orgao: titleOrgao(text(orgao.razaoSocial) ?? text(unidade.nomeUnidade) ?? "Órgão público"),
    municipio: text(unidade.municipioNome),
    uf: text(unidade.ufSigla)?.toUpperCase(),
    objeto: cleanObjeto(objeto),
    modalidade: text(item.modalidadeNome) ?? "Licitação",
    valor: money(item.valorTotalEstimado),
    encerramento,
    url: cnpj && ano && sequencial ? `${BASE}/app/editais/${cnpj}/${ano}/${sequencial}` : text(item.linkSistemaOrigem),
  });
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

/** Até R$ 80 mil a disputa é, em regra, exclusiva para ME/EPP (LC 123, art. 48, I). */
const LIMITE_ME_EPP = 80_000;

function withFaixa(item: Oportunidade): Oportunidade {
  return item.valor !== null && item.valor <= LIMITE_ME_EPP ? { ...item, faixaMeEpp: true } : item;
}

function text(value: unknown): string | undefined {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function money(value: unknown): number | null {
  const number = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
}

/**
 * Datas do PNCP vêm sem fuso ("2026-10-20T09:00:00") e são de Brasília.
 * Datas sem hora valem até o fim do dia.
 */
export function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let candidate = value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) candidate = `${value}T23:59:59-03:00`;
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value)) candidate = `${value}-03:00`;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function yyyymmdd(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Tira prefixos burocráticos ("Objeto: ...") e espaços repetidos. */
function cleanObjeto(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/^(objeto|o objeto)\s*[:\-–]\s*/i, "")
    .trim();
}

const SMALL_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "em", "na", "no"]);

/**
 * "MUNICIPIO DE SAO JOSE" → "Municipio de Sao Jose" (o PNCP manda muito nome
 * em caixa alta). Siglas sem vogal, com ponto ou com número ficam em caixa alta.
 */
export function titleOrgao(value: string) {
  if (value !== value.toUpperCase()) return value;
  const word = (part: string, first: boolean) => {
    const lower = part.toLowerCase();
    if (!first && SMALL_WORDS.has(lower)) return lower;
    if (part.includes(".") || !/[AEIOUÁÉÍÓÚÂÊÔÃÕ]/.test(part) || /\d/.test(part)) return part;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };
  return value
    .split(/\s+/)
    .map((token, index) =>
      token
        .split("/")
        .map((part, partIndex) => word(part, index === 0 && partIndex === 0))
        .join("/"),
    )
    .join(" ");
}
