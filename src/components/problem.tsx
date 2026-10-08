import { CalendarX2, FileStack, Radar } from "lucide-react";

import { Highlight } from "@/components/highlight";

const problems = [
  {
    icon: Radar,
    title: "A oportunidade passa",
    text: "São milhares de processos por dia, e você vê só o que o boletim mandou.",
  },
  {
    icon: FileStack,
    title: "Ninguém lê o edital inteiro",
    text: "São dezenas de páginas, prazos curtos e uma cláusula escondida que desclassifica.",
  },
  {
    icon: CalendarX2,
    title: "O documento vence",
    text: "Uma certidão vencida e o melhor preço do pregão vai para o segundo colocado.",
  },
];

export function Problem() {
  return (
    <section aria-labelledby="problema-titulo" className="py-20 md:py-28">
      <div className="container-lg">
        <h2 id="problema-titulo" className="titulo-secao max-w-3xl">
          Por que a pequena empresa <Highlight>perde licitação</Highlight>
        </h2>

        <ol className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-6">
          {problems.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="folha flex flex-col p-6 md:p-8">
              <div className="flex items-center justify-between">
                <Icon aria-hidden className="size-7 text-risco-escuro" strokeWidth={1.5} />
                <span aria-hidden className="numero text-sm text-grafite">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-2xl leading-tight font-semibold">{title}</h3>
              <p className="mt-3 text-base text-grafite md:text-[17px]">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
