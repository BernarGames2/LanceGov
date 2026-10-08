"use client";

import { Component, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

import { CnpjForm } from "@/components/cnpj-form";
import { Button } from "@/components/ui/button";
import { forgetRaioXFailures, RaioXError } from "@/lib/raio-x";

/** O que mostrar quando o Raio-X falha: CNPJ não encontrado ou fonte fora do ar. */
export function RaioXFailureView({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const known = error instanceof RaioXError;
  const notFound = known && error.status === 404;

  return (
    <div className="container-lg max-w-3xl py-16 md:py-24">
      <h1 className="font-serif text-4xl leading-tight font-semibold">
        {notFound ? "CNPJ não encontrado" : "Não deu para fazer o Raio-X agora"}
      </h1>
      <p className="mt-4 text-base text-grafite md:text-lg">
        {known ? error.message : "A busca de licitações não respondeu. Tente de novo em instantes."}
      </p>
      {notFound ? (
        <CnpjForm origem="raio-x-erro" buttonLabel="Ver minhas licitações grátis" className="mt-8" />
      ) : (
        <Button variant="dark" className="mt-8" onClick={onRetry}>
          <RotateCcw aria-hidden className="size-5" />
          Tentar de novo
        </Button>
      )}
    </div>
  );
}

/**
 * Captura a falha do Raio-X de UM CNPJ. Quem usa passa `key` com o CNPJ e a
 * tentativa: com outro CNPJ (ou nova tentativa) a tela de erro some sozinha.
 */
export class RaioXBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state: { error: unknown } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <RaioXFailureView
          error={this.state.error}
          onRetry={() => {
            forgetRaioXFailures();
            this.setState({ error: null });
          }}
        />
      );
    }
    return this.props.children;
  }
}
