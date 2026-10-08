"use client";

import { RaioXFailureView } from "@/components/raio-x-failure";
import { forgetRaioXFailures } from "@/lib/raio-x";

/** Último recurso: a página já trata as falhas do Raio-X dentro de RaioXBoundary. */
export default function RaioXErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="conteudo" className="flex-1">
      <RaioXFailureView
        error={error}
        onRetry={() => {
          forgetRaioXFailures();
          retry();
        }}
      />
    </main>
  );
}
