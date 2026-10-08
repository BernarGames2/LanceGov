import type { Metadata } from "next";
import { Suspense } from "react";

import { RaioXLoading, RaioXResult } from "@/components/raio-x-result";

export const metadata: Metadata = {
  title: "Raio-X do CNPJ",
  description: "Veja as licitações abertas que combinam com o seu CNPJ, com valor total e Nota Lance.",
  robots: { index: false, follow: true },
};

export default function RaioXPage() {
  return (
    <main id="conteudo" className="flex-1">
      <Suspense fallback={<RaioXLoading />}>
        <RaioXResult />
      </Suspense>
    </main>
  );
}
