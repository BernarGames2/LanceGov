import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";

import { CookieConsent } from "@/components/cookie-consent";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s | LanceGov",
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-full bg-tinta px-5 py-3 font-medium text-papel focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Pular para o conteúdo
        </a>
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Suspense>
          <Footer />
        </Suspense>
        <Suspense>
          <CookieConsent />
        </Suspense>
        <noscript>
          <style>{".grifo{background-size:100% 0.62em}"}</style>
        </noscript>
      </body>
    </html>
  );
}
