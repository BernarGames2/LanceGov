import type { Metadata } from "next";
import { Suspense } from "react";

import { Benefits } from "@/components/benefits";
import { Demo } from "@/components/demo";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { JsonLd } from "@/components/json-ld";
import { Pricing } from "@/components/pricing";
import { Problem } from "@/components/problem";
import { SocialProof } from "@/components/social-proof";
import { TrustBar } from "@/components/trust-bar";
import { faq } from "@/lib/faq";
import { plans } from "@/lib/plans";
import { site } from "@/lib/site";
import { getSiteStats } from "@/lib/stats";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organizacao`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      logo: `${site.url}/icon.svg`,
      email: site.contact.email,
      sameAs: Object.values(site.social),
    },
    {
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "pt-BR",
      url: site.url,
      description: site.description,
      publisher: { "@id": `${site.url}/#organizacao` },
      offers: plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.monthlyPrice,
        priceCurrency: "BRL",
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

export default async function Home() {
  const stats = await getSiteStats();

  return (
    <main id="conteudo">
      <JsonLd data={structuredData} />
      <Hero />
      <TrustBar valorMonitorado={stats.valorMonitoradoHoje} />
      <Problem />
      <Benefits />
      <HowItWorks />
      {/* Cada Suspense hidrata em separado, sem travar o celular numa tarefa longa. */}
      <Suspense>
        <Demo />
      </Suspense>
      <Suspense>
        <SocialProof stats={stats} testimonials={testimonials} />
      </Suspense>
      <Suspense>
        <Pricing />
      </Suspense>
      <Suspense>
        <Faq />
      </Suspense>
      <Suspense>
        <FinalCta />
      </Suspense>
    </main>
  );
}
