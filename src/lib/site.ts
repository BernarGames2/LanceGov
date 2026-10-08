/**
 * Dados da empresa e links. Troque os valores marcados como placeholder
 * antes de publicar.
 */
export const site = {
  name: "LanceGov",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lancegov.com.br",
  title: "LanceGov: IA para licitações | Ganhe mais, leia menos edital",
  description:
    "Encontre licitações para o seu CNPJ, entenda cada edital em 1 minuto e receba alertas no WhatsApp. Faça o Raio-X grátis.",
  legalName: "LanceGov Tecnologia Ltda.",
  // Placeholders até a abertura da empresa.
  cnpj: "[a definir]",
  cidadeUf: "[Cidade/UF]",
  contact: {
    email: "contato@lancegov.com.br",
    // Número no formato internacional, só dígitos (ex.: "5511999999999").
    // Enquanto estiver vazio, os links de WhatsApp levam para /contato.
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  },
  social: {
    instagram: "https://www.instagram.com/lancegov",
    linkedin: "https://www.linkedin.com/company/lancegov",
    youtube: "https://www.youtube.com/@lancegov",
    tiktok: "https://www.tiktok.com/@lancegov",
  },
} as const;

export function whatsappUrl(message?: string) {
  if (!site.contact.whatsapp) return "/contato";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.contact.whatsapp}${text}`;
}

/** Destino dos botões de assinatura. Troque quando o cadastro estiver no ar. */
export function signupUrl(params: { plano?: string; ciclo?: string; origem?: string } = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `/entrar?${query}` : "/entrar";
}

export const salesUrl = "/contato";

/** Âncora do formulário de CNPJ no topo da home. */
export const RAIO_X_ANCHOR = "raio-x";

export const navLinks = [
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Planos", href: "/#planos" },
  { label: "Para assessorias", href: "/para-assessorias" },
  { label: "Blog", href: "/blog" },
] as const;

export const footerColumns = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Planos", href: "/#planos" },
      { label: "Raio-X grátis", href: `/#${RAIO_X_ANCHOR}` },
      { label: "Para assessorias", href: "/para-assessorias" },
      { label: "Para empresas", href: "/para-empresas" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Glossário", href: "/glossario" },
      { label: "Calendário de licitações", href: "/calendario-de-licitacoes" },
      { label: "Calculadora de preço", href: "/calculadora-de-preco" },
      { label: "Modelos de documentos", href: "/modelos-de-documentos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Parceiros", href: "/parceiros" },
      { label: "Carreiras", href: "/carreiras" },
      { label: "Imprensa", href: "/imprensa" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "/termos" },
      { label: "Privacidade", href: "/privacidade" },
      { label: "Encarregado de dados", href: "/encarregado-de-dados" },
      { label: "Status", href: "/status" },
    ],
  },
] as const;
