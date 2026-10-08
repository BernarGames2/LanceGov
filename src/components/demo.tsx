"use client";

import { useLayoutEffect, useState } from "react";
import { Check, CheckCheck, Clock, RotateCcw } from "lucide-react";

import { NotaLance } from "@/components/nota-lance";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Status = "ok" | "falta" | "vence";

type Item = { text: string; page: number; status?: Status };

const tabs: { value: string; label: string; items: Item[] }[] = [
  {
    value: "resumo",
    label: "Resumo",
    items: [
      { text: "Registro de preços para material de limpeza e higiene, em 18 itens.", page: 1 },
      { text: "Pregão eletrônico, menor preço por item.", page: 2 },
      { text: "Itens 1 a 18 exclusivos para ME/EPP.", page: 4 },
      { text: "Valor estimado de R$ 184.000.", page: 22 },
      { text: "Ata válida por 12 meses, com entrega em até 10 dias após o pedido.", page: 14 },
    ],
  },
  {
    value: "exigencias",
    label: "Exigências",
    items: [
      { text: "Certidões federal, do FGTS e trabalhista em dia.", page: 14, status: "ok" },
      { text: "Certidão municipal do domicílio da empresa.", page: 14, status: "vence" },
      { text: "Atestado de capacidade técnica com fornecimento parecido.", page: 15, status: "falta" },
      { text: "Balanço patrimonial do último exercício.", page: 16, status: "ok" },
      { text: "Ficha técnica e registro na Anvisa dos saneantes.", page: 17, status: "falta" },
    ],
  },
  {
    value: "riscos",
    label: "Riscos",
    items: [
      { text: "Amostra em até 3 dias úteis, se o pregoeiro pedir.", page: 19 },
      { text: "Marca e modelo obrigatórios na proposta; não aceita “similar”.", page: 20 },
      { text: "Entrega dividida em 6 escolas da rede municipal.", page: 31 },
      { text: "Multa de 10% sobre o pedido em caso de atraso.", page: 33 },
    ],
  },
  {
    value: "prazos",
    label: "Prazos",
    items: [
      { text: "Esclarecimento ou impugnação: até 3 dias úteis antes da sessão.", page: 5 },
      { text: "Proposta e documentos: até a abertura da sessão.", page: 6 },
      { text: "Sessão pública em 12 dias, às 9h (horário de Brasília).", page: 1 },
      { text: "Recurso: intenção na sessão e 3 dias úteis para as razões.", page: 24 },
    ],
  },
];

const statusBadge: Record<Status, { label: string; variant: "vitoria" | "prazo" | "risco" }> = {
  ok: { label: "No cofre", variant: "vitoria" },
  vence: { label: "Vence antes da sessão", variant: "prazo" },
  falta: { label: "Falta", variant: "risco" },
};

const replies = {
  detalhes: {
    question: "Ver detalhes",
    answer:
      "Abri as exigências do edital. Faltam o atestado de capacidade técnica e a ficha técnica dos saneantes.",
    tab: "exigencias",
  },
  amanha: {
    question: "Lembrar amanhã",
    answer: "Combinado. Amanhã às 8h eu te lembro desta licitação.",
    tab: undefined,
  },
} as const;

type Reply = keyof typeof replies;

export function Demo() {
  const [tab, setTab] = useState("resumo");
  const [reply, setReply] = useState<Reply | null>(null);

  // Ao sair e voltar para a home, a conversa recomeça.
  useLayoutEffect(() => {
    return () => {
      setReply(null);
      setTab("resumo");
    };
  }, []);

  function choose(key: Reply) {
    setReply(key);
    const next = replies[key].tab;
    if (next) setTab(next);
  }

  return (
    <section aria-labelledby="demo-titulo" className="secao-escura py-20 md:py-28">
      <div className="container-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="demo-titulo" className="titulo-secao max-w-2xl">
            Veja um edital lido pela LanceGov
          </h2>
          <Badge variant="escuro" className="self-start md:self-auto">
            Exemplo ilustrativo
          </Badge>
        </div>

        <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-[1.45fr_1fr] lg:gap-8">
          <article aria-label="Leitura do edital de exemplo" className="folha overflow-hidden text-tinta">
            <header className="border-b border-linha p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-grafite">Prefeitura de [Município] · Pregão eletrônico</p>
                  <h3 className="mt-1 font-serif text-2xl leading-tight font-semibold">Material de limpeza</h3>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <NotaLance score={91} size={72} />
                  <span className="text-xs font-medium text-grafite">Nota Lance</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="vitoria">
                  <Check aria-hidden />
                  Vai
                </Badge>
                <Badge>Exclusiva ME/EPP</Badge>
                <Badge variant="prazo">
                  <Clock aria-hidden />
                  Sessão em <span className="numero">12</span> dias
                </Badge>
              </div>
            </header>

            <Tabs value={tab} onValueChange={setTab} className="p-5 sm:p-6">
              <TabsList aria-label="Partes do edital" className="grid grid-cols-2 rounded-2xl sm:flex sm:rounded-full">
                {tabs.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((t) => (
                <TabsContent key={t.value} value={t.value} className="mt-4">
                  <ul className="divide-y divide-linha">
                    {t.items.map((item) => (
                      <li key={item.text} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="text-[15px] leading-snug sm:text-base">{item.text}</p>
                          {item.status && (
                            <Badge variant={statusBadge[item.status].variant} className="mt-2 text-xs">
                              {statusBadge[item.status].label}
                            </Badge>
                          )}
                        </div>
                        <span className="numero shrink-0 rounded-md border border-linha bg-papel px-2 py-0.5 text-xs text-grafite">
                          pág. {item.page}
                        </span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          </article>

          <WhatsAppChat reply={reply} onChoose={choose} onReset={() => setReply(null)} />
        </div>
      </div>
    </section>
  );
}

function WhatsAppChat({
  reply,
  onChoose,
  onReset,
}: {
  reply: Reply | null;
  onChoose: (key: Reply) => void;
  onReset: () => void;
}) {
  return (
    <div
      aria-label="Conversa de exemplo no WhatsApp"
      role="group"
      className="flex flex-col rounded-[28px] bg-whatsapp-fundo p-3 text-tinta sm:p-4"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-folha/70 px-3 py-2.5">
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-full bg-tinta font-serif text-lg font-semibold text-marca-texto"
        >
          L
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-medium">LanceGov</p>
          <p className="text-xs text-grafite">conta comercial</p>
        </div>
      </div>

      <div aria-live="polite" className="flex flex-1 flex-col gap-2 py-4">
        <Bubble time="07:30">
          Bom dia! 3 licitações novas com a sua cara. A melhor: material de limpeza, R$ 184 mil,
          exclusiva ME/EPP, Nota 91. Sessão em 12 dias. Faltam 2 documentos. Quer ver?
        </Bubble>

        {reply ? (
          <>
            <Bubble time="07:31" mine>
              {replies[reply].question}
            </Bubble>
            <Bubble time="07:31">{replies[reply].answer}</Bubble>
          </>
        ) : (
          <div className="flex max-w-[85%] flex-col gap-1.5">
            {(Object.keys(replies) as Reply[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onChoose(key)}
                className="cursor-pointer rounded-xl bg-folha px-4 py-2.5 text-center text-[15px] font-medium text-tinta shadow-sm transition-colors hover:bg-papel"
              >
                {replies[key].question}
              </button>
            ))}
          </div>
        )}
      </div>

      {reply ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex cursor-pointer items-center gap-1.5 self-center rounded-full px-3 py-1.5 text-sm font-medium text-grafite transition-colors hover:text-tinta"
        >
          <RotateCcw aria-hidden className="size-4" />
          Ver de novo
        </button>
      ) : (
        <div aria-hidden className="rounded-full bg-folha px-4 py-2.5 text-[15px] text-grafite">
          Mensagem
        </div>
      )}
    </div>
  );
}

function Bubble({ children, time, mine = false }: { children: React.ReactNode; time: string; mine?: boolean }) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-xl px-3.5 py-2.5 text-[15px] leading-snug shadow-sm animate-surgir",
        mine ? "self-end rounded-tr-sm bg-[#f4fbc8]" : "rounded-tl-sm bg-folha",
      )}
    >
      <span className="sr-only">{mine ? "Você: " : "LanceGov: "}</span>
      {children}
      <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-grafite">
        <span className="numero">{time}</span>
        {mine ? <CheckCheck aria-hidden className="size-3.5 text-tinta/60" /> : null}
      </span>
    </div>
  );
}

