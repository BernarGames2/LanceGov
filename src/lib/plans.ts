export type BillingCycle = "mensal" | "anual";

export type Plan = {
  id: "gratis" | "essencial" | "pro" | "assessoria";
  name: string;
  monthlyPrice: number;
  audience: string;
  features: string[];
  cta: string;
  highlight?: string;
};

export const plans: Plan[] = [
  {
    id: "gratis",
    name: "Grátis",
    monthlyPrice: 0,
    audience: "Para começar",
    features: ["Raio-X do CNPJ", "10 oportunidades por semana", "3 leituras de edital por mês"],
    cta: "Começar grátis",
  },
  {
    id: "essencial",
    name: "Essencial",
    monthlyPrice: 197,
    audience: "Para quem disputa de 1 a 4 licitações por mês",
    features: [
      "Radar ilimitado",
      "20 leituras por mês",
      "Cofre de documentos com alertas",
      "Alertas no WhatsApp",
    ],
    cta: "Assinar Essencial",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 497,
    audience: "Para quem disputa toda semana",
    features: [
      "Leituras ilimitadas",
      "Preço para vencer",
      "Gerador de documentos",
      "Certidões automáticas",
      "3 usuários",
    ],
    cta: "Assinar Pro",
    highlight: "Mais escolhido",
  },
  {
    id: "assessoria",
    name: "Assessoria",
    monthlyPrice: 1497,
    audience: "Para consultores",
    features: ["Até 15 CNPJs", "10 usuários", "Relatórios com a sua marca"],
    cta: "Falar com vendas",
  },
];

export const ENTERPRISE_FROM = 2990;

/** No anual o cliente paga 10 meses e usa 12: mensal × 10 ÷ 12, arredondado. */
export function annualMonthlyPrice(monthlyPrice: number) {
  return Math.round((monthlyPrice * 10) / 12);
}

export function priceFor(plan: Plan, cycle: BillingCycle) {
  return cycle === "anual" ? annualMonthlyPrice(plan.monthlyPrice) : plan.monthlyPrice;
}
