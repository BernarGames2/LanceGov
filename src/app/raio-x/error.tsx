"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RaioXError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="conteudo" className="container-lg flex-1 py-16 md:py-24">
      <h1 className="font-serif text-4xl leading-tight font-semibold">Não deu para fazer o Raio-X agora</h1>
      <p className="mt-4 max-w-2xl text-base text-grafite md:text-lg">
        A busca de licitações não respondeu. Tente de novo em instantes.
      </p>
      <Button variant="dark" className="mt-8" onClick={() => retry()}>
        <RotateCcw aria-hidden className="size-5" />
        Tentar de novo
      </Button>
    </main>
  );
}
