import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

import { CookiePreferencesButton } from "@/components/cookie-consent";
import { Logo } from "@/components/logo";
import { TrackedLink } from "@/components/tracked-link";
import { footerColumns, site, whatsappUrl } from "@/lib/site";

const socialLinks = [
  { label: "Instagram", href: site.social.instagram },
  { label: "LinkedIn", href: site.social.linkedin },
  { label: "YouTube", href: site.social.youtube },
  { label: "TikTok", href: site.social.tiktok },
];

export function Footer() {
  return (
    <footer className="border-t border-linha bg-papel">
      <div className="container-lg grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-block rounded-md" aria-label="LanceGov, página inicial">
            <Logo className="text-2xl" />
          </Link>
          <p className="mt-4 text-base text-grafite">
            A IA que encontra, lê e prepara as licitações que sua empresa pode vencer.
          </p>

          <ul className="mt-6 flex flex-col gap-2 text-[15px]">
            <li>
              <TrackedLink
                href={whatsappUrl()}
                event="whatsapp_click"
                eventProps={{ local: "rodape" }}
                className="inline-flex items-center gap-2 rounded-sm font-medium hover:underline"
              >
                <MessageCircle aria-hidden className="size-[18px] text-grafite" />
                WhatsApp
              </TrackedLink>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex items-center gap-2 rounded-sm font-medium hover:underline"
              >
                <Mail aria-hidden className="size-[18px] text-grafite" />
                {site.contact.email}
              </a>
            </li>
          </ul>

          <ul aria-label="Redes sociais" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[15px] text-grafite">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm hover:text-tinta hover:underline"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-medium tracking-wide text-tinta uppercase">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-grafite">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rounded-sm hover:text-tinta hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-linha">
        <div className="container-lg flex flex-col gap-4 py-8 text-sm text-grafite lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-1.5">
            <p>
              A LanceGov é uma empresa privada, sem vínculo com órgãos públicos. Dados públicos do PNCP
              e de portais oficiais.
            </p>
            <p>
              {site.legalName} · CNPJ {site.cnpj} · {site.cidadeUf}
            </p>
          </div>
          <CookiePreferencesButton />
        </div>
      </div>
    </footer>
  );
}
