import { TriangleAlert } from "lucide-react";

export type LegalSection = { title: string; paragraphs: string[] };

/** Layout das páginas legais. O texto atual é provisório. */
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main id="conteudo" className="flex-1">
      <article className="container-lg max-w-3xl py-14 md:py-20">
        <h1 className="font-serif text-4xl leading-tight font-semibold md:text-5xl">{title}</h1>
        <p className="mt-6 flex items-start gap-3 rounded-xl border border-prazo/40 bg-prazo/15 px-4 py-3 text-[15px] text-tinta">
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          Texto provisório. A versão final será publicada depois da revisão jurídica.
        </p>
        <p className="mt-8 text-base text-grafite md:text-lg">{intro}</p>

        <ol className="mt-10 flex flex-col gap-10">
          {sections.map((section, index) => (
            <li key={section.title}>
              <h2 className="font-serif text-2xl leading-tight font-semibold">
                <span className="numero mr-2 text-lg text-grafite">{index + 1}.</span>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-base text-grafite md:text-[17px]">
                  {paragraph}
                </p>
              ))}
            </li>
          ))}
        </ol>
      </article>
    </main>
  );
}
