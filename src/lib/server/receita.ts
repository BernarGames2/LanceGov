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

/** Formato da BrasilAPI e do minhareceita.org (os dois usam os mesmos campos). */
type ReceitaJson = {
  razao_social?: string;
  nome_fantasia?: string;
  uf?: string;
  municipio?: string;
  porte?: string;
  opcao_pelo_mei?: boolean | null;
  cnae_fiscal?: number | string;
  cnae_fiscal_descricao?: string;
  cnaes_secundarios?: { codigo?: number | string; descricao?: string }[] | null;
  descricao_situacao_cadastral?: string;
};

const PROVIDERS = [
  { name: "BrasilAPI", url: (cnpj: string) => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}` },
  { name: "Minha Receita", url: (cnpj: string) => `https://minhareceita.org/${cnpj}` },
];

const TIMEOUT_MS = 7000;

/** Dados cadastrais mudam pouco: guarda por 12 horas. */
const cached = memo<Empresa>(12 * 60 * 60 * 1000);

/**
 * Busca a empresa na base pública da Receita. Tenta a BrasilAPI e, se ela
 * falhar, o minhareceita.org. Lança SourceError 404 se nenhuma conhece o CNPJ.
 */
export function getEmpresa(cnpj: string): Promise<Empresa> {
  return cached(cnpj, () => loadEmpresa(cnpj));
}

async function loadEmpresa(cnpj: string): Promise<Empresa> {
  let notFound = 0;
  let lastError: SourceError | null = null;

  for (const provider of PROVIDERS) {
    try {
      const data = await getJson<ReceitaJson>(provider.name, provider.url(cnpj), TIMEOUT_MS);
      if (data && (data.razao_social || data.cnae_fiscal)) return toEmpresa(cnpj, data);
      notFound++;
    } catch (error) {
      if (!(error instanceof SourceError)) throw error;
      if (error.status === 404 || error.status === 400) notFound++;
      else lastError = error;
    }
  }

  if (notFound === PROVIDERS.length || (notFound > 0 && !lastError)) {
    throw new SourceError("Receita", 404, "CNPJ não encontrado na base pública da Receita");
  }
  throw lastError ?? new SourceError("Receita", 0, "Receita indisponível");
}

export function toEmpresa(cnpj: string, data: ReceitaJson): Empresa {
  const cnaes: Empresa["cnaes"] = [];
  if (data.cnae_fiscal) {
    cnaes.push({ codigo: String(data.cnae_fiscal), descricao: data.cnae_fiscal_descricao ?? "" });
  }
  for (const item of data.cnaes_secundarios ?? []) {
    if (item?.codigo && Number(item.codigo) > 0) {
      cnaes.push({ codigo: String(item.codigo), descricao: item.descricao ?? "" });
    }
  }

  return {
    cnpj,
    nome: titleCase(data.nome_fantasia?.trim() || data.razao_social?.trim() || "Empresa"),
    uf: data.uf?.trim().toUpperCase() || undefined,
    // A Receita manda o município sem acento: fica como veio, em vez de "Sao Paulo".
    municipio: data.municipio?.trim().toUpperCase() || undefined,
    porte: toPorte(data),
    situacao: data.descricao_situacao_cadastral?.trim() || undefined,
    cnaes,
  };
}

function toPorte(data: ReceitaJson): Porte {
  if (data.opcao_pelo_mei) return "MEI";
  const porte = (data.porte ?? "").toUpperCase();
  if (porte.includes("MICRO")) return "ME";
  if (porte.includes("PEQUENO")) return "EPP";
  if (porte.includes("DEMAIS")) return "Demais";
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
