"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RAIO_X_INPUT_ID } from "@/components/raio-x-link";
import { track } from "@/lib/analytics";
import { cleanCnpj, formatCnpj, isValidCnpj } from "@/lib/cnpj";
import { fetchRaioX, RaioXError } from "@/lib/raio-x";
import { RAIO_X_ANCHOR } from "@/lib/site";
import { cn } from "@/lib/utils";

const INVALID_MESSAGE = "CNPJ inválido. Confira os caracteres.";
const LOADING_MESSAGE = "Procurando licitações compatíveis...";

type Props = {
  /** De onde veio o envio, para o analytics (hero, chamada-final, raio-x...). */
  origem: string;
  buttonLabel: string;
  note?: string;
  tone?: "claro" | "escuro";
  /** O formulário principal da home: recebe foco por /#raio-x. */
  primary?: boolean;
  initialValue?: string;
  className?: string;
};

export function CnpjForm({
  origem,
  buttonLabel,
  note,
  tone = "claro",
  primary = false,
  initialValue = "",
  className,
}: Props) {
  const router = useRouter();
  const generatedId = useId();
  const inputId = primary ? RAIO_X_INPUT_ID : `cnpj-${generatedId}`;
  const messageId = `${inputId}-mensagem`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(() => formatCnpj(initialValue));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // A home fica guardada (Activity) quando o visitante vai para /raio-x.
  // Ao esconder, volta o botão ao normal para quem retornar.
  useLayoutEffect(() => {
    return () => setLoading(false);
  }, []);

  useEffect(() => {
    if (primary && window.location.hash === `#${RAIO_X_ANCHOR}`) {
      inputRef.current?.focus();
    }
  }, [primary]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (!isValidCnpj(value)) {
      setError(INVALID_MESSAGE);
      track("cnpj_invalid", { origem });
      inputRef.current?.focus();
      return;
    }

    const cnpj = cleanCnpj(value);
    setError(null);
    setLoading(true);
    track("cnpj_submit", { origem, formato: /[A-Z]/.test(cnpj) ? "alfanumerico" : "numerico" });

    try {
      await fetchRaioX(cnpj, { retry: true });
      router.push(`/raio-x?cnpj=${cnpj}`);
    } catch (failure) {
      setLoading(false);
      setError(
        failure instanceof RaioXError ? failure.message : "Não deu para fazer o Raio-X agora. Tente de novo em instantes.",
      );
    }
  }

  const escuro = tone === "escuro";

  return (
    <form
      id={primary ? RAIO_X_ANCHOR : undefined}
      noValidate
      onSubmit={handleSubmit}
      className={cn("w-full", className)}
      aria-busy={loading}
    >
      <label htmlFor={inputId} className="sr-only">
        CNPJ da sua empresa
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        <Input
          ref={inputRef}
          id={inputId}
          name="cnpj"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Digite seu CNPJ"
          value={value}
          maxLength={18}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          disabled={loading}
          onChange={(e) => {
            setValue(formatCnpj(e.target.value));
            if (error) setError(null);
          }}
          className={cn(
            "numero h-14 text-[17px] tracking-wide placeholder:font-sans placeholder:tracking-normal sm:flex-1",
            escuro && "border-transparent",
          )}
        />
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-auto min-h-14 py-3 whitespace-normal disabled:opacity-100"
        >
          {loading ? (
            <>
              <LoaderCircle aria-hidden className="size-5 animate-spin" />
              {LOADING_MESSAGE}
            </>
          ) : (
            <>
              {buttonLabel}
              <ArrowRight aria-hidden className="size-5" />
            </>
          )}
        </Button>
      </div>

      <div id={messageId} aria-live="polite" className="mt-3 min-h-6 text-sm">
        {error ? (
          <p className={cn("font-medium", escuro ? "text-[#ffb4ae]" : "text-risco-escuro")}>{error}</p>
        ) : loading ? (
          <p className="sr-only">{LOADING_MESSAGE}</p>
        ) : note ? (
          <p className={escuro ? "text-papel/75" : "text-grafite"}>{note}</p>
        ) : null}
      </div>
    </form>
  );
}
