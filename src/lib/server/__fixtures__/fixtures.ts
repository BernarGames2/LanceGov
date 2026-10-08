/** Respostas de exemplo no formato das fontes reais, para os testes. */

export const brasilApiEmpresa = {
  cnpj: "11222333000181",
  razao_social: "DISTRIBUIDORA EXEMPLO DE LIMPEZA LTDA",
  nome_fantasia: "",
  uf: "SP",
  municipio: "CAMPINAS",
  porte: "EMPRESA DE PEQUENO PORTE",
  opcao_pelo_mei: false,
  cnae_fiscal: 4649408,
  cnae_fiscal_descricao: "Comércio atacadista de produtos de higiene, limpeza e conservação domiciliar",
  cnaes_secundarios: [
    { codigo: 4761003, descricao: "Comércio varejista de artigos de papelaria" },
    { codigo: 0, descricao: "" },
  ],
  descricao_situacao_cadastral: "ATIVA",
};

export const cnpjaEmpresa = {
  taxId: "11222333000181",
  alias: null,
  company: {
    name: "DISTRIBUIDORA EXEMPLO DE LIMPEZA LTDA",
    size: { id: 3, acronym: "EPP", text: "Empresa de Pequeno Porte" },
    simei: { optant: false },
  },
  status: { id: 2, text: "Ativa" },
  address: { city: "Campinas", state: "SP" },
  mainActivity: { id: 4649408, text: "Comércio atacadista de produtos de higiene, limpeza e conservação domiciliar" },
  sideActivities: [{ id: 4761003, text: "Comércio varejista de artigos de papelaria" }],
};

export const cnpjWsEmpresa = {
  razao_social: "LIMPEZA SILVA LTDA",
  porte: { id: "01", descricao: "Micro Empresa" },
  simples: { mei: "Não" },
  estabelecimento: {
    nome_fantasia: "LIMPEZA SILVA",
    situacao_cadastral: "Ativa",
    atividade_principal: { id: "4649408", subclasse: "4649-4/08", descricao: "Comércio atacadista de produtos de higiene" },
    atividades_secundarias: [{ id: "4930202", subclasse: "4930-2/02", descricao: "Transporte rodoviário de carga" }],
    estado: { sigla: "SP" },
    cidade: { nome: "Campinas" },
  },
};

export const receitaWsEmpresa = {
  status: "OK",
  nome: "DISTRIBUIDORA EXEMPLO DE LIMPEZA LTDA",
  fantasia: "",
  uf: "SP",
  municipio: "CAMPINAS",
  porte: "EMPRESA DE PEQUENO PORTE",
  situacao: "ATIVA",
  atividade_principal: [{ code: "46.49-4-08", text: "Comércio atacadista de produtos de higiene" }],
  atividades_secundarias: [{ code: "47.61-0-03", text: "Comércio varejista de artigos de papelaria" }],
  simei: { optante: false },
};

export const searchResponse = {
  items: [
    {
      id: "a",
      title: "Edital nº 12/2026",
      description: "Registro de preços para aquisição de material de limpeza e higiene para as escolas municipais",
      item_url: "/editais/46000000000100/2026/12",
      orgao_cnpj: "46000000000100",
      orgao_nome: "MUNICIPIO DE CAMPINAS",
      municipio_nome: "Campinas",
      uf: "SP",
      modalidade_licitacao_nome: "Pregão - Eletrônico",
      valor_global: 184000,
      data_fim_vigencia: "2026-10-20T09:00:00",
      numero_controle_pncp: "46000000000100-1-000012/2026",
      ano: "2026",
      numero_sequencial: "12",
      situacao_nome: "Divulgada no PNCP",
      cancelado: false,
    },
    {
      id: "b",
      title: "Edital nº 3/2026",
      description: "Aquisição de material de limpeza para a Câmara",
      item_url: "/editais/01000000000100/2026/3",
      orgao_cnpj: "01000000000100",
      orgao_nome: "CAMARA MUNICIPAL DE SOROCABA",
      municipio_nome: "Sorocaba",
      uf: "SP",
      modalidade_licitacao_nome: "Dispensa",
      valor_global: 18900,
      data_fim_vigencia: "2026-10-15T23:59:00",
      numero_controle_pncp: "01000000000100-1-000003/2026",
      ano: "2026",
      numero_sequencial: "3",
      situacao_nome: "Divulgada no PNCP",
      cancelado: false,
    },
    {
      id: "c",
      description: "Licitação já encerrada",
      orgao_nome: "MUNICIPIO X",
      uf: "SP",
      valor_global: 1000,
      data_fim_vigencia: "2026-09-01T09:00:00",
      numero_controle_pncp: "old",
    },
  ],
  total: 37,
};

export const consultaResponse = {
  data: [
    {
      numeroControlePNCP: "99000000000100-1-000044/2026",
      anoCompra: 2026,
      sequencialCompra: 44,
      modalidadeNome: "Pregão - Eletrônico",
      objetoCompra: "Aquisição de MATERIAL DE LIMPEZA e copa",
      valorTotalEstimado: 52000.5,
      dataEncerramentoProposta: "2026-10-25T10:00:00",
      orgaoEntidade: { cnpj: "99000000000100", razaoSocial: "MUNICIPIO DE JUNDIAI" },
      unidadeOrgao: { ufSigla: "SP", municipioNome: "Jundiaí", nomeUnidade: "Secretaria de Educação" },
    },
    {
      numeroControlePNCP: "99000000000100-1-000045/2026",
      anoCompra: 2026,
      sequencialCompra: 45,
      modalidadeNome: "Pregão - Eletrônico",
      objetoCompra: "Contratação de serviço de transporte escolar",
      valorTotalEstimado: 900000,
      dataEncerramentoProposta: "2026-10-25T10:00:00",
      orgaoEntidade: { cnpj: "99000000000100", razaoSocial: "MUNICIPIO DE JUNDIAI" },
      unidadeOrgao: { ufSigla: "SP", municipioNome: "Jundiaí" },
    },
  ],
  totalPaginas: 1,
};
