import { BadgeCheck, CalendarX2, Landmark, LockKeyhole } from "lucide-react";

import { CountUp } from "@/components/count-up";

const items = [
  { icon: Landmark, label: "Dados oficiais do PNCP" },
  { icon: BadgeCheck, label: "Feito para a Lei 14.133" },
  { icon: LockKeyhole, label: "Documentos protegidos pela LGPD" },
  { icon: CalendarX2, label: "Cancele quando quiser" },
];

/** Faixa de confiança. `valorMonitorado` vem de getSiteStats(); sem dado mostra "—". */
export function TrustBar({ valorMonitorado }: { valorMonitorado: number | null }) {
  return (
    <section aria-label="Por que confiar" className="border-y border-linha bg-folha">
      <div className="container-lg flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <ul className="grid grid-cols-1 gap-x-8 gap-y-2 text-[15px] font-medium text-tinta min-[420px]:grid-cols-2">
          {items.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon aria-hidden className="size-[18px] shrink-0 text-grafite" />
              {label}
            </li>
          ))}
        </ul>

        <p className="flex items-center gap-2.5 text-[15px] text-grafite">
          <span aria-hidden className="relative flex size-2.5 shrink-0">
            {valorMonitorado !== null && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-vitoria opacity-60 motion-reduce:hidden" />
            )}
            <span
              className={
                valorMonitorado !== null
                  ? "relative inline-flex size-2.5 rounded-full bg-vitoria"
                  : "relative inline-flex size-2.5 rounded-full bg-grafite/30"
              }
            />
          </span>
          <span>
            <span className="numero text-tinta">
              R$ {valorMonitorado !== null ? <CountUp value={valorMonitorado} /> : "—"}
            </span>{" "}
            em licitações abertas monitoradas hoje
          </span>
        </p>
      </div>
    </section>
  );
}
