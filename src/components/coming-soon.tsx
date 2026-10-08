import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import { CnpjForm } from "@/components/cnpj-form";
import { Badge } from "@/components/ui/badge";
import { comingSoonPages, type ComingSoonSlug } from "@/lib/coming-soon";
import { site } from "@/lib/site";

const WITH_EMAIL = new Set<ComingSoonSlug>(["contato", "encarregado-de-dados"]);

export function comingSoonMetadata(slug: ComingSoonSlug): Metadata {
  const page = comingSoonPages[slug];
  return {
    title: page.title,
    description: page.description,
    robots: { index: false, follow: true },
  };
}

/** "Em breve" das páginas listadas em lib/coming-soon.ts, com o Raio-X. */
export function ComingSoon({ slug }: { slug: ComingSoonSlug }) {
  const page = comingSoonPages[slug];

  return (
    <main id="conteudo" className="flex-1">
      <div className="container-lg max-w-3xl py-16 md:py-24">
        <Badge variant="destaque">Em breve</Badge>
        <h1 className="mt-5 font-serif text-4xl leading-tight font-semibold md:text-5xl">{page.title}</h1>
        <p className="mt-4 text-base text-grafite md:text-lg">{page.description}</p>

        {WITH_EMAIL.has(slug) && (
          <a
            href={`mailto:${site.contact.email}`}
            className="mt-6 inline-flex items-center gap-2 rounded-sm text-lg font-medium underline decoration-tinta/30 underline-offset-4 hover:decoration-tinta"
          >
            <Mail aria-hidden className="size-5" />
            {site.contact.email}
          </a>
        )}

        <div className="folha mt-10 p-6 md:p-8">
          <h2 className="font-serif text-2xl leading-tight font-semibold">
            Enquanto isso, veja as licitações do seu CNPJ
          </h2>
          <CnpjForm
            origem={`em-breve-${slug}`}
            buttonLabel="Fazer meu Raio-X grátis"
            note="Grátis, sem cartão e sem cadastro. Resultado em segundos."
            className="mt-6"
          />
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-sm text-base font-medium text-grafite hover:text-tinta"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}
