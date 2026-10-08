import { formatCnae, normalizeText, searchTerms } from "../cnae-terms";
import type { Oportunidade, RaioXResult } from "../raio-x";
import { SourceError } from "./http";
import type { SearchOptions, SearchResult } from "./pncp";
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
  searchOpen: (term: string, uf?: string, options?: SearchOptions) => Promise<SearchResult>;
};

const TOP = 5;
/** Com menos que isso na UF, a lista é completada com outros estados. */
const MIN_REGIONAL = 5;

export const MESSAGES = {
  naoEncontrado:
    "Não encontramos esse CNPJ na base pública da Receita. Confira o CNPJ digitado; empresas abertas nas últimas semanas podem ainda não aparecer, porque essa base é atualizada uma vez por mês.",
  naoEncontradoAlfanumerico:
    "Não encontramos esse CNPJ na base pública da Receita. Os CNPJs com letras são novos e podem ainda não estar nessa base, que é atualizada uma vez por mês.",
  receitaFora: "A consulta à Receita não respondeu agora. Tente de novo em instantes.",
  pncpFora: "O PNCP, portal oficial das licitações, não respondeu agora. Tente de novo em alguns minutos.",
} as const;

/** Monta o Raio-X real de um CNPJ (já validado). */
export async function buildRaioX(cnpj: string, deps: RaioXDeps, now = new Date()): Promise<RaioXResult> {
  let empresa: Empresa;
  try {
    empresa = await deps.getEmpresa(cnpj);
  } catch (error) {
    if (error instanceof SourceError && error.status === 404) {
      throw new RaioXFailure(404, /[A-Z]/.test(cnpj) ? MESSAGES.naoEncontradoAlfanumerico : MESSAGES.naoEncontrado);
    }
    console.error("[raio-x] Receita:", error);
    throw new RaioXFailure(502, MESSAGES.receitaFora);
  }

  const termos = searchTerms(empresa.cnaes, 3);
  const principal = empresa.cnaes[0];
  const result: RaioXResult = {
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
  if (termos.length === 0) return result;

  // 1. Na UF da empresa (ou no Brasil, se a Receita não informou a UF).
  const regional = await Promise.allSettled(
    termos.map((term) => deps.searchOpen(term, empresa.uf, { municipioIbge: empresa.codigoMunicipioIbge })),
  );
  if (regional.every((settled) => settled.status === "rejected")) {
    const first = regional[0];
    console.error("[raio-x] PNCP:", first.status === "rejected" ? first.reason : first);
    throw new RaioXFailure(502, MESSAGES.pncpFora);
  }
  const fromRegion = collect(regional);
  // O PNCP às vezes ignora o filtro de UF: os números contam só a UF da empresa.
  const regionalItems = fromRegion.items.filter((item) => !empresa.uf || !item.uf || item.uf === empresa.uf);
  const partial = fromRegion.partial || regional.some((settled) => settled.status === "rejected");

  // 2. Pouca coisa na UF: completa a lista com o Brasil todo, sem reserva
  //    (se a busca já está falhando, não vale insistir no PNCP).
  let nationalItems: Oportunidade[] = [];
  let nationalHaMais = false;
  const nationalRan = Boolean(empresa.uf) && regionalItems.length < MIN_REGIONAL && !partial;
  if (nationalRan) {
    const national = await Promise.allSettled(
      termos.slice(0, 2).map((term) => deps.searchOpen(term, undefined, { fallback: false })),
    );
    const fromBrasil = collect(national);
    const known = new Set(regionalItems.map((item) => item.id));
    nationalItems = fromBrasil.items.filter((item) => !known.has(item.id) && item.uf !== empresa.uf);
    nationalHaMais = fromBrasil.haMais;
    // A busca nacional é só um complemento: se ela falhar, os números da UF continuam inteiros.
  }

  // Empresa grande não disputa a faixa reservada a ME/EPP.
  const podeFaixa = empresa.porte !== "Demais";
  const eligible = (items: Oportunidade[]) =>
    items.filter((item) => !item.encerramento || new Date(item.encerramento) >= now).filter((item) => podeFaixa || !item.faixaMeEpp);
  const open = (items: Oportunidade[]) => items.filter((item) => !item.encerramento || new Date(item.encerramento) >= now);

  // Os números falam de um lugar só: a UF, ou o Brasil quando a UF não teve nada.
  const useRegion = regionalItems.length > 0 || !nationalRan;
  const scope = useRegion ? regionalItems : nationalItems;
  result.abrangencia = empresa.uf && useRegion ? "uf" : "brasil";

  const counted = eligible(scope);
  result.abertas = {
    quantidade: counted.length,
    haMais: useRegion ? fromRegion.haMais : nationalHaMais,
    valorTotal: counted.reduce((sum, item) => sum + (item.valor ?? 0), 0),
    exclusivasMeEpp: open(scope).filter((item) => item.faixaMeEpp).length,
  };

  const list = rank(eligible(regionalItems), empresa, now);
  if (list.length < TOP) list.push(...rank(eligible(nationalItems), empresa, now));
  result.oportunidades = list.slice(0, TOP);
  result.complementoNacional = useRegion && Boolean(empresa.uf) && result.oportunidades.some((item) => item.uf !== empresa.uf);
  if (partial) result.parcial = true;
  return result;
}

/** Junta os resultados de várias buscas, sem repetir licitação. */
function collect(results: PromiseSettledResult<SearchResult>[]) {
  const byId = new Map<string, Oportunidade>();
  let haMais = false;
  let partial = false;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    if (result.value.haMais) haMais = true;
    if (result.value.partial) partial = true;
    for (const item of result.value.items) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
  }
  return { items: [...byId.values()], haMais, partial };
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
