/**
 * Transforma as atividades (CNAE) da empresa em termos de busca de licitação.
 * Os editais descrevem o objeto com palavras de compra ("material de limpeza"),
 * não com o nome da atividade ("comércio atacadista de produtos de higiene"),
 * por isso as atividades mais comuns nas compras públicas têm termos próprios.
 * As demais caem numa extração simples a partir da descrição do CNAE.
 */

type Rule = { prefix: string; terms: string[] };

/** Prefixo do código CNAE (só dígitos). O prefixo mais longo vence. */
const RULES: Rule[] = [
  // Limpeza e higiene
  { prefix: "4649408", terms: ["material de limpeza", "produtos de higiene"] },
  { prefix: "4789005", terms: ["material de limpeza", "saneantes"] },
  { prefix: "206", terms: ["material de limpeza", "saneantes"] },
  { prefix: "1742", terms: ["papel higiênico", "papel toalha"] },
  { prefix: "8121", terms: ["serviço de limpeza", "limpeza e conservação"] },
  { prefix: "8129", terms: ["limpeza e conservação"] },
  { prefix: "8122", terms: ["dedetização", "controle de pragas"] },
  // Escritório, papelaria e gráfica
  { prefix: "4647801", terms: ["material de expediente", "material de escritório"] },
  { prefix: "4761003", terms: ["material de expediente", "material de escritório"] },
  { prefix: "4761001", terms: ["livros"] },
  { prefix: "1813", terms: ["serviços gráficos", "impressão gráfica"] },
  { prefix: "1821", terms: ["serviços gráficos", "impressão gráfica"] },
  // Informática e tecnologia
  { prefix: "4651", terms: ["equipamentos de informática", "suprimentos de informática"] },
  { prefix: "4751", terms: ["equipamentos de informática", "suprimentos de informática"] },
  { prefix: "4752", terms: ["equipamentos de telefonia"] },
  { prefix: "9511", terms: ["manutenção de computadores", "equipamentos de informática"] },
  { prefix: "620", terms: ["software", "sistema de gestão"] },
  { prefix: "6311", terms: ["hospedagem", "software"] },
  { prefix: "6190", terms: ["internet", "link de dados"] },
  { prefix: "6110", terms: ["internet", "telefonia"] },
  // Saúde
  { prefix: "4644", terms: ["medicamentos"] },
  { prefix: "4771", terms: ["medicamentos"] },
  { prefix: "4645", terms: ["material médico hospitalar", "insumos hospitalares"] },
  { prefix: "4664", terms: ["equipamentos médicos", "equipamentos hospitalares"] },
  { prefix: "325", terms: ["material médico hospitalar", "material odontológico"] },
  { prefix: "4773", terms: ["material médico hospitalar"] },
  { prefix: "4774", terms: ["óculos", "material óptico"] },
  { prefix: "8630", terms: ["serviços médicos", "plantão médico"] },
  { prefix: "8640202", terms: ["exames laboratoriais"] },
  { prefix: "8640", terms: ["exames", "diagnóstico por imagem"] },
  // Alimentação
  { prefix: "5620", terms: ["fornecimento de refeições", "alimentação"] },
  { prefix: "5611", terms: ["fornecimento de refeições", "lanches"] },
  { prefix: "4639", terms: ["gêneros alimentícios", "merenda escolar"] },
  { prefix: "4637", terms: ["gêneros alimentícios"] },
  { prefix: "4633", terms: ["hortifrutigranjeiros", "gêneros alimentícios"] },
  { prefix: "4634", terms: ["carnes", "gêneros alimentícios"] },
  { prefix: "4631", terms: ["laticínios", "gêneros alimentícios"] },
  { prefix: "4711", terms: ["gêneros alimentícios"] },
  { prefix: "4712", terms: ["gêneros alimentícios"] },
  { prefix: "4721", terms: ["pães", "gêneros alimentícios"] },
  { prefix: "4722", terms: ["carnes", "gêneros alimentícios"] },
  { prefix: "4724", terms: ["hortifrutigranjeiros"] },
  { prefix: "4729", terms: ["gêneros alimentícios"] },
  { prefix: "4723", terms: ["água mineral", "bebidas"] },
  { prefix: "1091", terms: ["pães", "gêneros alimentícios"] },
  // Vestuário e uniformes
  { prefix: "141", terms: ["uniformes", "fardamento"] },
  { prefix: "4642", terms: ["uniformes", "fardamento"] },
  { prefix: "4781", terms: ["uniformes", "fardamento"] },
  { prefix: "4782", terms: ["calçados", "uniformes"] },
  { prefix: "4643", terms: ["calçados", "uniformes"] },
  // Móveis e eletrodomésticos
  { prefix: "310", terms: ["mobiliário", "móveis"] },
  { prefix: "4754", terms: ["mobiliário", "móveis"] },
  { prefix: "4649404", terms: ["mobiliário", "móveis"] },
  { prefix: "4649401", terms: ["eletrodomésticos", "eletroeletrônicos"] },
  { prefix: "4753", terms: ["eletrodomésticos", "eletroeletrônicos"] },
  { prefix: "4757", terms: ["eletrodomésticos"] },
  // Construção, manutenção e materiais
  { prefix: "412", terms: ["obra", "construção"] },
  { prefix: "421", terms: ["pavimentação", "obra"] },
  { prefix: "422", terms: ["obra", "saneamento"] },
  { prefix: "429", terms: ["obra", "construção"] },
  { prefix: "431", terms: ["terraplenagem", "obra"] },
  { prefix: "4321", terms: ["instalações elétricas", "manutenção elétrica"] },
  { prefix: "4322", terms: ["manutenção hidráulica", "ar condicionado"] },
  { prefix: "4329", terms: ["manutenção predial"] },
  { prefix: "433", terms: ["reforma", "pintura"] },
  { prefix: "439", terms: ["reforma", "obra"] },
  { prefix: "8111", terms: ["manutenção predial"] },
  { prefix: "4744", terms: ["material de construção"] },
  { prefix: "4679", terms: ["material de construção"] },
  { prefix: "4742", terms: ["material elétrico"] },
  { prefix: "4673", terms: ["material elétrico"] },
  { prefix: "4672", terms: ["ferramentas", "ferragens"] },
  { prefix: "4743", terms: ["vidros"] },
  { prefix: "4741", terms: ["tintas"] },
  // Veículos, transporte e combustível
  { prefix: "4520", terms: ["manutenção de veículos"] },
  { prefix: "453", terms: ["peças automotivas", "autopeças"] },
  { prefix: "4511", terms: ["aquisição de veículos"] },
  { prefix: "7711", terms: ["locação de veículos"] },
  { prefix: "4923", terms: ["locação de veículos", "transporte"] },
  { prefix: "4924", terms: ["transporte escolar"] },
  { prefix: "4929", terms: ["transporte"] },
  { prefix: "4930", terms: ["transporte", "frete"] },
  { prefix: "4731", terms: ["combustível"] },
  { prefix: "4681", terms: ["combustível"] },
  { prefix: "4732", terms: ["lubrificantes"] },
  // Segurança, eventos, comunicação e serviços
  { prefix: "8011", terms: ["vigilância", "segurança patrimonial"] },
  { prefix: "8020", terms: ["monitoramento eletrônico"] },
  { prefix: "8230", terms: ["eventos"] },
  { prefix: "7311", terms: ["publicidade", "comunicação"] },
  { prefix: "7319", terms: ["publicidade", "comunicação"] },
  { prefix: "7020", terms: ["consultoria", "assessoria"] },
  { prefix: "6911", terms: ["serviços advocatícios", "assessoria jurídica"] },
  { prefix: "6920", terms: ["serviços contábeis", "assessoria contábil"] },
  { prefix: "7112", terms: ["serviços de engenharia", "projeto"] },
  { prefix: "7119", terms: ["topografia", "serviços de engenharia"] },
  { prefix: "8599", terms: ["capacitação", "curso"] },
  { prefix: "8593", terms: ["curso", "capacitação"] },
  { prefix: "7810", terms: ["mão de obra", "terceirização"] },
  { prefix: "7820", terms: ["mão de obra temporária"] },
  { prefix: "8211", terms: ["apoio administrativo"] },
  { prefix: "8219", terms: ["cópias", "reprografia"] },
  // Meio ambiente e áreas verdes
  { prefix: "381", terms: ["coleta de resíduos", "resíduos sólidos"] },
  { prefix: "382", terms: ["resíduos sólidos", "destinação de resíduos"] },
  { prefix: "8130", terms: ["roçagem", "jardinagem"] },
  { prefix: "0161", terms: ["roçagem", "jardinagem"] },
  // Outros comuns
  { prefix: "4763601", terms: ["brinquedos", "material pedagógico"] },
  { prefix: "4763602", terms: ["material esportivo"] },
  { prefix: "4755", terms: ["tecidos", "cama mesa e banho"] },
  { prefix: "4759", terms: ["utensílios domésticos"] },
  { prefix: "4789", terms: ["materiais diversos"] },
  { prefix: "4686", terms: ["embalagens"] },
  { prefix: "4689", terms: ["materiais diversos"] },
  { prefix: "3321", terms: ["manutenção de máquinas"] },
  { prefix: "3314", terms: ["manutenção de máquinas", "manutenção de equipamentos"] },
  { prefix: "9529", terms: ["manutenção de equipamentos"] },
];

const SORTED_RULES = [...RULES].sort((a, b) => b.prefix.length - a.prefix.length);

/** Palavras que não ajudam a achar o objeto da compra. */
const STOPWORDS = new Set(
  [
    "a", "à", "às", "ao", "aos", "as", "com", "da", "das", "de", "do", "dos", "e", "em", "na", "nas", "no",
    "nos", "o", "os", "ou", "para", "por", "sem", "uso", "tipo", "geral", "gerais", "outros", "outras",
    "outro", "outra", "não", "especificados", "especificadas", "especificado", "especificada",
    "anteriormente", "exceto", "predominância", "predominantemente", "comércio", "atacadista", "varejista",
    "fabricação", "fabricante", "serviços", "serviço", "atividades", "atividade", "produtos", "produto",
    "artigos", "artigo", "mercadorias", "similares", "partes", "peças", "acessórios", "atacado", "varejo",
    "industrial", "comercial", "doméstico", "doméstica", "domésticos", "pessoal", "especializado",
    "especializada", "prestação", "representantes", "agentes", "intermediação", "fins", "terceiros",
  ].map(normalizeText),
);

/** Minúsculas e sem acento, para comparar textos. */
export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** 4649408 → "4649-4/08". */
export function formatCnae(code: string | number) {
  const digits = String(code).replace(/\D/g, "").padStart(7, "0");
  return `${digits.slice(0, 4)}-${digits.slice(4, 5)}/${digits.slice(5, 7)}`;
}

/** Termos de busca para uma atividade. */
export function termsForCnae(code: string | number, descricao = ""): string[] {
  const digits = String(code).replace(/\D/g, "").padStart(7, "0");
  const rule = SORTED_RULES.find((r) => digits.startsWith(r.prefix));
  if (rule) return rule.terms;

  const words = descricao
    .split(/[^\p{L}]+/u)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(normalizeText(word)))
    .map((word) => word.toLowerCase());
  return words.length > 0 ? [words.slice(0, 2).join(" ")] : [];
}

/**
 * Termos de busca da empresa, da atividade principal para as secundárias,
 * sem repetição. Atividades sem código (0) são ignoradas.
 */
export function searchTerms(cnaes: { codigo: string | number; descricao?: string }[], max = 3) {
  const terms: string[] = [];
  const seen = new Set<string>();
  // Primeiro o termo principal de cada atividade, depois os complementares.
  const perCnae = cnaes
    .filter((cnae) => Number(String(cnae.codigo).replace(/\D/g, "")) > 0)
    .map((cnae) => termsForCnae(cnae.codigo, cnae.descricao));
  const rounds = Math.max(0, ...perCnae.map((list) => list.length));
  for (let round = 0; round < rounds && terms.length < max; round++) {
    for (const list of perCnae) {
      const term = list[round];
      if (!term) continue;
      const key = normalizeText(term);
      if (seen.has(key)) continue;
      seen.add(key);
      terms.push(term);
      if (terms.length >= max) break;
    }
  }
  return terms;
}

/** Palavras significativas de um termo, para conferir se aparecem no objeto. */
export function termTokens(term: string) {
  return normalizeText(term)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

/** O objeto da licitação menciona todas as palavras significativas do termo? */
export function matchesTerm(objeto: string, term: string) {
  const text = normalizeText(objeto);
  const tokens = termTokens(term);
  return tokens.length > 0 && tokens.every((token) => text.includes(token));
}
