import { CheckCheck } from "lucide-react";

import { CnpjForm } from "@/components/cnpj-form";
import { Highlight } from "@/components/highlight";
import { OpportunityCard } from "@/components/opportunity-card";
import { VideoDialog } from "@/components/video-dialog";
import { EXEMPLO } from "@/lib/raio-x";

export function Hero() {
  return (
    <section className="relative">
      <div className="container-lg grid items-center gap-12 pt-6 pb-16 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-linha bg-folha px-3 py-1 text-sm font-medium text-tinta">
            <span aria-hidden className="size-2 rounded-full bg-marca-texto ring-2 ring-tinta/10" />
            IA para licitações · Dados oficiais do PNCP
          </p>

          <h1 className="mt-4 font-serif text-[36px] leading-[1.08] font-semibold tracking-tight text-balance sm:mt-6 md:text-[56px]">
            Ganhe mais licitações. <Highlight>Leia menos edital</Highlight>.
          </h1>

          <p className="mt-4 text-base text-grafite sm:mt-6 sm:text-lg">
            A LanceGov acompanha as licitações do Brasil, lê cada edital em um minuto e avisa no seu
            WhatsApp quando aparece uma oportunidade com a cara da sua empresa, com prazos,
            documentos e preço de referência.
          </p>

          <CnpjForm
            primary
            origem="hero"
            buttonLabel="Ver minhas licitações grátis"
            note="Grátis, sem cartão e sem cadastro. Resultado em segundos."
            className="mt-6 sm:mt-8"
          />

          <div className="mt-1">
            <VideoDialog />
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/** Balão de WhatsApp com o cartão de oportunidade de exemplo por cima. */
function HeroVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-[460px] lg:mr-0">
      <figcaption className="sr-only">
        Exemplo de alerta da LanceGov no WhatsApp, com uma oportunidade e a Nota Lance.
      </figcaption>

      <div className="ml-auto w-[88%] rounded-[28px] bg-whatsapp-fundo p-3 pb-28 shadow-folha sm:p-4 sm:pb-28">
        <div className="flex items-center gap-3 rounded-2xl bg-folha/70 px-3 py-2.5">
          <span
            aria-hidden
            className="inline-flex size-9 items-center justify-center rounded-full bg-tinta font-serif text-lg font-semibold text-marca-texto"
          >
            L
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-medium text-tinta">LanceGov</p>
            <p className="text-xs text-grafite">conta comercial</p>
          </div>
        </div>

        <div className="mt-3 max-w-[85%] rounded-xl rounded-tl-sm bg-folha px-3.5 py-2.5 text-[15px] leading-snug text-tinta shadow-sm">
          Bom dia! Apareceu uma licitação com a cara da sua empresa:
          <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-grafite">
            <span className="numero">08:02</span>
            <CheckCheck aria-hidden className="size-3.5 text-tinta/60" />
          </span>
        </div>
      </div>

      <OpportunityCard
        oportunidade={EXEMPLO.oportunidades[0]}
        exemplo
        headingLevel="p"
        className="relative -mt-24 mr-6 shadow-folha-alta sm:mr-12"
      />
    </figure>
  );
}
