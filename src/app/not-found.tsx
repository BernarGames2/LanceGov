import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="conteudo" className="container-lg flex-1 py-20 md:py-28">
      <p className="numero text-sm text-grafite">404</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold md:text-5xl">
        Esta página não está no edital
      </h1>
      <p className="mt-4 max-w-xl text-base text-grafite md:text-lg">
        O endereço pode ter mudado ou não existir mais.
      </p>
      <Link href="/" className={`${buttonVariants({ variant: "dark" })} mt-8`}>
        Ir para a página inicial
      </Link>
    </main>
  );
}
