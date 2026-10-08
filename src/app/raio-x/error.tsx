"use client";

import { RotateCcw } from "lucide-react";

import { CnpjForm } from "@/components/cnpj-form";
import { Button } from "@/components/ui/button";
import { forgetRaioXFailures, RaioXError } from "@/lib/raio-x";

export default function RaioXErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const known = error instanceof RaioXError;
  const notFound = known && error.status === 404;

  return (
    <main id="conteudo" className="container-lg max-w-3xl flex-1 py-16 md:py-24">
      <h1 className="font-serif text-4xl leading-tight font-semibold">
        {notFound ? "CNPJ não encontrado" : "Não deu para fazer o Raio-X agora"}
      </h1>
      <p className="mt-4 text-base text-grafite md:text-lg">
        {known ? error.message : "A busca de licitações não respondeu. Tente de novo em instantes."}
      </p>
      {notFound ? (
        <CnpjForm origem="raio-x-erro" buttonLabel="Ver minhas licitações grátis" className="mt-8" />
      ) : (
        <Button
          variant="dark"
          className="mt-8"
          onClick={() => {
            forgetRaioXFailures();
            retry();
          }}
        >
          <RotateCcw aria-hidden className="size-5" />
          Tentar de novo
        </Button>
      )}
    </main>
  );
}
