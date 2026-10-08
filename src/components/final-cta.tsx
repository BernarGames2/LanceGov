import { CnpjForm } from "@/components/cnpj-form";

export function FinalCta() {
  return (
    <section aria-labelledby="chamada-final-titulo" className="secao-escura py-20 md:py-28">
      <div className="container-lg flex flex-col items-center text-center">
        <h2 id="chamada-final-titulo" className="titulo-secao max-w-3xl md:text-5xl">
          O governo compra todo dia. <span className="text-marca-texto">Sua empresa está vendo?</span>
        </h2>
        <CnpjForm
          origem="chamada-final"
          tone="escuro"
          buttonLabel="Fazer meu Raio-X grátis"
          note="Grátis, sem cartão e sem cadastro. Resultado em segundos."
          className="mt-10 max-w-2xl text-left"
        />
      </div>
    </section>
  );
}
