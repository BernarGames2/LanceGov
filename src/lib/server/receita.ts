import type { Porte } from "../raio-x";
import { getJson, memo, SourceError } from "./http";

export type Empresa = {
  cnpj: string;
  nome: string;
  uf?: string;
  municipio?: string;
  porte: Porte;
  situacao?: string;
  cnaes: { codigo: string; descricao: string }[];
};

type Json = Record<string, unknown>;

/** Resultado de uma fonte: a empresa, "não conhece este CNPJ", ou erro (lança SourceError). */
type Parsed = Empresa | "nao-encontrado";

type Provider = {
  name: string;
  url: (cnpj: string) => string;
  parse: (cnpj: string, json: Json) => Parsed;
};

/**
 * Fontes públicas da base da Receita, todas gratuitas. Têm limites de uso e
 * às vezes saem do ar ou barram servidores na nuvem, por isso são várias.
 */
export const PROVIDERS: Provider[] = [
  { name: "BrasilAPI", url: (cnpj) => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, parse: fromBrasilApi },
  { name: "CNPJá", url: (cnpj) => `https://open.cnpja.com/office/${cnpj}`, parse: fromCnpja },
  { name: "Minha Receita", url: (cnpj) => `https://minhareceita.org/${cnpj}`, parse: fromBrasilApi },
  { name: "CNPJ.ws", url: (cnpj) => `https://publica.cnpj.ws/cnpj/${cnpj}`, parse: fromCnpjWs },
  { name: "ReceitaWS", url: (cnpj) => `https://receitaws.com.br/v1/cnpj/${cnpj}`, parse: fromReceitaWs },
];

const TIMEOUT_MS = 8000;
/** A primeira fonte sai sozinha; se não responder nesse tempo, as outras entram juntas. */
const HEDGE_MS = 1500;

/** Dados cadastrais mudam pouco: guarda por 12 horas. */
const cached = memo<Empresa>(12 * 60 * 60 * 1000);

/**
 * Busca a empresa na base pública da Receita. A primeira fonte que responder
 * com a empresa vence. SourceError 404 só quando nenhuma fonte conhece o CNPJ;
 * se todas falharem, SourceError com o resumo de cada uma.
 */
export function getEmpresa(cnpj: string): Promise<Empresa> {
  return cached(cnpj, () => loadEmpresa(cnpj));
}

export type ProviderOutcome = { fonte: string; ok: boolean; status: number; ms: number; detalhe: string };

/**
 * Consulta as fontes em paralelo escalonado: a primeira sai sozinha e as
 * outras entram juntas quando ela falha ou passa de `hedgeMs` sem responder.
 * Devolve a empresa (a primeira resposta válida) e o que cada fonte respondeu.
 */
export async function lookupEmpresa(
  cnpj: string,
  { providers = PROVIDERS, hedgeMs = HEDGE_MS, waitAll = false } = {},
): Promise<{ empresa: Empresa | null; naoEncontrado: boolean; outcomes: ProviderOutcome[] }> {
  const controller = new AbortController();
  const outcomes: ProviderOutcome[] = [];
  const found: Empresa[] = [];
  let naoEncontrado = false;

  await new Promise<void>((resolve) => {
    let pending = providers.length;
    let launched = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      clearTimeout(timer);
      resolve();
    };
    const settle = (ok: boolean) => {
      pending--;
      if (ok && !waitAll) return finish();
      if (!ok) launchRest();
      if (pending === 0) finish();
    };

    const run = async (provider: Provider) => {
      const began = Date.now();
      const outcome = (ok: boolean, status: number, detalhe: string) =>
        outcomes.push({ fonte: provider.name, ok, status, ms: Date.now() - began, detalhe });
      try {
        const json = await getJson<Json>(provider.name, provider.url(cnpj), TIMEOUT_MS, waitAll ? undefined : controller.signal);
        const parsed = json ? provider.parse(cnpj, json) : "nao-encontrado";
        if (parsed === "nao-encontrado") {
          naoEncontrado = true;
          outcome(false, 404, "não conhece o CNPJ");
          return settle(false);
        }
        outcome(true, 200, parsed.nome);
        found.push(parsed);
        if (!waitAll) controller.abort();
        settle(true);
      } catch (error) {
        const status = error instanceof SourceError ? error.status : 0;
        if (status === 404) naoEncontrado = true;
        outcome(false, status, error instanceof Error ? error.message : String(error));
        settle(false);
      }
    };

    const launchRest = () => {
      if (launched || (found.length > 0 && !waitAll)) return;
      launched = true;
      providers.slice(1).forEach((provider) => void run(provider));
    };

    void run(providers[0]);
    if (hedgeMs <= 0) launchRest();
    else timer = setTimeout(launchRest, hedgeMs);
  });

  return { empresa: found[0] ?? null, naoEncontrado, outcomes };
}

async function loadEmpresa(cnpj: string): Promise<Empresa> {
  const { empresa, naoEncontrado, outcomes } = await lookupEmpresa(cnpj);
  if (empresa) return empresa;
  if (naoEncontrado) throw new SourceError("Receita", 404, "CNPJ não encontrado na base pública da Receita");
  const resumo = outcomes.map((o) => `${o.fonte}: ${o.detalhe}`).join(" | ");
  console.error(`[raio-x] nenhuma fonte da Receita respondeu: ${resumo}`);
  throw new SourceError("Receita", 0, `Receita indisponível (${resumo})`);
}

/* ------------------------------------------------------------------ */
/* Formatos de cada fonte                                              */
/* ------------------------------------------------------------------ */

const str = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
const obj = (value: unknown) => (value && typeof value === "object" ? (value as Json) : {});
const digits = (value: unknown) => (typeof value === "string" || typeof value === "number" ? String(value).replace(/\D/g, "") : "");

/** BrasilAPI e Minha Receita (mesmo formato). */
export function fromBrasilApi(cnpj: string, data: Json): Parsed {
  if (!str(data.razao_social) && !data.cnae_fiscal) return "nao-encontrado";
  const cnaes: Empresa["cnaes"] = [];
  if (data.cnae_fiscal) cnaes.push({ codigo: digits(data.cnae_fiscal), descricao: str(data.cnae_fiscal_descricao) ?? "" });
  for (const item of (data.cnaes_secundarios as Json[] | null) ?? []) {
    const codigo = digits(obj(item).codigo);
    if (Number(codigo) > 0) cnaes.push({ codigo, descricao: str(obj(item).descricao) ?? "" });
  }
  return empresaFrom(cnpj, {
    nome: str(data.nome_fantasia) ?? str(data.razao_social),
    uf: str(data.uf),
    municipio: str(data.municipio),
    porte: toPorte(str(data.porte), data.opcao_pelo_mei === true),
    situacao: str(data.descricao_situacao_cadastral),
    cnaes,
  });
}

/** CNPJá (open.cnpja.com). */
export function fromCnpja(cnpj: string, data: Json): Parsed {
  const company = obj(data.company);
  if (!str(company.name) && !data.mainActivity) return "nao-encontrado";
  const cnaes: Empresa["cnaes"] = [];
  const main = obj(data.mainActivity);
  if (digits(main.id)) cnaes.push({ codigo: digits(main.id), descricao: str(main.text) ?? "" });
  for (const item of (data.sideActivities as Json[] | null) ?? []) {
    const codigo = digits(obj(item).id);
    if (Number(codigo) > 0) cnaes.push({ codigo, descricao: str(obj(item).text) ?? "" });
  }
  const size = obj(company.size);
  const address = obj(data.address);
  return empresaFrom(cnpj, {
    nome: str(data.alias) ?? str(company.name),
    uf: str(address.state),
    municipio: str(address.city),
    porte: toPorte(str(size.acronym) ?? str(size.text), obj(company.simei).optant === true),
    situacao: str(obj(data.status).text),
    cnaes,
  });
}

/** CNPJ.ws (publica.cnpj.ws). */
export function fromCnpjWs(cnpj: string, data: Json): Parsed {
  const est = obj(data.estabelecimento);
  if (!str(data.razao_social) && !est.atividade_principal) return "nao-encontrado";
  const cnaes: Empresa["cnaes"] = [];
  const main = obj(est.atividade_principal);
  const mainCode = digits(main.id) || digits(main.subclasse);
  if (mainCode) cnaes.push({ codigo: mainCode, descricao: str(main.descricao) ?? "" });
  for (const item of (est.atividades_secundarias as Json[] | null) ?? []) {
    const codigo = digits(obj(item).id) || digits(obj(item).subclasse);
    if (Number(codigo) > 0) cnaes.push({ codigo, descricao: str(obj(item).descricao) ?? "" });
  }
  return empresaFrom(cnpj, {
    nome: str(est.nome_fantasia) ?? str(data.razao_social),
    uf: str(obj(est.estado).sigla),
    municipio: str(obj(est.cidade).nome),
    porte: toPorte(str(obj(data.porte).descricao), /^sim$/i.test(str(obj(data.simples).mei) ?? "")),
    situacao: str(est.situacao_cadastral),
    cnaes,
  });
}

/** ReceitaWS (receitaws.com.br): erro vem com status "ERROR" e HTTP 200. */
export function fromReceitaWs(cnpj: string, data: Json): Parsed {
  if (str(data.status) === "ERROR") {
    const message = str(data.message) ?? "";
    if (/inv[aá]lido|rejeitado|n[aã]o encontrado/i.test(message)) return "nao-encontrado";
    throw new SourceError("ReceitaWS", 503, `ReceitaWS: ${message || "erro"}`);
  }
  if (!str(data.nome)) return "nao-encontrado";
  const cnaes: Empresa["cnaes"] = [];
  for (const item of [
    ...((data.atividade_principal as Json[] | null) ?? []),
    ...((data.atividades_secundarias as Json[] | null) ?? []),
  ]) {
    const codigo = digits(obj(item).code);
    if (Number(codigo) > 0) cnaes.push({ codigo, descricao: str(obj(item).text) ?? "" });
  }
  return empresaFrom(cnpj, {
    nome: str(data.fantasia) ?? str(data.nome),
    uf: str(data.uf),
    municipio: str(data.municipio),
    porte: toPorte(str(data.porte), obj(data.simei).optante === true),
    situacao: str(data.situacao),
    cnaes,
  });
}

function empresaFrom(
  cnpj: string,
  data: { nome?: string; uf?: string; municipio?: string; porte: Porte; situacao?: string; cnaes: Empresa["cnaes"] },
): Empresa {
  return {
    cnpj,
    nome: titleCase(data.nome ?? "Empresa"),
    uf: data.uf?.toUpperCase(),
    // Algumas fontes mandam o município sem acento: fica em caixa alta, em vez de "Sao Paulo".
    municipio: data.municipio?.toUpperCase(),
    porte: data.porte,
    situacao: data.situacao?.toUpperCase(),
    cnaes: data.cnaes,
  };
}

/** Compatível com o formato antigo dos testes: BrasilAPI → Empresa. */
export function toEmpresa(cnpj: string, data: Json): Empresa {
  const parsed = fromBrasilApi(cnpj, data);
  if (parsed === "nao-encontrado") throw new SourceError("Receita", 404, "sem dados");
  return parsed;
}

function toPorte(porte: string | undefined, mei: boolean): Porte {
  if (mei) return "MEI";
  const value = (porte ?? "").toUpperCase();
  if (value === "ME" || value.includes("MICRO")) return "ME";
  if (value === "EPP" || value.includes("PEQUENO")) return "EPP";
  if (value.includes("DEMAIS")) return "Demais";
  return "Não informado";
}

const LOWERCASE_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "em"]);
const UPPERCASE_WORDS = new Set(["ltda", "ltda.", "me", "epp", "eireli", "sa", "s/a", "s.a.", "mei"]);

/**
 * "DISTRIBUIDORA DE LIMPEZA SILVA LTDA" → "Distribuidora de Limpeza Silva LTDA".
 * Siglas com ponto ("J.R.") ou sem vogal ficam em caixa alta. O nome de MEI
 * começa com o número do CNPJ ("12.345.678 JOAO DA SILVA"): esse número sai.
 */
export function titleCase(value: string) {
  return value
    .replace(/^\d{2}\.?\d{3}\.?\d{3}\s+/, "")
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (UPPERCASE_WORDS.has(lower)) return word.toUpperCase();
      if (index > 0 && LOWERCASE_WORDS.has(lower)) return lower;
      if (/\./.test(word) || !/[aeiouáéíóúâêôãõ]/i.test(word)) return word.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
