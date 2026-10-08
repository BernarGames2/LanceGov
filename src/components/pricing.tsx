"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { Highlight } from "@/components/highlight";
import { RaioXLink } from "@/components/raio-x-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { formatInteger } from "@/lib/format";
import { ENTERPRISE_FROM, plans, priceFor, type BillingCycle, type Plan } from "@/lib/plans";
import { salesUrl, signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("mensal");

  return (
    <section id="planos" aria-labelledby="planos-titulo" className="border-t border-linha bg-folha py-20 md:py-28">
      <div className="container-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 id="planos-titulo" className="titulo-secao">
              Preço aberto, mensal e <Highlight>sem fidelidade</Highlight>
            </h2>
            <p className="mt-4 text-base text-grafite md:text-lg">
              Comece grátis. Troque de plano ou cancele em dois cliques.
            </p>
          </div>
          <CycleToggle cycle={cycle} onChange={setCycle} />
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 lg:gap-6 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </ul>

        <p className="mt-6 rounded-xl border border-linha bg-papel px-5 py-4 text-base text-tinta md:mt-8">
          <span className="font-medium">
            Empresa, a partir de <span className="numero">R$ {formatInteger(ENTERPRISE_FROM)}</span>/mês:
          </span>{" "}
          usuários ilimitados, API e gerente de conta.{" "}
          <Link
            href={salesUrl}
            onClick={() => track("plan_select", { plano: "empresa", ciclo: cycle })}
            className="font-medium underline decoration-tinta/30 underline-offset-4 hover:decoration-tinta"
          >
            Fale com a gente.
          </Link>
        </p>
      </div>
    </section>
  );
}

function CycleToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (cycle: BillingCycle) => void }) {
  const options: { value: BillingCycle; label: string }[] = [
    { value: "mensal", label: "Mensal" },
    { value: "anual", label: "Anual" },
  ];

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <div role="group" aria-label="Ciclo de cobrança" className="inline-flex rounded-full border border-linha bg-papel p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={cycle === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-10 cursor-pointer rounded-full px-5 text-[15px] font-medium transition-colors",
              cycle === option.value ? "bg-tinta text-papel" : "text-grafite hover:text-tinta",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Badge variant="destaque">2 meses grátis no anual</Badge>
    </div>
  );
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const price = priceFor(plan, cycle);
  const featured = Boolean(plan.highlight);
  const ctaClass = cn(
    buttonVariants({ variant: featured ? "default" : plan.id === "gratis" ? "outline" : "dark" }),
    "mt-8 w-full",
  );
  const onSelect = () => track("plan_select", { plano: plan.id, ciclo: cycle });

  return (
    <li
      className={cn(
        "relative flex flex-col rounded-xl border bg-folha p-6 shadow-folha",
        featured ? "border-2 border-tinta" : "border-linha",
      )}
    >
      {plan.highlight && (
        <span className="absolute -top-3.5 left-6 rounded-full bg-marca-texto px-3 py-1 text-sm font-medium text-tinta">
          {plan.highlight}
        </span>
      )}

      <h3 className="font-serif text-2xl font-semibold">{plan.name}</h3>
      <p className="mt-1 min-h-12 text-[15px] text-grafite">{plan.audience}</p>

      <p className="mt-5 flex items-baseline gap-1">
        <span className="numero text-4xl tracking-tight">R$ {formatInteger(price)}</span>
        <span className="text-[15px] text-grafite">/mês</span>
      </p>
      <p className="mt-1 min-h-5 text-sm text-grafite">
        {plan.monthlyPrice > 0 && cycle === "anual" ? (
          <>
            cobrado por ano: <span className="numero">R$ {formatInteger(plan.monthlyPrice * 10)}</span>
          </>
        ) : plan.monthlyPrice > 0 ? (
          "sem fidelidade"
        ) : (
          "para sempre"
        )}
      </p>

      <ul className="mt-6 flex flex-col gap-3 border-t border-linha pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-[15px]">
            <Check aria-hidden className="mt-0.5 size-[18px] shrink-0 text-vitoria-escuro" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {plan.id === "gratis" ? (
          <RaioXLink event="plan_select" eventProps={{ plano: plan.id, ciclo: cycle }} className={ctaClass}>
            {plan.cta}
          </RaioXLink>
        ) : (
          <Link
            href={plan.id === "assessoria" ? salesUrl : signupUrl({ plano: plan.id, ciclo: cycle })}
            onClick={onSelect}
            className={ctaClass}
          >
            {plan.cta}
          </Link>
        )}
      </div>
    </li>
  );
}
