import { Easing, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { CalendarClock, Check } from "lucide-react";

import { fadeOut, fadeUp, pop, progress, sec } from "../design/anim";
import { Badge, Body, Grifo, Kicker, Mono, NotaLance, PageTag, Paper, Pointer, Stage, Title } from "../design/components";
import { color, font, radius, SAFE_X } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("05-edital");

/**
 * Leitura do edital (cena em tinta, como a seção demo do site). O card do
 * edital de exemplo é lido em 58 s: o Resumo entra linha a linha, cada uma com
 * o selo "pág. N" (o herói da cena). Os selos piscam em lima junto com "a
 * página do edital" no texto. Depois um clique abre a aba Riscos e a cláusula
 * que desclassifica ganha o grifo.
 */
const T = {
  kicker: sec(0.6),
  title: sec(0.8),
  paper: sec(1.0),
  nota: sec(1.2),
  tabs: sec(1.6),
  lido: sec(2.4),
  resumo: [sec(2.5), sec(2.85), sec(3.2)],
  body: sec(4.0),
  flash: sec(5.0),
  mouse: sec(8.0),
  clique: sec(8.7),
  riscos: [sec(9.0), sec(9.35), sec(9.7)],
  grifo: sec(11.0),
  mouseSai: sec(10.2),
} as const;

/** O selo "pág." dá o pop 0,15 s depois da linha. */
const TAG_DELAY = sec(0.15);
/** Pisca em lima por 400 ms (12 f). */
const FLASH_FRAMES = 12;

/** Card do edital (px do quadro). O conteúdo começa em PAPER + borda (2) + padding. */
const PAPER = { x: 840, y: 150, w: 920, h: 780, pad: 36 } as const;
const INNER = { x: PAPER.x + 2 + PAPER.pad, y: PAPER.y + 2 + PAPER.pad, w: PAPER.w - 4 - PAPER.pad * 2 } as const;

/** Geometria interna do card (y relativo ao topo do conteúdo). */
const HEADER_H = 174;
const DIVIDER_GAP = 32;
const TABS_Y = HEADER_H + DIVIDER_GAP + 2 + DIVIDER_GAP;
const TABS_H = 64;
const LIST_Y = TABS_Y + TABS_H + 18;

/** Abas em pílula com larguras fixas, para o ponteiro saber onde clicar. */
const TABS = [
  { label: "Resumo", w: 150 },
  { label: "Exigências", w: 186 },
  { label: "Riscos", w: 130 },
  { label: "Prazos", w: 134 },
] as const;
const TRACK_PAD = 5;
const tabX = (i: number) => TRACK_PAD + TABS.slice(0, i).reduce((s, t) => s + t.w, 0);

/** Ponteiro: nasce na borda direita do card e para no centro da aba Riscos. */
const RISCOS_CENTER = {
  x: INNER.x + tabX(2) + TABS[2].w / 2,
  y: INNER.y + TABS_Y + TABS_H / 2,
};
const MOUSE_FROM = { x: PAPER.x + PAPER.w - 30, y: PAPER.y + 470 };
/** A ponta para abaixo e à direita do rótulo, para a seta não cobrir "Riscos". */
const MOUSE_TO = { x: RISCOS_CENTER.x + 38, y: RISCOS_CENTER.y + 14 };

/** Selos do cabeçalho em 24 px: a fileira fica longe do rótulo "Nota Lance". */
const HEADER_BADGE: React.CSSProperties = { fontSize: 24, gap: 8, padding: "6px 16px" };

type Linha = { text: React.ReactNode; page: number };

const RESUMO: Linha[] = [
  { text: "Registro de preços para material de limpeza e higiene, em 18 itens.", page: 1 },
  { text: "Itens 1 a 18 exclusivos para ME/EPP.", page: 4 },
  { text: "Valor estimado de R$ 184.000.", page: 22 },
];

const RISCOS: Linha[] = [
  {
    text: (
      <>
        Marca e modelo obrigatórios na proposta;{" "}
        <span style={{ whiteSpace: "nowrap" }}>
          <Grifo start={T.grifo}>não aceita “similar”</Grifo>.
        </span>
      </>
    ),
    page: 20,
  },
  { text: "Amostra em até 3 dias úteis, se o pregoeiro pedir.", page: 19 },
  { text: "Multa de 10% sobre o pedido em caso de atraso.", page: 33 },
];

/* ------------------------------------------------------------------ */
/* Peças do card                                                       */
/* ------------------------------------------------------------------ */

/** Selo "pág. N" com pop e, opcionalmente, o pisca-lima de 400 ms. */
function Tag({ page, start, flashAt }: { page: number; start: number; flashAt?: number }) {
  const frame = useCurrentFrame();
  const s = pop(frame, start);
  const f =
    flashAt === undefined
      ? 0
      : interpolate(frame, [flashAt, flashAt + 3, flashAt + FLASH_FRAMES - 4, flashAt + FLASH_FRAMES], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return (
    <PageTag
      page={page}
      style={{
        opacity: progress(frame, start, 6),
        transform: `scale(${(0.6 + 0.4 * s) * (1 + 0.06 * f)})`,
        transformOrigin: "right center",
        background: interpolateColors(f, [0, 1], [color.papel, color.marcaTexto]),
        borderColor: interpolateColors(f, [0, 1], [color.linha, color.marcaTexto]),
        color: interpolateColors(f, [0, 1], [color.grafite, color.tinta]),
      }}
    />
  );
}

function Row({ linha, start, first, flashAt }: { linha: Linha; start: number; first: boolean; flashAt?: number }) {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 32,
        padding: "26px 0",
        borderTop: first ? undefined : `2px solid ${color.linha}`,
        ...fadeUp(frame, start, 12, 16),
      }}
    >
      <div style={{ fontSize: 28, lineHeight: 1.36, color: color.tinta, marginTop: 4, minWidth: 0 }}>{linha.text}</div>
      <Tag page={linha.page} start={start + TAG_DELAY} flashAt={flashAt} />
    </div>
  );
}

/** Abas em pílula; o fundo tinta da aba ativa desliza de Resumo para Riscos no clique. */
function Tabs() {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [T.clique, T.clique + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const left = interpolate(move, [0, 1], [tabX(0), tabX(2)]);
  const width = interpolate(move, [0, 1], [TABS[0].w, TABS[2].w]);
  // Leve "afundar" da aba no clique.
  const press = interpolate(frame, [T.clique - 2, T.clique + 1, T.clique + 6], [1, 0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: TABS_H,
        padding: TRACK_PAD,
        boxSizing: "border-box",
        borderRadius: radius.pill,
        background: color.muted,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: TRACK_PAD,
          left,
          width,
          height: TABS_H - TRACK_PAD * 2,
          borderRadius: radius.pill,
          background: color.tinta,
          transform: `scale(${press})`,
          boxShadow: "0 2px 6px rgba(15,27,45,0.18)",
        }}
      />
      {TABS.map((t, i) => {
        const on = i === 0 ? 1 - move : i === 2 ? move : 0;
        return (
          <div
            key={t.label}
            style={{
              position: "relative",
              width: t.w,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 500,
              color: interpolateColors(on, [0, 1], [color.grafite, color.papel]),
            }}
          >
            {t.label}
          </div>
        );
      })}
    </div>
  );
}

/** Barra fina que enche enquanto lê e vira "Lido em 58 s". */
function Leitura() {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [T.tabs, T.lido], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const barOut = progress(frame, T.lido, 6);
  const lido = progress(frame, T.lido + 2, 10);
  return (
    <div style={{ position: "relative", width: 200, height: TABS_H }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: TABS_H / 2 - 3,
          width: 160,
          height: 6,
          borderRadius: 3,
          background: color.linha,
          overflow: "hidden",
          opacity: 1 - barOut,
        }}
      >
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 3, background: color.tinta }} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: TABS_H,
          display: "flex",
          alignItems: "center",
          gap: 8,
          whiteSpace: "nowrap",
          color: color.grafite,
          opacity: lido,
          transform: `translateY(${(1 - lido) * 8}px)`,
        }}
      >
        <Check size={24} strokeWidth={2.5} color={color.vitoria} />
        <Mono style={{ fontSize: 24 }}>Lido em 58 s</Mono>
      </div>
    </div>
  );
}

function Edital() {
  const frame = useCurrentFrame();
  const resumoOut = fadeOut(frame, T.clique, 8);

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
        boxShadow: "0 4px 8px rgba(0,0,0,0.12), 0 48px 96px -32px rgba(0,0,0,0.55)",
        ...fadeUp(frame, T.paper, 18, 40),
      }}
    >
      {/* Cabeçalho, igual ao demo do site */}
      <div style={{ height: HEADER_H, display: "flex", justifyContent: "space-between", gap: 24 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Badge variant="exemplo">Exemplo</Badge>
            <span style={{ fontSize: 24, color: color.grafite, whiteSpace: "nowrap" }}>
              Prefeitura de [Município] · Pregão eletrônico
            </span>
          </div>
          <div style={{ marginTop: 12, fontFamily: font.serif, fontWeight: 600, fontSize: 46, lineHeight: 1.1 }}>
            Material de limpeza
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <Badge variant="vitoria" style={HEADER_BADGE}>
              <Check size={22} strokeWidth={2.5} />
              Vai
            </Badge>
            <Badge style={HEADER_BADGE}>Exclusiva ME/EPP</Badge>
            <Badge variant="prazo" style={HEADER_BADGE}>
              <CalendarClock size={22} strokeWidth={2} />
              Sessão em <Mono>12</Mono> dias
            </Badge>
          </div>
        </div>
        <NotaLance score={87} diameter={120} start={T.nota} duration={30} />
      </div>

      <div style={{ height: 2, marginTop: DIVIDER_GAP, background: color.linha }} />

      {/* Abas + leitura */}
      <div
        style={{
          position: "absolute",
          left: PAPER.pad,
          right: PAPER.pad,
          top: PAPER.pad + TABS_Y,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...fadeUp(frame, T.tabs, 12, 12),
        }}
      >
        <Tabs />
        <Leitura />
      </div>

      {/* Listas: Resumo sai no clique, Riscos entra */}
      <div style={{ position: "absolute", left: PAPER.pad, right: PAPER.pad, top: PAPER.pad + LIST_Y }}>
        {frame < T.clique + 10 && (
          <div style={{ position: "absolute", inset: 0, ...resumoOut }}>
            {RESUMO.map((l, i) => (
              <Row key={l.page} linha={l} start={T.resumo[i]} first={i === 0} flashAt={T.flash} />
            ))}
          </div>
        )}
        <div style={{ position: "absolute", inset: 0 }}>
          {RISCOS.map((l, i) => (
            <Row key={l.page} linha={l} start={T.riscos[i]} first={i === 0} />
          ))}
        </div>
      </div>
    </Paper>
  );
}

/** Ponteiro que entra pela borda direita do card, clica em Riscos e sai. */
function Mouse() {
  const frame = useCurrentFrame();
  if (frame < T.mouse) return null;
  const move = interpolate(frame, [T.mouse, T.clique - 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const x = interpolate(move, [0, 1], [MOUSE_FROM.x, MOUSE_TO.x]);
  const y = interpolate(move, [0, 1], [MOUSE_FROM.y, MOUSE_TO.y]);
  const out = progress(frame, T.mouseSai, 10, Easing.in(Easing.cubic));
  const opacity = progress(frame, T.mouse, 6) * (1 - out);
  return (
    <div style={{ position: "absolute", inset: 0, opacity, transform: `translate(${out * 24}px, ${out * 30}px)` }}>
      <Pointer x={x} y={y} clickAt={T.clique} />
    </div>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();
  const lime = progress(frame, T.flash, FLASH_FRAMES);

  return (
    <Stage dark>
      {/* Esquerda: kicker, título e texto */}
      <div style={{ position: "absolute", left: SAFE_X, top: 300, width: 600 }}>
        <Kicker dark style={fadeUp(frame, T.kicker, 15, 14)}>
          Leitura do edital
        </Kicker>
      </div>
      <div style={{ position: "absolute", left: SAFE_X, top: 360, width: 600 }}>
        <Title fontSize={76} style={{ color: color.papel, ...fadeUp(frame, T.title) }}>
          Edital entendido em <span style={{ color: color.marcaTexto, whiteSpace: "nowrap" }}>1 minuto</span>
        </Title>
      </div>
      <div style={{ position: "absolute", left: SAFE_X, top: 620, width: 600 }}>
        <Body dark fontSize={40} style={{ color: color.papel, ...fadeUp(frame, T.body) }}>
          A IA pode errar.
          <br />
          Por isso cada resposta mostra
          <br />
          <span
            style={{
              whiteSpace: "nowrap",
              color: interpolateColors(lime, [0, 1], [color.papel, color.marcaTexto]),
            }}
          >
            a página do edital
          </span>
          .
        </Body>
      </div>

      {/* Direita: o edital lido */}
      <Edital />
      <Mouse />
    </Stage>
  );
}
