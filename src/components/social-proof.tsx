import Image from "next/image";
import { FileSearch, Landmark, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";

import { CountUp } from "@/components/count-up";
import { Highlight } from "@/components/highlight";
import type { SiteStats } from "@/lib/stats";
import type { Testimonial } from "@/lib/testimonials";

export function SocialProof({
  stats,
  testimonials,
}: {
  stats: SiteStats;
  testimonials: Testimonial[];
}) {
  return (
    <section aria-labelledby="prova-titulo" className="py-20 md:py-28">
      <div className="container-lg">
        <h2 id="prova-titulo" className="titulo-secao max-w-3xl">
          Confiança <Highlight>verificável</Highlight>
        </h2>
        <p className="mt-4 max-w-2xl text-base text-grafite md:text-lg">
          Toda resposta mostra a página do edital de onde saiu. E os números abaixo vêm direto da
          nossa base.
        </p>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          <StatTile
            icon={Landmark}
            label="em licitações abertas monitoradas hoje"
            value={stats.valorMonitoradoHoje}
            prefix="R$ "
          />
          <StatTile icon={FileSearch} label="editais lidos pela IA nesta semana" value={stats.editaisLidosSemana} />
          <Specialist />
          <Guarantee />
        </div>

        <Testimonials items={testimonials} />
      </div>
    </section>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  prefix = "",
}: {
  icon: LucideIcon;
  label: string;
  value: number | null;
  prefix?: string;
}) {
  return (
    <div className="folha flex flex-col gap-4 p-6">
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-xl border border-linha bg-papel"
      >
        <Icon className="size-6 text-tinta" strokeWidth={1.5} />
      </span>
      <div>
        <p className="numero text-4xl leading-none text-tinta">
          {value !== null ? (
            <>
              {prefix}
              <CountUp value={value} />
            </>
          ) : (
            <>
              <span aria-hidden>—</span>
              <span className="sr-only">Sem dado ainda</span>
            </>
          )}
        </p>
        <p className="mt-2 text-[15px] text-grafite">{label}</p>
      </div>
      {value === null && (
        <p className="mt-auto inline-flex w-fit items-center gap-2 text-xs font-medium text-grafite">
          <span aria-hidden className="size-2 rounded-full bg-grafite/30" />
          Ao vivo a partir do lançamento
        </p>
      )}
    </div>
  );
}

/** Placeholder: troque pela foto, nome e mini-bio do especialista. */
function Specialist() {
  return (
    <div className="folha flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed border-grafite/40 bg-papel">
          <UserRound aria-hidden className="size-7 text-grafite" strokeWidth={1.5} />
          <span className="sr-only">Foto do especialista</span>
        </span>
        <div className="leading-tight">
          <p className="font-medium">[Nome do especialista]</p>
          <p className="text-sm text-grafite">Especialista em licitações</p>
        </div>
      </div>
      <p className="text-[15px] font-medium">Análises revisadas por especialista em licitações</p>
      <p className="text-sm text-grafite">
        [Mini-bio: anos de experiência, certificações e órgãos com que já trabalhou.]
      </p>
    </div>
  );
}

function Guarantee() {
  return (
    <div className="folha flex flex-col items-start gap-4 p-6">
      <span className="relative inline-flex size-20 items-center justify-center rounded-full border-2 border-tinta bg-marca-texto text-tinta">
        <span className="absolute inset-1.5 rounded-full border border-dashed border-tinta/50" />
        <span className="text-center leading-none">
          <span className="numero block text-2xl">14</span>
          <span className="block text-[11px] font-medium tracking-wide uppercase">dias</span>
        </span>
      </span>
      <div>
        <p className="flex items-center gap-2 font-serif text-xl font-semibold">
          <ShieldCheck aria-hidden className="size-5" />
          Garantia de 14 dias
        </p>
        <p className="mt-2 text-[15px] text-grafite">
          Se não servir para a sua empresa nos primeiros 14 dias, devolvemos o valor pago.
        </p>
      </div>
    </div>
  );
}

/** Só aparece quando há depoimentos reais em lib/testimonials.ts. */
function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {items.map((item) => (
        <li key={`${item.name}-${item.company}`} className="folha flex flex-col gap-5 p-6">
          <blockquote className="text-[17px] leading-relaxed text-tinta">“{item.quote}”</blockquote>
          <figure className="mt-auto flex items-center gap-3">
            {item.photo ? (
              <Image
                src={item.photo}
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="inline-flex size-12 items-center justify-center rounded-full bg-tinta font-serif text-lg font-semibold text-marca-texto"
              >
                {item.name.charAt(0)}
              </span>
            )}
            <figcaption className="text-sm leading-snug">
              <span className="font-medium text-tinta">{item.name}</span>
              <span className="block text-grafite">
                {item.role}, {item.company} · {item.cityUf}
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
