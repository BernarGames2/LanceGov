"use client";

import { MessageCircle } from "lucide-react";

import { TrackedLink } from "@/components/tracked-link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { track } from "@/lib/analytics";
import { faq } from "@/lib/faq";
import { whatsappUrl } from "@/lib/site";

export function Faq() {
  return (
    <section aria-labelledby="faq-titulo" className="py-20 md:py-28">
      <div className="container-lg grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <h2 id="faq-titulo" className="titulo-secao">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-base text-grafite md:text-lg">Ficou alguma dúvida? A gente responde.</p>
          <TrackedLink
            href={whatsappUrl("Olá! Tenho uma dúvida sobre a LanceGov.")}
            event="whatsapp_click"
            eventProps={{ local: "faq" }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-tinta/15 bg-folha px-5 py-3 text-base font-medium transition-colors hover:border-tinta/30"
          >
            <MessageCircle aria-hidden className="size-5" />
            Falar no WhatsApp
          </TrackedLink>
        </div>

        <Accordion
          type="single"
          collapsible
          onValueChange={(value) => {
            if (value) track("faq_open", { pergunta: value });
          }}
          className="folha px-5 sm:px-8"
        >
          {faq.map((item, index) => (
            <AccordionItem key={item.question} value={`pergunta-${index + 1}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
