import { cleanCnpj } from "./cnpj";

export type Participacao = "exclusiva" | "cota" | "ampla";

export type Porte = "MEI" | "ME" | "EPP" | "Demais" | "Não informado";

export type Oportunidade = {
  id: string;
  orgao: string;
  municipio?: string;
  uf?: string;
  objeto: string;
  modalidade: string;
  /** Valor estimado em reais. null quando sigiloso ou não informado. */
  valor: number | null;
  /** Benefício ME/EPP, quando conhecido (exemplos). */
  participacao?: Participacao;
  /** Valor até R$ 80 mil: em regra, disputa exclusiva para ME/EPP (LC 123, art. 48). */
  faixaMeEpp?: boolean;
  /** Nota Lance e recomendação: só depois que a IA lê o edital. */
  notaLance?: number;
  recomendacao?: "vai" | "nao-vai";
  motivo?: string;
  /** Dias até a sessão (exemplos). */
  diasParaSessao?: number;
  /** Fim do recebimento de propostas (ISO), quando o PNCP informa. */
  encerramento?: string;
  /** Página da licitação no PNCP. */
  url?: string;
};

export type RaioXResult = {
  cnpj: string;
  /** true para o resultado ilustrativo usado no site; os dados reais vêm com false. */
  exemplo: boolean;
  empresa?: {
    nome: string;
    uf?: string;
    municipio?: string;
    /** Situação cadastral na Receita (ATIVA, BAIXADA...). */
    situacao?: string;
  };
  perfil: {
    cnae: string;
    descricaoCnae: string;
    porte: Porte;
  };
  abertas: {
    quantidade: number;
    /** true quando o PNCP tem mais resultados do que os consultados. */
    haMais?: boolean;
    valorTotal: number;
    exclusivasMeEpp: number;
  };
  /** Licitações que passaram nas últimas 4 semanas (ainda não calculado com dados reais). */
  ultimas4Semanas: {
    quantidade: number;
    valorTotal: number;
  } | null;
  oportunidades: Oportunidade[];
  /** Termos usados na busca, derivados dos CNAEs. */
  termos?: string[];
  /** Onde a busca foi feita: a UF da empresa ou o Brasil todo. */
  abrangencia?: "uf" | "brasil";
  consultadoEm?: string;
};

/** Erro com mensagem pronta para mostrar ao visitante. */
export class RaioXError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "RaioXError";
  }
}

/**
 * Endpoint do Raio-X: a rota do próprio site (app/api/raio-x) por padrão.
 * Contrato: POST { cnpj: "12ABC34501DE35" } → RaioXResult, ou { message } com status de erro.
 */
const API_URL = process.env.NEXT_PUBLIC_RAIOX_API_URL || "/api/raio-x";

const GENERIC_ERROR = "Não deu para fazer o Raio-X agora. Tente de novo em instantes.";

const cache = new Map<string, Promise<RaioXResult>>();
const failed = new Set<string>();

/**
 * Busca o Raio-X de um CNPJ. O resultado fica em memória para o formulário
 * e a página /raio-x compartilharem a mesma requisição. Uma falha também fica
 * guardada (senão a página pediria de novo a cada renderização) até alguém
 * pedir outra tentativa com `retry` ou forgetRaioXFailures().
 */
export function fetchRaioX(cnpj: string, { retry = false } = {}): Promise<RaioXResult> {
  const key = cleanCnpj(cnpj);
  if (retry && failed.has(key)) {
    cache.delete(key);
    failed.delete(key);
  }
  const cached = cache.get(key);
  if (cached) return cached;

  const request = requestApi(API_URL, key).catch((error) => {
    failed.add(key);
    throw error;
  });
  cache.set(key, request);
  return request;
}

/** Libera nova tentativa para os CNPJs que falharam (botão "Tentar de novo"). */
export function forgetRaioXFailures() {
  for (const key of failed) cache.delete(key);
  failed.clear();
}

async function requestApi(url: string, cnpj: string): Promise<RaioXResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnpj }),
    });
  } catch {
    throw new RaioXError("Sem conexão com a LanceGov. Confira a internet e tente de novo.", 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : GENERIC_ERROR;
    throw new RaioXError(message, response.status);
  }
  return data as RaioXResult;
}

export const EXEMPLO: RaioXResult = {
  cnpj: "",
  exemplo: true,
  perfil: {
    cnae: "4649-4/08",
    descricaoCnae: "Comércio atacadista de produtos de higiene, limpeza e conservação domiciliar",
    porte: "EPP",
  },
  abertas: {
    quantidade: 41,
    valorTotal: 3_870_000,
    exclusivasMeEpp: 17,
  },
  ultimas4Semanas: {
    quantidade: 63,
    valorTotal: 5_240_000,
  },
  oportunidades: [
    {
      id: "exemplo-1",
      orgao: "Prefeitura de [Município]",
      objeto: "Material de limpeza",
      modalidade: "Pregão eletrônico",
      valor: 184_000,
      participacao: "exclusiva",
      notaLance: 87,
      recomendacao: "vai",
      diasParaSessao: 12,
      motivo: "Itens no seu CNAE, valor dentro do que você já fornece e só 2 documentos pendentes.",
    },
    {
      id: "exemplo-2",
      orgao: "Secretaria Estadual de Saúde",
      objeto: "Papel toalha, copos descartáveis e sacos de lixo",
      modalidade: "Pregão eletrônico",
      valor: 76_500,
      participacao: "exclusiva",
      notaLance: 81,
      recomendacao: "vai",
      diasParaSessao: 9,
      motivo: "Disputa só entre ME/EPP, com entrega na sua região.",
    },
    {
      id: "exemplo-3",
      orgao: "Instituto Federal",
      objeto: "Saneantes e material de higiene para os campi",
      modalidade: "Pregão eletrônico · registro de preços",
      valor: 312_000,
      participacao: "cota",
      notaLance: 74,
      recomendacao: "vai",
      diasParaSessao: 15,
      motivo: "Ata válida por 12 meses, e a cota reservada diminui a concorrência.",
    },
    {
      id: "exemplo-4",
      orgao: "Câmara Municipal",
      objeto: "Produtos de limpeza e copa",
      modalidade: "Dispensa eletrônica",
      valor: 18_900,
      participacao: "exclusiva",
      notaLance: 58,
      recomendacao: "nao-vai",
      diasParaSessao: 4,
      motivo: "Valor baixo e entrega em 5 dias: a margem fica apertada.",
    },
    {
      id: "exemplo-5",
      orgao: "Hospital Universitário",
      objeto: "Saneantes de uso hospitalar",
      modalidade: "Pregão eletrônico",
      valor: 540_000,
      participacao: "ampla",
      notaLance: 36,
      recomendacao: "nao-vai",
      diasParaSessao: 21,
      motivo: "Exige autorização da Anvisa para saneante hospitalar, que não está no seu cofre.",
    },
  ],
};
