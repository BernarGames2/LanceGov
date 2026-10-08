import { CalendarClock, Check, ExternalLink, X } from "lucide-react";

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

const SAO_PAULO = "America/Sao_Paulo";
const dayFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: SAO_PAULO });
const isoDay = new Intl.DateTimeFormat("en-CA", { timeZone: SAO_PAULO });

/** "Propostas até 20/10 (em 12 dias)", contando dias do calendário de Brasília. */
export function prazoLabel(encerramento: string, now = new Date()) {
  const end = new Date(encerramento);
  const days = Math.round(
    (Date.parse(isoDay.format(end)) - Date.parse(isoDay.format(now))) / 86_400_000,
  );
  const quando = days <= 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`;
  return `Propostas até ${dayFormat.format(end)} (${quando})`;
}

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
  const local = [o.municipio, o.uf].filter(Boolean).join("/");
  const participacao = o.participacao
    ? participacaoLabel[o.participacao]
    : o.faixaMeEpp
      ? "Até R$ 80 mil · faixa ME/EPP"
      : null;

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
            {local && <span aria-hidden>·</span>}
            {local && <span>{local}</span>}
          </div>
          <Heading className="mt-2 line-clamp-3 text-lg leading-snug font-medium text-tinta">{o.objeto}</Heading>
          <p className="mt-0.5 text-sm text-grafite">{o.modalidade}</p>
          {o.valor !== null ? (
            <p className="numero mt-3 text-2xl text-tinta">{formatBRL(o.valor)}</p>
          ) : (
            <p className="mt-3 text-base text-grafite">Valor sigiloso ou não informado</p>
          )}
        </div>
        {o.notaLance !== undefined && (
          <div className="flex flex-col items-center gap-1.5">
            <NotaLance score={o.notaLance} size={68} />
            <span className="text-xs font-medium text-grafite">Nota Lance</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {o.recomendacao && (
          <Badge variant={o.recomendacao === "vai" ? "vitoria" : "risco"}>
            {o.recomendacao === "vai" ? <Check aria-hidden /> : <X aria-hidden />}
            {o.recomendacao === "vai" ? "Vai" : "Não vai"}
          </Badge>
        )}
        {participacao && <Badge>{participacao}</Badge>}
        {o.diasParaSessao !== undefined ? (
          <Badge variant="prazo">
            <CalendarClock aria-hidden />
            Sessão em <span className="numero">{o.diasParaSessao}</span> dias
          </Badge>
        ) : o.encerramento ? (
          <Badge variant="prazo">
            <CalendarClock aria-hidden />
            {prazoLabel(o.encerramento)}
          </Badge>
        ) : null}
      </div>

      {showMotivo && o.motivo && (
        <p className="mt-4 border-t border-linha pt-4 text-[15px] leading-relaxed text-grafite">{o.motivo}</p>
      )}

      {o.url && (
        <a
          href={o.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-[15px] font-medium text-tinta underline decoration-tinta/30 underline-offset-4 hover:decoration-tinta"
        >
          Ver edital no PNCP
          <ExternalLink aria-hidden className="size-4" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      )}
    </article>
  );
}
