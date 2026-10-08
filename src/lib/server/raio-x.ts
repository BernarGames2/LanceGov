import { formatCnae, normalizeText, searchTerms } from "../cnae-terms";
import type { Oportunidade, RaioXResult } from "../raio-x";
import { SourceError } from "./http";
import type { SearchResult } from "./pncp";
import type { Empresa } from "./receita";

/** Erro com status HTTP e mensagem pronta para o visitante. */
export class RaioXFailure extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RaioXFailure";
  }
}

export type RaioXDeps = {
  getEmpresa: (cnpj: string) => Promise<Empresa>;
  searchOpen: (term: string, uf?: string, size?: number) => Promise<SearchResult>;
};

const PER_TERM = 20;
const TOP = 5;
/** Com menos que isso na UF, completa com o Brasil todo. */
const MIN_REGIONAL = 5;

export const MESSAGES = {
  naoEncontrado:
    "Não encontramos esse CNPJ na base pública da Receita. Confira os números; CNPJs abertos há poucos dias podem demorar para aparecer.",
  receitaFora: "A consulta à Receita não respondeu agora. Tente de novo em instantes.",
  pncpFora: "O PNCP, portal oficial das licitações, não respondeu agora. Tente de novo em alguns minutos.",
} as const;

/** Monta o Raio-X real de um CNPJ (já validado). */
export async function buildRaioX(cnpj: string, deps: RaioXDeps, now = new Date()): Promise<RaioXResult> {
  let empresa: Empresa;
  try {
    empresa = await deps.getEmpresa(cnpj);
  } catch (error) {
    if (error instanceof SourceError && error.status === 404) throw new RaioXFailure(404, MESSAGES.naoEncontrado);
    console.error("[raio-x] Receita:", error);
    throw new RaioXFailure(502, MESSAGES.receitaFora);
  }

  const termos = searchTerms(empresa.cnaes, 3);
  const principal = empresa.cnaes[0];
  const base: RaioXResult = {
    cnpj,
    exemplo: false,
    empresa: { nome: empresa.nome, uf: empresa.uf, municipio: empresa.municipio, situacao: empresa.situacao },
    perfil: {
      cnae: principal ? formatCnae(principal.codigo) : "—",
      descricaoCnae: principal?.descricao ?? "",
      porte: empresa.porte,
    },
    abertas: { quantidade: 0, valorTotal: 0, exclusivasMeEpp: 0 },
    ultimas4Semanas: null,
    oportunidades: [],
    termos,
    abrangencia: empresa.uf ? "uf" : "brasil",
    consultadoEm: now.toISOString(),
  };
  if (termos.length === 0) return base;

  // Primeiro na UF da empresa; se vier pouco, completa com o Brasil todo.
  const regional = await Promise.allSettled(termos.map((term) => deps.searchOpen(term, empresa.uf, PER_TERM)));
  let settled = regional;
  let found = collect(regional);

  if (empresa.uf && found.items.length < MIN_REGIONAL) {
    const national = await Promise.allSettled(termos.slice(0, 2).map((term) => deps.searchOpen(term, undefined, PER_TERM)));
    settled = [...regional, ...national];
    found = collect(settled);
    if (found.items.length > 0 && !found.items.some((item) => item.uf === empresa.uf)) {
      base.abrangencia = "brasil";
    }
  }

  if (settled.every((result) => result.status === "rejected")) {
    const first = settled[0];
    console.error("[raio-x] PNCP:", first.status === "rejected" ? first.reason : first);
    throw new RaioXFailure(502, MESSAGES.pncpFora);
  }

  const items = found.items.filter((item) => !item.encerramento || new Date(item.encerramento) >= now);
  const ranked = rank(items, empresa, now);

  return {
    ...base,
    abertas: {
      quantidade: items.length,
      haMais: found.haMais,
      valorTotal: items.reduce((sum, item) => sum + (item.valor ?? 0), 0),
      exclusivasMeEpp: items.filter((item) => item.faixaMeEpp).length,
    },
    oportunidades: ranked.slice(0, TOP),
  };
}

/** Junta os resultados de várias buscas, sem repetir licitação. */
function collect(results: PromiseSettledResult<SearchResult>[]) {
  const byId = new Map<string, Oportunidade>();
  let haMais = false;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    if (result.value.total > result.value.items.length) haMais = true;
    for (const item of result.value.items) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
  }
  return { items: [...byId.values()], haMais };
}

/**
 * Ordena pelo que mais interessa a uma pequena empresa: perto de casa, na
 * faixa reservada a ME/EPP e com prazo para se preparar.
 */
export function rank(items: Oportunidade[], empresa: Pick<Empresa, "uf" | "municipio" | "porte">, now = new Date()) {
  const municipio = empresa.municipio ? normalizeText(empresa.municipio) : null;
  const pequena = empresa.porte === "MEI" || empresa.porte === "ME" || empresa.porte === "EPP";

  const score = (item: Oportunidade) => {
    let points = 0;
    if (municipio && item.municipio && normalizeText(item.municipio) === municipio) points += 3;
    if (empresa.uf && item.uf === empresa.uf) points += 2;
    if (pequena && item.faixaMeEpp) points += 2;
    if (item.encerramento) {
      const days = (new Date(item.encerramento).getTime() - now.getTime()) / 86_400_000;
      if (days < 2) points -= 2;
      else if (days >= 3) points += 1;
    }
    return points;
  };

  return [...items].sort((a, b) => score(b) - score(a) || (b.valor ?? -1) - (a.valor ?? -1));
}
