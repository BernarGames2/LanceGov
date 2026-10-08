import { CalendarClock, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { NotaLance } from "@/components/nota-lance";
import { formatBRL } from "@/lib/format";
import type { Oportunidade, Participacao } from "@/lib/raio-x";
import { cn } from "@/lib/utils";

const participacaoLabel: Record<Participacao, string> = {
  exclusiva: "Exclusiva ME/EPP",
  cota: "Cota ME/EPP",
  ampla: "Ampla concorrência",
};

export function OpportunityCard({
  oportunidade: o,
  exemplo = false,
  showMotivo = false,
  headingLevel: Heading = "h3",
  className,
}: {
  oportunidade: Oportunidade;
  exemplo?: boolean;
  showMotivo?: boolean;
  headingLevel?: "h2" | "h3" | "p";
  className?: string;
}) {
  const vai = o.recomendacao === "vai";

  return (
    <article className={cn("folha p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-grafite">
            {exemplo && (
              <span className="rounded-full border border-dashed border-grafite/40 px-2 py-px text-xs font-medium tracking-wide text-grafite uppercase">
                Exemplo
              </span>
            )}
            <span>{o.orgao}</span>
          </div>
          <Heading className="mt-2 text-lg leading-snug font-medium text-tinta">{o.objeto}</Heading>
          <p className="mt-0.5 text-sm text-grafite">{o.modalidade}</p>
          <p className="numero mt-3 text-2xl text-tinta">{formatBRL(o.valor)}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <NotaLance score={o.notaLance} size={68} />
          <span className="text-xs font-medium text-grafite">Nota Lance</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={vai ? "vitoria" : "risco"}>
          {vai ? <Check aria-hidden /> : <X aria-hidden />}
          {vai ? "Vai" : "Não vai"}
        </Badge>
        <Badge>{participacaoLabel[o.participacao]}</Badge>
        <Badge variant="prazo">
          <CalendarClock aria-hidden />
          Sessão em <span className="numero">{o.diasParaSessao}</span> dias
        </Badge>
      </div>

      {showMotivo && (
        <p className="mt-4 border-t border-linha pt-4 text-[15px] leading-relaxed text-grafite">
          {o.motivo}
        </p>
      )}
    </article>
  );
}
