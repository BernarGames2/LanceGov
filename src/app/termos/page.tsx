import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Termos de uso da LanceGov.",
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de uso"
      intro={`Estes termos regem o uso do site e da plataforma LanceGov, oferecidos por ${site.legalName}, CNPJ ${site.cnpj}, com sede em ${site.cidadeUf}.`}
      sections={[
        {
          title: "O serviço",
          paragraphs: [
            "A LanceGov monitora licitações públicas, lê editais com inteligência artificial, confere documentos e envia alertas.",
            "A LanceGov não participa de licitações em nome do cliente. A decisão de participar, a proposta e os lances são sempre do cliente, nos portais oficiais.",
          ],
        },
        {
          title: "Uso da inteligência artificial",
          paragraphs: [
            "As análises são feitas por IA e podem conter erros. Cada resposta indica a página do edital de onde saiu e deve ser conferida antes de qualquer decisão.",
          ],
        },
        {
          title: "Conta e acesso",
          paragraphs: ["[Regras de cadastro, responsabilidade pelas credenciais e usuários adicionais.]"],
        },
        {
          title: "Planos, pagamento e cancelamento",
          paragraphs: [
            "Os planos são mensais e sem fidelidade, pagos por Pix, boleto ou cartão. O plano anual cobra 10 meses e libera 12.",
            "[Condições da garantia de 14 dias, reembolso e reajuste.]",
          ],
        },
        {
          title: "Responsabilidades",
          paragraphs: ["[Limites de responsabilidade, disponibilidade do serviço e uso permitido.]"],
        },
        {
          title: "Propriedade intelectual",
          paragraphs: ["[Marca, software e conteúdos da LanceGov. Dados públicos seguem com suas fontes oficiais.]"],
        },
        {
          title: "Alterações e contato",
          paragraphs: [
            `Avisaremos mudanças relevantes com antecedência. Dúvidas: ${site.contact.email}.`,
            "[Foro e legislação aplicável.]",
          ],
        },
      ]}
    />
  );
}
