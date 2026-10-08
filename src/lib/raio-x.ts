import { cleanCnpj } from "./cnpj";

export type Participacao = "exclusiva" | "cota" | "ampla";

export type Oportunidade = {
  id: string;
  orgao: string;
  objeto: string;
  modalidade: string;
  valor: number;
  participacao: Participacao;
  notaLance: number;
  recomendacao: "vai" | "nao-vai";
  diasParaSessao: number;
  motivo: string;
};

export type RaioXResult = {
  cnpj: string;
  /** true enquanto o resultado vier do mock, e não da API. */
  exemplo: boolean;
  perfil: {
    cnae: string;
    descricaoCnae: string;
    porte: "MEI" | "ME" | "EPP" | "Demais";
  };
  abertas: {
    quantidade: number;
    valorTotal: number;
    exclusivasMeEpp: number;
  };
  ultimas4Semanas: {
    quantidade: number;
    valorTotal: number;
  };
  oportunidades: Oportunidade[];
};

/**
 * Endpoint do Raio-X. Sem ele, fetchRaioX devolve o resultado de exemplo.
 * Ex.: NEXT_PUBLIC_RAIOX_API_URL=/api/raio-x
 * Contrato: POST { cnpj: "12ABC34501DE35" } → RaioXResult (com exemplo: false).
 */
const API_URL = process.env.NEXT_PUBLIC_RAIOX_API_URL;

const MOCK_DELAY_MS = 2000;

const cache = new Map<string, Promise<RaioXResult>>();

/**
 * Busca o Raio-X de um CNPJ. O resultado fica em memória para o formulário
 * e a página /raio-x compartilharem a mesma requisição.
 */
export function fetchRaioX(cnpj: string): Promise<RaioXResult> {
  const key = cleanCnpj(cnpj);
  const cached = cache.get(key);
  if (cached) return cached;

  const request = (API_URL ? requestApi(API_URL, key) : mockRaioX(key)).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, request);
  return request;
}

async function requestApi(url: string, cnpj: string): Promise<RaioXResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cnpj }),
  });
  if (!response.ok) {
    throw new Error(`Raio-X respondeu ${response.status}`);
  }
  return response.json();
}

async function mockRaioX(cnpj: string): Promise<RaioXResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return { ...EXEMPLO, cnpj };
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
