import { interpolateColors, useCurrentFrame } from "remotion";
import { CalendarClock, Check, CircleAlert, LoaderCircle, X } from "lucide-react";

import { fadeUp, pop, progress, sec } from "../design/anim";
import { Badge, Body, Grifo, Kicker, Mono, PageTag, Paper, Stage, Title } from "../design/components";
import { color, font, SAFE_X } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("06-cofre");

/**
 * Passo 3 · Cofre: o checklist de habilitação do mesmo edital de exemplo.
 * Cada exigência entra com o selo "pág. N" (o mesmo da cena 5) e um
 * carregador cinza que vira o status: No cofre, Vence antes da sessão ou
 * Falta. No fim, o rodapé resume o que falta e o que vence.
 */
const T = {
  kicker: sec(0.6),
  title: sec(0.8),
  titleGrifo: sec(1.4),
  paper: sec(1.0),
  /** Linhas a cada 0,4 s; o status sai 0,4 s depois de cada linha. */
  rows: [sec(1.6), sec(2.0), sec(2.4), sec(2.8), sec(3.2)],
  body: sec(4.2),
  rodape: sec(5.2),
  bodyGrifo: sec(5.8),
} as const;
const STATUS_DELAY = sec(0.4);

/**
 * Card (px do quadro). x 840 (e não 900, como no storyboard) para a grade de
 * 3 colunas caber com texto de 28 px, selo de status de 24 px e "pág." de 26 px
 * sem apertar; é a mesma posição do card do edital na cena 5.
 */
const PAPER = { x: 840, y: 160, w: 920, h: 760, pad: 36 } as const;
/** Coluna de texto da grade: até 2 linhas de 28 px. */
const TEXT_W = 330;
const TAG_W = 140;
/** Sangria lateral do fundo colorido das linhas (fica dentro do padding do card). */
const BLEED = 16;

type Status = "ok" | "vence" | "falta";

const ROWS: { text: string; page: number; status: Status }[] = [
  { text: "Certidões federal, FGTS e trabalhista", page: 14, status: "ok" },
  { text: "Certidão municipal", page: 14, status: "vence" },
  { text: "Atestado de capacidade técnica", page: 15, status: "falta" },
  { text: "Balanço patrimonial", page: 16, status: "ok" },
  { text: "Ficha técnica e Anvisa dos saneantes", page: 17, status: "falta" },
];

const STATUS: Record<Status, { label: string; variant: "vitoria" | "prazo" | "risco"; Icon: typeof Check; tint: string }> = {
  ok: { label: "No cofre", variant: "vitoria", Icon: Check, tint: "transparent" },
  vence: { label: "Vence antes da sessão", variant: "prazo", Icon: CalendarClock, tint: "rgba(245,165,36,0.08)" },
  falta: { label: "Falta", variant: "risco", Icon: X, tint: "rgba(229,72,77,0.06)" },
};

/* ------------------------------------------------------------------ */
/* Linha do checklist                                                  */
/* ------------------------------------------------------------------ */

/** Coluna de status: carregador girando e, depois, o selo final com pop. */
function StatusCell({ status, start }: { status: Status; start: number }) {
  const frame = useCurrentFrame();
  const at = start + STATUS_DELAY;
  const s = pop(frame, at);
  const spinnerOut = progress(frame, at, 4);
  const { label, variant, Icon } = STATUS[status];
  return (
    <div style={{ position: "relative", height: 46, display: "flex", alignItems: "center" }}>
      {spinnerOut < 1 && (
        <LoaderCircle
          size={32}
          strokeWidth={2.25}
          color={color.grafite}
          style={{
            position: "absolute",
            left: 4,
            opacity: 0.55 * (1 - spinnerOut),
            transform: `rotate(${(frame - start) * 14}deg)`,
          }}
        />
      )}
      {frame >= at && (
        <Badge
          variant={variant}
          style={{
            fontSize: 24,
            gap: 8,
            padding: "5px 16px",
            opacity: progress(frame, at, 6),
            transform: `scale(${0.7 + 0.3 * s})`,
            transformOrigin: "left center",
          }}
        >
          <Icon size={22} strokeWidth={2.5} />
          {label}
        </Badge>
      )}
    </div>
  );
}

function Row({ row, start }: { row: (typeof ROWS)[number]; start: number }) {
  const frame = useCurrentFrame();
  const tint = progress(frame, T.rodape, 12);
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `${TEXT_W}px 1fr ${TAG_W}px`,
        columnGap: 18,
        alignItems: "center",
        padding: `14px ${BLEED}px`,
        margin: `0 -${BLEED}px`,
        borderRadius: 14,
        ...fadeUp(frame, start, 12, 16),
      }}
    >
      {/* Fundo de alerta (Falta / Vence) que acende junto com o rodapé */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          background: STATUS[row.status].tint,
          opacity: tint,
        }}
      />
      <div style={{ position: "relative", fontSize: 28, lineHeight: 1.3, color: color.tinta, textWrap: "balance" }}>
        {row.text}
      </div>
      <div style={{ position: "relative" }}>
        <StatusCell status={row.status} start={start} />
      </div>
      <div style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
        <PageTag
          page={row.page}
          style={{
            opacity: progress(frame, start, 6),
            transform: `scale(${0.6 + 0.4 * pop(frame, start)})`,
            transformOrigin: "right center",
          }}
        />
      </div>
    </div>
  );
}

function Divider({ start }: { start: number }) {
  const frame = useCurrentFrame();
  return <div style={{ height: 2, background: color.linha, opacity: progress(frame, start, 12) }} />;
}

/* ------------------------------------------------------------------ */
/* Card                                                                 */
/* ------------------------------------------------------------------ */

function Checklist() {
  const frame = useCurrentFrame();
  const rodape = pop(frame, T.rodape);
  const rodapeStyle = (delay: number): React.CSSProperties => {
    const s = pop(frame, T.rodape + delay);
    return {
      opacity: progress(frame, T.rodape + delay, 6),
      transform: `scale(${0.8 + 0.2 * s})`,
      transformOrigin: "left center",
    };
  };

  return (
    <Paper
      style={{
        position: "absolute",
        left: PAPER.x,
        top: PAPER.y,
        width: PAPER.w,
        height: PAPER.h,
        boxSizing: "border-box",
        padding: PAPER.pad,
        display: "flex",
        flexDirection: "column",
        ...fadeUp(frame, T.paper, 18, 40),
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Badge variant="exemplo">Exemplo</Badge>
        <span style={{ fontSize: 24, color: color.grafite, whiteSpace: "nowrap" }}>
          Material de limpeza · Prefeitura de [Município]
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <div style={{ fontFamily: font.serif, fontWeight: 600, fontSize: 40, lineHeight: 1.15 }}>Documentos exigidos</div>
        <Badge variant="prazo" style={{ fontSize: 24, gap: 8, padding: "6px 16px" }}>
          <CalendarClock size={22} strokeWidth={2} />
          <span>
            Sessão em <Mono>12</Mono> dias
          </span>
        </Badge>
      </div>
      <div style={{ height: 2, marginTop: 22, marginBottom: 6, background: color.linha }} />

      {/* Exigências */}
      {ROWS.map((row, i) => (
        <div key={row.text}>
          {i > 0 && <Divider start={T.rows[i]} />}
          {frame >= T.rows[i] && <Row row={row} start={T.rows[i]} />}
        </div>
      ))}

      {/* Rodapé: o que falta e o que vence */}
      <div style={{ marginTop: "auto" }}>
        <div style={{ height: 2, background: color.linha, opacity: progress(frame, T.rodape, 8) }} />
        <div style={{ display: "flex", gap: 14, marginTop: 20, opacity: rodape > 0 ? 1 : 0 }}>
          <Badge variant="risco" style={rodapeStyle(0)}>
            <CircleAlert size={24} strokeWidth={2.25} />
            <span>
              Faltam <Mono>2</Mono> documentos
            </span>
          </Badge>
          <Badge variant="prazo" style={rodapeStyle(3)}>
            <CalendarClock size={24} strokeWidth={2} />
            <span>
              <Mono>1</Mono> vence antes da sessão
            </span>
          </Badge>
        </div>
      </div>
    </Paper>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();

  return (
    <Stage>
      {/* Esquerda: kicker, título e texto */}
      <div style={{ position: "absolute", left: SAFE_X, top: 300, width: 620 }}>
        <Kicker style={fadeUp(frame, T.kicker, 15, 14)}>Passo 3 · Cofre</Kicker>
      </div>
      <div style={{ position: "absolute", left: SAFE_X, top: 360, width: 620 }}>
        <Title fontSize={84} style={fadeUp(frame, T.title)}>
          <Grifo start={T.titleGrifo}>Zero susto</Grifo>
          <br />
          na habilitação
        </Title>
      </div>
      <div style={{ position: "absolute", left: SAFE_X, top: 590, width: 620 }}>
        <Body fontSize={40} style={fadeUp(frame, T.body)}>
          O cofre confere cada edital e avisa{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            <Grifo start={T.bodyGrifo}>
              {/* O Grifo do kit força tinta; até o grifo passar, o trecho segue grafite como o resto. */}
              <span style={{ color: interpolateColors(progress(frame, T.bodyGrifo, 12), [0, 1], [color.grafite, color.tinta]) }}>
                o que falta e o que vence
              </span>
            </Grifo>
          </span>{" "}
          antes da sessão.
        </Body>
      </div>

      {/* Direita: checklist do cofre */}
      <Checklist />
    </Stage>
  );
}
