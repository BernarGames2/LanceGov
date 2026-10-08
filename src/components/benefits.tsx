import { BadgePercent, FilePen, FileSearch, MessageCircle, Radar, ShieldCheck } from "lucide-react";

import { Highlight } from "@/components/highlight";

const benefits = [
  {
    icon: Radar,
    title: "Só o que tem a sua cara",
    text: "Radar por CNAE, produto e região, com as disputas exclusivas para ME/EPP em destaque.",
  },
  {
    icon: FileSearch,
    title: "Edital entendido em 1 minuto",
    text: "Resumo, exigências, prazos e riscos, cada um com a página de onde saiu.",
  },
  {
    icon: ShieldCheck,
    title: "Zero susto na habilitação",
    text: "O cofre confere cada edital e avisa o que falta e o que vence antes da sessão.",
  },
  {
    icon: BadgePercent,
    title: "Preço para vencer com margem",
    text: "Veja quanto o governo pagou em compras parecidas e quanto sobra para você.",
  },
  {
    icon: MessageCircle,
    title: "Tudo no WhatsApp",
    text: "Alertas, lembretes e perguntas sobre o edital sem abrir o computador.",
  },
  {
    icon: FilePen,
    title: "Documentos em minutos",
    text: "Proposta, declarações e pedidos prontos para revisar e enviar.",
  },
];

export function Benefits() {
  return (
    <section aria-labelledby="beneficios-titulo" className="border-t border-linha bg-folha py-20 md:py-28">
      <div className="container-lg">
        <h2 id="beneficios-titulo" className="titulo-secao max-w-3xl">
          O que a LanceGov faz <Highlight>por você</Highlight>
        </h2>

        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 lg:gap-y-12">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span
                aria-hidden
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-linha bg-papel"
              >
                <Icon className="size-6 text-tinta" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-lg leading-snug font-medium">{title}</h3>
                <p className="mt-1.5 text-base text-grafite">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
