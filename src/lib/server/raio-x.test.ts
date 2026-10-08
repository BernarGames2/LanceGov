import { afterEach, describe, expect, it, vi } from "vitest";

import { brasilApiEmpresa, consultaResponse, searchResponse } from "./__fixtures__/fixtures";
import { SourceError } from "./http";
import { fromConsultaItem, fromSearchItem, parseDate, searchOpen, titleOrgao } from "./pncp";
import { buildRaioX, MESSAGES, rank, RaioXFailure, type RaioXDeps } from "./raio-x";
import { getEmpresa, titleCase, toEmpresa } from "./receita";

const NOW = new Date("2026-10-08T12:00:00-03:00");

function jsonResponse(body: unknown, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Receita", () => {
  it("converte o formato da BrasilAPI", () => {
    const empresa = toEmpresa("11222333000181", brasilApiEmpresa);
    expect(empresa).toMatchObject({
      nome: "Distribuidora Exemplo de Limpeza LTDA",
      uf: "SP",
      municipio: "CAMPINAS",
      porte: "EPP",
      situacao: "ATIVA",
    });
    expect(empresa.cnaes).toEqual([
      { codigo: "4649408", descricao: brasilApiEmpresa.cnae_fiscal_descricao },
      { codigo: "4761003", descricao: "Comércio varejista de artigos de papelaria" },
    ]);
    expect(toEmpresa("x", { opcao_pelo_mei: true, porte: "MICRO EMPRESA", razao_social: "A" }).porte).toBe("MEI");
  });

  it("tenta o minhareceita.org quando a BrasilAPI falha", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes("brasilapi") ? jsonResponse({ message: "erro" }, 500) : jsonResponse(brasilApiEmpresa),
    );
    vi.stubGlobal("fetch", fetchMock);
    const empresa = await getEmpresa("10000000000100");
    expect(empresa.nome).toBe("Distribuidora Exemplo de Limpeza LTDA");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("dá 404 quando nenhuma fonte conhece o CNPJ", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ message: "not found" }, 404)));
    await expect(getEmpresa("20000000000100")).rejects.toMatchObject({ status: 404 });
  });
});

describe("PNCP", () => {
  it("lê um item da busca do portal", () => {
    const item = fromSearchItem(searchResponse.items[0], NOW);
    expect(item).toMatchObject({
      id: "46000000000100-1-000012/2026",
      orgao: "Municipio de Campinas",
      municipio: "Campinas",
      uf: "SP",
      modalidade: "Pregão - Eletrônico",
      valor: 184000,
      url: "https://pncp.gov.br/app/editais/46000000000100/2026/12",
    });
    expect(item?.faixaMeEpp).toBeUndefined();
    expect(item?.encerramento).toBe("2026-10-20T12:00:00.000Z");
    expect(fromSearchItem(searchResponse.items[1], NOW)?.faixaMeEpp).toBe(true);
  });

  it("descarta licitação com prazo vencido ou cancelada", () => {
    expect(fromSearchItem(searchResponse.items[2], NOW)).toBeNull();
    expect(fromSearchItem({ ...searchResponse.items[0], cancelado: true }, NOW)).toBeNull();
    expect(fromSearchItem({ ...searchResponse.items[0], situacao_nome: "Revogada" }, NOW)).toBeNull();
  });

  it("lê um item da API de consulta", () => {
    expect(fromConsultaItem(consultaResponse.data[0], NOW)).toMatchObject({
      orgao: "Municipio de Jundiai",
      municipio: "Jundiaí",
      uf: "SP",
      valor: 52001,
      faixaMeEpp: true,
      url: "https://pncp.gov.br/app/editais/99000000000100/2026/44",
    });
  });

  it("entende as datas de Brasília", () => {
    expect(parseDate("2026-10-20T09:00:00")).toBe("2026-10-20T12:00:00.000Z");
    expect(parseDate("2026-10-20")).toBe("2026-10-21T02:59:59.000Z");
    expect(parseDate("2026-10-20T09:00:00Z")).toBe("2026-10-20T09:00:00.000Z");
    expect(parseDate("ontem")).toBeUndefined();
  });

  it("usa a busca do portal com o termo e a UF", async () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () => jsonResponse(searchResponse));
    vi.stubGlobal("fetch", fetchMock);
    const result = await searchOpen("material de limpeza", "SP");
    vi.useRealTimers();
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.pathname).toBe("/api/search/");
    expect(url.searchParams.get("q")).toBe("material de limpeza");
    expect(url.searchParams.get("ufs")).toBe("SP");
    expect(url.searchParams.get("status")).toBe("recebendo_proposta");
    expect(result.items).toHaveLength(2);
    expect(result.haMais).toBe(true);
    expect(result.partial).toBe(false);
  });

  it("cai para a API de consulta quando a busca falha e filtra pelo termo", async () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn(async (url: string) =>
      url.includes("/api/search/") ? jsonResponse({}, 503) : jsonResponse(consultaResponse),
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await searchOpen("material de limpeza", "RJ");
    vi.useRealTimers();
    expect(result.items.map((item) => item.id)).toEqual(["99000000000100-1-000044/2026"]);
    expect(result.partial).toBe(true);
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("/api/consulta/v1/contratacoes/proposta"))).toBe(true);
  });

  it("trata 204 do PNCP como busca vazia", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(null, 204)));
    await expect(searchOpen("termo sem resultado", "AC")).resolves.toEqual({ items: [], haMais: false, partial: false });
  });
});

describe("buildRaioX", () => {
  const empresa = toEmpresa("11222333000181", brasilApiEmpresa);
  const item = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    orgao: "Órgão",
    objeto: "Material de limpeza",
    modalidade: "Pregão",
    valor: 100_000,
    uf: "SP",
    encerramento: "2026-10-20T12:00:00.000Z",
    ...extra,
  });
  const found = (items: ReturnType<typeof item>[], extra: Partial<{ haMais: boolean; partial: boolean }> = {}) => ({
    items,
    haMais: false,
    partial: false,
    ...extra,
  });

  it("junta as buscas sem repetir, calcula os totais da UF e ordena", async () => {
    const deps: RaioXDeps = {
      getEmpresa: async () => empresa,
      searchOpen: async (term) =>
        term === "material de limpeza"
          ? found(
              [
                item("longe", { municipio: "Sorocaba", valor: 500_000 }),
                item("perto", { municipio: "Campinas", valor: 70_000, faixaMeEpp: true }),
                item("amanha", { municipio: "Campinas", encerramento: "2026-10-09T12:00:00.000Z" }),
                item("outra-sp", { municipio: "Santos", valor: null }),
                item("mais-uma", { municipio: "Bauru", valor: 30_000 }),
              ],
              { haMais: true },
            )
          : found([item("perto", { municipio: "Campinas" }), item("ignorou-uf", { uf: "MG" })]),
    };
    const result = await buildRaioX("11222333000181", deps, NOW);
    expect(result.exemplo).toBe(false);
    expect(result.empresa?.nome).toBe("Distribuidora Exemplo de Limpeza LTDA");
    expect(result.perfil).toEqual({
      cnae: "4649-4/08",
      descricaoCnae: brasilApiEmpresa.cnae_fiscal_descricao,
      porte: "EPP",
    });
    expect(result.termos).toEqual(["material de limpeza", "produtos de higiene", "material de expediente"]);
    // O item de MG (PNCP ignorou o filtro de UF) não entra nos números de SP.
    expect(result.abertas).toEqual({ quantidade: 5, haMais: true, valorTotal: 700_000, exclusivasMeEpp: 1 });
    expect(result.abrangencia).toBe("uf");
    expect(result.oportunidades.map((o) => o.id)).toEqual(["perto", "longe", "amanha", "mais-uma", "outra-sp"]);
    expect(result.parcial).toBeUndefined();
  });

  it("completa a lista com outros estados sem misturar nos números da UF", async () => {
    const deps: RaioXDeps = {
      getEmpresa: async () => empresa,
      searchOpen: async (term, uf, options) => {
        if (uf) return found(term === "material de limpeza" ? [item("sp-1", { municipio: "Campinas" })] : []);
        expect(options?.fallback).toBe(false);
        return found([item(`ba-${term}`, { uf: "BA", valor: 900_000 })], { haMais: true });
      },
    };
    const result = await buildRaioX("11222333000181", deps, NOW);
    expect(result.abrangencia).toBe("uf");
    expect(result.abertas).toEqual({ quantidade: 1, haMais: false, valorTotal: 100_000, exclusivasMeEpp: 0 });
    expect(result.oportunidades.map((o) => o.id)).toEqual(["sp-1", "ba-material de limpeza", "ba-produtos de higiene"]);
    expect(result.complementoNacional).toBe(true);
  });

  it("fala do Brasil quando a UF não tem nada", async () => {
    const deps: RaioXDeps = {
      getEmpresa: async () => empresa,
      searchOpen: async (term, uf) => found(uf ? [] : [item(`br-${term}`, { uf: "BA" })]),
    };
    const result = await buildRaioX("11222333000181", deps, NOW);
    expect(result.abrangencia).toBe("brasil");
    expect(result.abertas.quantidade).toBe(2);
    expect(result.complementoNacional).toBe(false);
  });

  it("não busca no Brasil quando a busca da UF falhou em parte, e marca como parcial", async () => {
    const calls: (string | undefined)[] = [];
    const deps: RaioXDeps = {
      getEmpresa: async () => empresa,
      searchOpen: async (term, uf) => {
        calls.push(uf);
        if (term === "produtos de higiene") throw new SourceError("PNCP", 503, "x");
        return found([]);
      },
    };
    const result = await buildRaioX("11222333000181", deps, NOW);
    expect(calls.every((uf) => uf === "SP")).toBe(true);
    expect(result.parcial).toBe(true);
    expect(result.abrangencia).toBe("uf");
  });

  it("empresa de porte Demais não vê a faixa reservada a ME/EPP", async () => {
    const grande = { ...empresa, porte: "Demais" as const };
    const deps: RaioXDeps = {
      getEmpresa: async () => grande,
      searchOpen: async () =>
        found([item("faixa", { valor: 50_000, faixaMeEpp: true }), ...["a", "b", "c", "d", "e"].map((id) => item(id))]),
    };
    const result = await buildRaioX("11222333000181", deps, NOW);
    expect(result.oportunidades.some((o) => o.id === "faixa")).toBe(false);
    expect(result.abertas.quantidade).toBe(5);
    expect(result.abertas.exclusivasMeEpp).toBe(1);
  });

  it("devolve vazio, sem erro, quando não há licitação", async () => {
    const deps: RaioXDeps = { getEmpresa: async () => empresa, searchOpen: async () => found([]) };
    const result = await buildRaioX("11222333000181", deps, NOW);
    expect(result.oportunidades).toEqual([]);
    expect(result.abertas.quantidade).toBe(0);
  });

  it("explica quando o CNPJ não existe e quando as fontes caem", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const missing: RaioXDeps = {
      getEmpresa: async () => {
        throw new SourceError("Receita", 404, "x");
      },
      searchOpen: async () => found([]),
    };
    await expect(buildRaioX("11222333000181", missing, NOW)).rejects.toEqual(new RaioXFailure(404, MESSAGES.naoEncontrado));
    await expect(buildRaioX("12ABC34501DE35", missing, NOW)).rejects.toEqual(
      new RaioXFailure(404, MESSAGES.naoEncontradoAlfanumerico),
    );

    const pncpDown: RaioXDeps = {
      getEmpresa: async () => empresa,
      searchOpen: async () => {
        throw new SourceError("PNCP", 503, "x");
      },
    };
    await expect(buildRaioX("1", pncpDown, NOW)).rejects.toMatchObject({ status: 502, message: MESSAGES.pncpFora });
  });

  it("põe na frente o que é perto, na faixa ME/EPP e com prazo", () => {
    const ranked = rank(
      [
        item("grande-longe", { uf: "RJ", valor: 2_000_000 }),
        item("faixa", { uf: "SP", valor: 60_000, faixaMeEpp: true }),
        item("cidade", { uf: "SP", municipio: "Campinas", valor: 300_000 }),
      ],
      { uf: "SP", municipio: "CAMPINAS", porte: "EPP" },
      NOW,
    );
    expect(ranked.map((o) => o.id)).toEqual(["cidade", "faixa", "grande-longe"]);
  });
});

describe("nomes", () => {
  it("arruma a caixa sem estragar siglas e tira o CNPJ do nome de MEI", () => {
    expect(titleCase("J.R. COMERCIO DE ALIMENTOS LTDA.")).toBe("J.R. Comercio de Alimentos LTDA.");
    expect(titleCase("12.345.678 JOAO DA SILVA")).toBe("Joao da Silva");
    expect(titleOrgao("UNIVERSIDADE FEDERAL - UFRGS")).toBe("Universidade Federal - Ufrgs");
    expect(titleOrgao("SECRETARIA DE SAUDE SES/SP")).toBe("Secretaria de Saude Ses/SP");
    expect(titleOrgao("Prefeitura de Jundiaí")).toBe("Prefeitura de Jundiaí");
  });
});

describe("busca do PNCP com campos desconhecidos", () => {
  it("usa a API de consulta em vez de devolver vazio", async () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn(async (url: string) =>
      url.includes("/api/search/")
        ? jsonResponse({ items: [{ outroCampo: "x", objetoNovo: "material de limpeza" }], total: 1 })
        : jsonResponse(consultaResponse),
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await searchOpen("material de limpeza", "PR");
    vi.useRealTimers();
    expect(result.items.map((item) => item.id)).toEqual(["99000000000100-1-000044/2026"]);
  });
});

describe("PNCP: filtro por termo e limite de pedidos", () => {
  it("descarta o que a busca devolve sem mencionar o termo", async () => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
    const construcao = { ...searchResponse.items[0], numero_controle_pncp: "x-1", description: "Aquisição de material de construção" };
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ items: [searchResponse.items[0], construcao], total: 2 })));
    const result = await searchOpen("material de limpeza", "GO");
    vi.useRealTimers();
    expect(result.items.map((item) => item.id)).toEqual(["46000000000100-1-000012/2026"]);
  });

  it("depois de um 429 não usa a reserva e para de chamar o PNCP por um minuto", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ message: "Too Many Requests" }, 429));
    vi.stubGlobal("fetch", fetchMock);
    await expect(searchOpen("termo ocupado", "MT")).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(searchOpen("outro termo", "MT")).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
