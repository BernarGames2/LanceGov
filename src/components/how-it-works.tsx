import { Highlight } from "@/components/highlight";

const steps = [
  {
    title: "Informe seu CNPJ",
    text: "A LanceGov monta o perfil da empresa com CNAEs, porte e região.",
  },
  {
    title: "Receba as oportunidades certas",
    text: "Cada licitação chega com a Nota Lance, de 0 a 100, e a recomendação: vai ou não vai.",
  },
  {
    title: "Participe preparado",
    text: "Checklist de documentos, prazos no calendário e proposta em rascunho. Você revisa e envia.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="py-20 md:py-28">
      <div className="container-lg">
        <h2 id="como-funciona-titulo" className="titulo-secao max-w-3xl">
          Da descoberta à proposta em <Highlight>3 passos</Highlight>
        </h2>

        <ol className="relative mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden
            className="absolute top-6 right-[16%] left-[16%] hidden border-t border-dashed border-tinta/20 md:block"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
              <span className="numero relative inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-linha bg-folha text-lg text-tinta shadow-folha">
                {index + 1}
              </span>
              <div>
                <h3 className="font-serif text-2xl leading-tight font-semibold md:mt-6">{step.title}</h3>
                <p className="mt-2 text-base text-grafite md:mx-auto md:max-w-xs md:text-[17px]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-14 text-center font-serif text-2xl leading-snug font-semibold text-balance md:mt-20 md:text-3xl">
          “A LanceGov prepara. Você decide e participa.”
        </p>
      </div>
    </section>
  );
}
