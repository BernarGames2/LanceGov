import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a LanceGov trata dados pessoais, de acordo com a LGPD.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      intro={`Esta política explica como ${site.legalName} trata dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018).`}
      sections={[
        {
          title: "Controlador e encarregado",
          paragraphs: [
            `Controlador: ${site.legalName}, CNPJ ${site.cnpj}, ${site.cidadeUf}.`,
            "[Nome e e-mail do encarregado de dados (DPO).]",
          ],
        },
        {
          title: "Dados que tratamos",
          paragraphs: [
            "CNPJ e dados cadastrais públicos da empresa; nome, e-mail e WhatsApp de quem cria a conta; documentos de habilitação enviados ao cofre; e, com consentimento, dados de navegação no site.",
          ],
        },
        {
          title: "Para que usamos e base legal",
          paragraphs: [
            "[Finalidades e bases legais: execução do contrato, legítimo interesse, cumprimento de obrigação legal e consentimento para análise de navegação e mensagens no WhatsApp.]",
          ],
        },
        {
          title: "Compartilhamento",
          paragraphs: [
            "[Operadores: hospedagem em nuvem, provedor de IA, provedor oficial do WhatsApp Business e meio de pagamento. Não vendemos dados pessoais.]",
          ],
        },
        {
          title: "Cookies",
          paragraphs: [
            "Usamos cookies essenciais para o site funcionar. Cookies de análise só são usados com o seu consentimento, que você pode mudar a qualquer momento em “Preferências de cookies”, no rodapé.",
          ],
        },
        {
          title: "Seus direitos",
          paragraphs: [
            "Você pode pedir confirmação e acesso aos dados, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação do consentimento (art. 18 da LGPD).",
          ],
        },
        {
          title: "Segurança e retenção",
          paragraphs: [
            "Documentos ficam criptografados e acessíveis só para quem a empresa autorizar. Você apaga tudo quando quiser.",
            "[Prazos de retenção por tipo de dado.]",
          ],
        },
        {
          title: "Contato",
          paragraphs: [`Pedidos sobre dados pessoais: ${site.contact.email}.`],
        },
      ]}
    />
  );
}
