"use client";

import { Suspense, use, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Info, LoaderCircle, MessageCircle } from "lucide-react";

import { CnpjForm } from "@/components/cnpj-form";
import { OpportunityCard } from "@/components/opportunity-card";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { cleanCnpj, formatCnpj, isValidCnpj } from "@/lib/cnpj";
import { formatBRLCompact, formatInteger } from "@/lib/format";
import { fetchRaioX, type RaioXResult as Result } from "@/lib/raio-x";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Página /raio-x?cnpj=...: lê o CNPJ da URL e mostra o resultado de fetchRaioX. */
export function RaioXResult() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("cnpj") ?? "";

  if (!isValidCnpj(raw)) {
    return <RaioXStart invalid={raw.length > 0} initialValue={raw} />;
  }

  const cnpj = cleanCnpj(raw);
  return (
    <Suspense fallback={<RaioXLoading />}>
      <RaioXData key={cnpj} cnpj={cnpj} />
    </Suspense>
  );
}

function RaioXData({ cnpj }: { cnpj: string }) {
  const result = use(fetchRaioX(cnpj));

  useEffect(() => {
    track("raiox_view", { exemplo: result.exemplo });
  }, [result]);

  return <RaioXView result={result} />;
}

function RaioXView({ result }: { result: Result }) {
  const stats = [
    { label: "licitações abertas compatíveis", value: formatInteger(result.abertas.quantidade) },
    { label: "em valor total aberto agora", value: formatBRLCompact(result.abertas.valorTotal) },
    { label: "exclusivas para ME/EPP", value: formatInteger(result.abertas.exclusivasMeEpp) },
    {
      label: `em ${formatInteger(result.ultimas4Semanas.quantidade)} licitações que passaram nas últimas 4 semanas`,
      value: formatBRLCompact(result.ultimas4Semanas.valorTotal),
    },
  ];

  return (
    <div className="container-lg py-10 md:py-16">
      {result.exemplo && (
        <p className="mb-8 flex items-start gap-3 rounded-xl border border-prazo/40 bg-prazo/15 px-4 py-3 text-[15px] text-tinta">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
          Exemplo: os dados reais aparecem quando a API estiver conectada
        </p>
      )}

      <p className="text-sm font-medium tracking-wide text-grafite uppercase">Raio-X do CNPJ</p>
      <h1 className="numero mt-2 text-3xl tracking-tight text-tinta md:text-5xl">{formatCnpj(result.cnpj)}</h1>
      <p className="mt-3 max-w-3xl text-base text-grafite">
        CNAE <span className="numero text-tinta">{result.perfil.cnae}</span> ·{" "}
        {result.perfil.descricaoCnae} · Porte {result.perfil.porte}
      </p>

      <dl className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="folha flex flex-col-reverse justify-end gap-2 p-5">
            <dt className="text-[15px] text-grafite">{stat.label}</dt>
            <dd className="numero text-3xl text-tinta">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <section aria-labelledby="oportunidades-titulo">
          <h2 id="oportunidades-titulo" className="font-serif text-3xl leading-tight font-semibold">
            As {result.oportunidades.length} melhores oportunidades agora
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {result.oportunidades.map((oportunidade) => (
              <li key={oportunidade.id}>
                <OpportunityCard oportunidade={oportunidade} exemplo={result.exemplo} showMotivo />
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="secao-escura rounded-xl p-6 md:p-8">
            <MessageCircle aria-hidden className="size-7 text-marca-texto" strokeWidth={1.5} />
            <h2 className="mt-4 font-serif text-2xl leading-tight font-semibold">
              Receba as próximas antes da concorrência
            </h2>
            <p className="mt-3 text-base text-papel/75">
              A LanceGov avisa no WhatsApp quando aparece uma licitação com a cara da sua empresa,
              com a Nota Lance e o que falta para participar.
            </p>
            <Link
              href={signupUrl({ origem: "raio-x" })}
              onClick={() => track("cta_click", { local: "raio-x" })}
              className={cn(buttonVariants({ size: "lg" }), "mt-6 h-auto min-h-14 w-full py-3 whitespace-normal")}
            >
              Criar conta grátis e receber no WhatsApp
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </div>

          <div className="folha p-6">
            <h2 className="text-lg font-medium">Fazer outro Raio-X</h2>
            <CnpjForm origem="raio-x" buttonLabel="Ver licitações" className="mt-4" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function RaioXStart({ invalid, initialValue }: { invalid: boolean; initialValue: string }) {
  return (
    <div className="container-lg max-w-3xl py-16 md:py-24">
      <h1 className="font-serif text-4xl leading-tight font-semibold md:text-5xl">Raio-X do CNPJ</h1>
      <p className="mt-4 text-base text-grafite md:text-lg">
        {invalid
          ? "Esse CNPJ não parece certo. Confira os caracteres e tente de novo."
          : "Digite o CNPJ da sua empresa para ver as licitações abertas que combinam com ela."}
      </p>
      <CnpjForm
        origem="raio-x"
        buttonLabel="Ver minhas licitações grátis"
        note="Grátis, sem cartão e sem cadastro. Resultado em segundos."
        initialValue={initialValue}
        className="mt-8"
      />
    </div>
  );
}

export function RaioXLoading() {
  return (
    <div className="container-lg py-10 md:py-16" aria-busy="true">
      <p role="status" className="flex items-center gap-3 text-lg font-medium text-tinta">
        <LoaderCircle aria-hidden className="size-6 animate-spin" />
        Procurando licitações compatíveis...
      </p>
      <div aria-hidden className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="folha h-28 animate-pulse bg-muted" />
        ))}
      </div>
      <div aria-hidden className="mt-14 flex flex-col gap-4 lg:w-[62%]">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="folha h-44 animate-pulse bg-muted" />
        ))}
      </div>
    </div>
  );
}
