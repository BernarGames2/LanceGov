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
 *    baixa as contratações com propostas abertas da UF e filtra aqui.
 *
 * Os dois formatos são lidos com tolerância (campos opcionais), porque o
 * PNCP muda e às vezes ignora filtros sem avisar.
 */

const BASE = "https://pncp.gov.br";
const SEARCH_TIMEOUT_MS = 10_000;
const CONSULTA_TIMEOUT_MS = 12_000;

export type SearchResult = {
  items: Oportunidade[];
  /** Quantas o PNCP diz que existem para a busca (pode ser maior que items). */
  total: number;
};

/** Resultados de busca mudam ao longo do dia: guarda por 10 minutos. */
const cachedSearch = memo<SearchResult>(10 * 60 * 1000);
const cachedPool = memo<Oportunidade[]>(10 * 60 * 1000, 60);

/** Licitações abertas que mencionam `term`, na UF (ou no Brasil todo sem UF). */
export function searchOpen(term: string, uf?: string, size = 20): Promise<SearchResult> {
  return cachedSearch(`${term}|${uf ?? "BR"}|${size}`, async () => {
    try {
      return await searchPortal(term, uf, size);
    } catch (error) {
      if (!(error instanceof SourceError)) throw error;
      console.warn(`[raio-x] busca do PNCP falhou (${error.message}); usando a API de consulta`);
      const pool = await openPool(uf);
      const items = pool.filter((item) => matchesTerm(item.objeto, term));
      return { items: items.slice(0, size), total: items.length };
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

async function searchPortal(term: string, uf: string | undefined, size: number): Promise<SearchResult> {
  const params = new URLSearchParams({
    q: term,
    tipos_documento: "edital",
    ordenacao: "-data",
    pagina: "1",
    tam_pagina: String(size),
    status: "recebendo_proposta",
  });
  if (uf) params.set("ufs", uf);

  const json = await getJson<SearchJson>("PNCP (busca)", `${BASE}/api/search/?${params}`, SEARCH_TIMEOUT_MS);
  if (json === null) return { items: [], total: 0 };

  const raw = Array.isArray(json.items) ? json.items : Array.isArray(json.data) ? json.data : null;
  if (!raw) {
    throw new SourceError("PNCP (busca)", 200, `formato inesperado: ${Object.keys(json).join(", ")}`);
  }

  const items = raw.map((item) => fromSearchItem(item)).filter((item): item is Oportunidade => item !== null);
  if (raw.length > 0 && items.length === 0 && !raw.some(looksReadable)) {
    // Veio resultado, mas em campos que não conhecemos: melhor usar a API oficial.
    throw new SourceError("PNCP (busca)", 200, `campos desconhecidos: ${Object.keys(raw[0]).join(", ")}`);
  }
  const total = Number(json.total);
  return { items, total: Number.isFinite(total) && total > 0 ? total : items.length };
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

/** Pregão eletrônico (6) e dispensa (8): as modalidades em que a pequena empresa mais vende. */
const MODALIDADES = [6, 8];
const PAGES = 3;
const PAGE_SIZE = 50;

/** Contratações com propostas abertas nos próximos 60 dias, da UF (ou do Brasil). */
function openPool(uf?: string): Promise<Oportunidade[]> {
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
      return getJson<ConsultaJson>(
        "PNCP (consulta)",
        `${BASE}/api/consulta/v1/contratacoes/proposta?${params}`,
        CONSULTA_TIMEOUT_MS,
      );
    };

    // Primeira página de cada modalidade; as seguintes só se existirem.
    const results = await Promise.allSettled(
      MODALIDADES.map(async (modalidade) => {
        const first = await page(modalidade, 1);
        const pages = Math.min(PAGES, Number(first?.totalPaginas) || 1);
        const rest = await Promise.allSettled(
          Array.from({ length: pages - 1 }, (_, index) => page(modalidade, index + 2)),
        );
        return [first, ...rest.map((r) => (r.status === "fulfilled" ? r.value : null))];
      }),
    );

    const ok = results.filter((result) => result.status === "fulfilled");
    if (ok.length === 0) {
      const first = results[0];
      throw first.status === "rejected" ? first.reason : new SourceError("PNCP (consulta)", 0, "sem resposta");
    }

    const byId = new Map<string, Oportunidade>();
    for (const json of ok.flatMap((result) => result.value)) {
      for (const raw of json?.data ?? []) {
        const item = fromConsultaItem(raw);
        if (item && !byId.has(item.id)) byId.set(item.id, item);
      }
    }
    return [...byId.values()];
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

/** "MUNICIPIO DE SAO JOSE" → "Municipio de Sao Jose" (o PNCP manda tudo em caixa alta). */
function titleOrgao(value: string) {
  if (value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => (index > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}
