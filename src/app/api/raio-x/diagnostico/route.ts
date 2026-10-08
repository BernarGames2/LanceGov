import { cleanCnpj, isValidCnpj } from "@/lib/cnpj";
import { getJson, SourceError } from "@/lib/server/http";
import { lookupEmpresa } from "@/lib/server/receita";

/**
 * GET /api/raio-x/diagnostico?cnpj=... — mostra o que cada fonte respondeu,
 * de dentro do servidor (Receita e PNCP). Serve para descobrir por que o
 * Raio-X falhou. Só dados públicos; limitado a poucas chamadas por minuto.
 */
export const maxDuration = 30;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

const PROBE_FIELDS = [
  "description",
  "title",
  "orgao_nome",
  "uf",
  "municipio_nome",
  "modalidade_licitacao_nome",
  "valor_global",
  "data_fim_vigencia",
  "numero_controle_pncp",
  "item_url",
  "situacao_nome",
];

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (recent.length > MAX_PER_WINDOW) return pretty({ erro: "Espere um minuto antes de rodar o diagnóstico de novo." }, 429);

  const raw = new URL(request.url).searchParams.get("cnpj") ?? "33000167000101";
  const cnpj = cleanCnpj(raw);
  if (!isValidCnpj(cnpj)) return pretty({ erro: "CNPJ inválido" }, 400);

  const [receita, busca, consulta] = await Promise.all([
    lookupEmpresa(cnpj, { hedgeMs: 0, waitAll: true }),
    probe("PNCP busca", `https://pncp.gov.br/api/search/?${new URLSearchParams({
      q: "material de limpeza",
      tipos_documento: "edital",
      ordenacao: "-data",
      pagina: "1",
      tam_pagina: "3",
      status: "recebendo_proposta",
    })}`, (json) => {
      const items = (json.items ?? json.data) as Record<string, unknown>[] | undefined;
      const first = items?.[0] ?? {};
      return {
        chaves: Object.keys(json),
        total: json.total,
        itens: items?.length ?? null,
        camposDoPrimeiroItem: Object.keys(first),
        amostra: Object.fromEntries(PROBE_FIELDS.map((key) => [key, first[key] ?? null])),
      };
    }),
    probe("PNCP consulta", `https://pncp.gov.br/api/consulta/v1/contratacoes/proposta?${new URLSearchParams({
      dataFinal: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10).replace(/-/g, ""),
      codigoModalidadeContratacao: "6",
      pagina: "1",
      tamanhoPagina: "10",
    })}`, (json) => {
      const data = json.data as Record<string, unknown>[] | undefined;
      return {
        chaves: Object.keys(json),
        totalRegistros: json.totalRegistros,
        camposDoPrimeiroItem: Object.keys(data?.[0] ?? {}),
      };
    }),
  ]);

  return pretty({
    regiao: process.env.VERCEL_REGION ?? "local",
    cnpj,
    receita: {
      encontrada: receita.empresa
        ? { nome: receita.empresa.nome, uf: receita.empresa.uf, cnaes: receita.empresa.cnaes.length, porte: receita.empresa.porte }
        : null,
      naoEncontrado: receita.naoEncontrado,
      fontes: receita.outcomes,
    },
    pncp: { busca, consulta },
  });
}

async function probe(fonte: string, url: string, summarize: (json: Record<string, unknown>) => unknown) {
  const began = Date.now();
  try {
    const json = await getJson<Record<string, unknown>>(fonte, url, 12_000);
    return { ok: true, ms: Date.now() - began, ...(json ? (summarize(json) as object) : { vazio: true }) };
  } catch (error) {
    return {
      ok: false,
      ms: Date.now() - began,
      status: error instanceof SourceError ? error.status : 0,
      erro: error instanceof Error ? error.message : String(error),
    };
  }
}

function pretty(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
