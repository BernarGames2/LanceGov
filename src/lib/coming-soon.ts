/**
 * Páginas do menu e do rodapé que ainda não existem. Cada uma tem um arquivo
 * em app/(em-breve)/<slug>/page.tsx que mostra um "em breve" com o Raio-X.
 * Ao criar a página de verdade, troque esse arquivo e apague a entrada daqui.
 */
export const comingSoonPages = {
  entrar: {
    title: "Entrar",
    description: "As primeiras contas abrem em breve. Enquanto isso, faça o Raio-X grátis do seu CNPJ.",
  },
  "para-assessorias": {
    title: "Para assessorias",
    description: "Até 15 CNPJs, 10 usuários e relatórios com a sua marca. A página completa está chegando.",
  },
  "para-empresas": {
    title: "Para empresas",
    description: "Usuários ilimitados, API, login único e gerente de conta. A página completa está chegando.",
  },
  blog: {
    title: "Blog",
    description: "Guias práticos para vender ao governo, por setor e por tipo de órgão.",
  },
  glossario: {
    title: "Glossário de licitações",
    description: "Os termos do edital explicados em português simples.",
  },
  "calendario-de-licitacoes": {
    title: "Calendário de licitações",
    description: "Sessões e prazos das licitações abertas, por setor e região.",
  },
  "calculadora-de-preco": {
    title: "Calculadora de preço",
    description: "Preço e margem da sua proposta, já com CBS e IBS da reforma tributária.",
  },
  "modelos-de-documentos": {
    title: "Modelos de documentos",
    description: "Declarações, pedidos de esclarecimento e impugnação prontos para adaptar.",
  },
  sobre: {
    title: "Sobre a LanceGov",
    description: "A IA que encontra, lê e prepara as licitações que sua empresa pode vencer.",
  },
  parceiros: {
    title: "Parceiros",
    description: "Programa para escritórios de contabilidade, consultores e associações.",
  },
  carreiras: {
    title: "Carreiras",
    description: "Vagas para quem quer ajudar pequenas empresas a vender para o governo.",
  },
  imprensa: {
    title: "Imprensa",
    description: "Kit de imprensa e o Termômetro das Compras Públicas.",
  },
  contato: {
    title: "Contato",
    description: "Fale com a gente pelo e-mail abaixo.",
  },
  "encarregado-de-dados": {
    title: "Encarregado de dados (LGPD)",
    description: "Pedidos sobre dados pessoais podem ser enviados pelo e-mail abaixo.",
  },
  status: {
    title: "Status do sistema",
    description: "Disponibilidade da plataforma, do radar e dos alertas no WhatsApp.",
  },
} satisfies Record<string, { title: string; description: string }>;

export type ComingSoonSlug = keyof typeof comingSoonPages;
