import { Easing, interpolate, interpolateColors, useCurrentFrame } from "remotion";

import { fadeUp, pop, progress, sec } from "../design/anim";
import { Body, Grifo, Kicker, OpportunityCard, Stage, Title, type Oportunidade } from "../design/components";
import { color, SAFE_X, shadow } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("04-radar");

/**
 * Passo 2 · Radar: uma esteira de tiras-esqueleto sobe rápido (o radar
 * varrendo os processos) e dá lugar a dois cartões de exemplo, um "Vai"
 * com Nota 87 e um "Não vai" com Nota 36.
 */
const T = {
  kicker: sec(0.5),
  title: sec(0.7),
  titleGrifo: sec(1.3),
  esteira: sec(0.6),
  esteiraFim: sec(1.8),
  esteiraSai: sec(1.8),
  cardA: sec(2.2),
  notaA: sec(2.4),
  cardB: sec(3.0),
  notaB: sec(3.2),
  body: sec(4.0),
  bodyGrifo: sec(5.2),
} as const;

/** 800 px (e não 760) para os selos do cartão A caberem numa linha e o objeto do B não quebrar. */
const RIGHT_X = 960;
const CARD_W = 800;
/** Topo dos cartões: o par (≈384 + 32 + ≈442 px) fica centrado na altura. */
const CARD_A_TOP = 111;
const CARD_B_TOP = 527;

/**
 * Grifo do kit, mas o texto herda o grafite do rótulo e só passa a tinta junto
 * com a passada do lima (o Grifo do kit pinta de tinta desde o início).
 */
function GrifoNoTexto({ children, start }: { children: React.ReactNode; start: number }) {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 12);
  return (
    <span
      style={{
        color: interpolateColors(p, [0, 1], [color.grafite, color.tinta]),
        backgroundImage: `linear-gradient(${color.marcaTexto}, ${color.marcaTexto})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        backgroundSize: `${p * 100}% 0.62em`,
        padding: "0 0.06em",
        margin: "0 -0.06em",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

const CARD_A: Oportunidade = {
  orgao: "Prefeitura de [Município]",
  objeto: "Material de limpeza",
  modalidade: "Pregão eletrônico",
  valor: "R$ 184.000",
  participacao: "Exclusiva ME/EPP",
  nota: 87,
  vai: true,
  dias: 12,
};

const CARD_B: Oportunidade = {
  orgao: "Hospital Universitário",
  objeto: "Saneantes de uso hospitalar",
  modalidade: "Pregão eletrônico",
  valor: "R$ 540.000",
  participacao: "Ampla concorrência",
  nota: 36,
  vai: false,
  dias: 21,
};

/* ------------------------------------------------------------------ */
/* Esteira do radar                                                    */
/* ------------------------------------------------------------------ */

const STRIP = { h: 56, gap: 16, count: 12 } as const;
/** Larguras fixas (px) das duas barras de cada tira: sem Math.random. */
const BARS: [number, number][] = [
  [300, 120],
  [220, 150],
  [360, 96],
  [260, 132],
  [330, 110],
  [190, 160],
  [280, 104],
  [350, 140],
  [240, 118],
  [310, 150],
  [200, 100],
  [340, 128],
];

function Strip({ bars }: { bars: [number, number] }) {
  const bar: React.CSSProperties = { height: 14, borderRadius: 7, background: color.linha };
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: CARD_W,
        height: STRIP.h,
        borderRadius: 14,
        background: color.folha,
        border: `2px solid ${color.linha}`,
        boxShadow: "0 1px 2px rgba(15,27,45,0.04), 0 10px 24px -14px rgba(15,27,45,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "0 22px 0 26px",
      }}
    >
      <div style={{ ...bar, width: bars[0] }} />
      <div style={{ ...bar, width: bars[1] }} />
      <div style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 999, background: color.linha }} />
    </div>
  );
}

function Esteira() {
  const frame = useCurrentFrame();
  if (frame < T.esteira || frame > T.esteiraSai + 10) return null;

  const total = STRIP.count * STRIP.h + (STRIP.count - 1) * STRIP.gap;
  // Base escolhida para a esteira nascer abaixo da borda (+500) e parar centrada (−600).
  const base = (1080 - total) / 2 + 600;
  const y = interpolate(frame, [T.esteira, T.esteiraFim], [500, -600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = 0.6 * progress(frame, T.esteira, 6) * (1 - progress(frame, T.esteiraSai, 8, Easing.in(Easing.cubic)));
  const fade = "linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)";

  return (
    <div
      style={{
        position: "absolute",
        left: RIGHT_X - 40,
        top: 0,
        width: CARD_W + 80,
        height: 1080,
        overflow: "hidden",
        WebkitMaskImage: fade,
        maskImage: fade,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 40,
          top: base,
          display: "flex",
          flexDirection: "column",
          gap: STRIP.gap,
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        {BARS.map((bars, i) => (
          <Strip key={i} bars={bars} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cartões                                                             */
/* ------------------------------------------------------------------ */

function Card({ o, top, start, notaStart }: { o: Oportunidade; top: number; start: number; notaStart: number }) {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const s = pop(frame, start);
  return (
    <div
      style={{
        position: "absolute",
        left: RIGHT_X,
        top,
        opacity: s,
        transform: `translateY(${(1 - s) * 36}px) scale(${0.95 + s * 0.05})`,
      }}
    >
      <OpportunityCard
        o={o}
        exemplo
        notaStart={notaStart}
        style={{ boxSizing: "border-box", width: CARD_W, boxShadow: shadow.folha }}
      />
    </div>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();

  return (
    <Stage>
      {/* Esquerda: kicker, título e texto */}
      <div style={{ position: "absolute", left: SAFE_X, top: 280, width: 720 }}>
        <Kicker style={fadeUp(frame, T.kicker, 15, 14)}>Passo 2 · Radar</Kicker>
        <Title fontSize={84} style={{ marginTop: 22, ...fadeUp(frame, T.title) }}>
          Receba as
          <br />
          <Grifo start={T.titleGrifo}>oportunidades certas</Grifo>
        </Title>
        <Body fontSize={40} style={{ marginTop: 40, width: 700, ...fadeUp(frame, T.body) }}>
          Cada licitação chega com a{" "}
          <span style={{ color: color.tinta, fontWeight: 500, whiteSpace: "nowrap" }}>Nota Lance</span>, de 0 a 100, e a
          recomendação:{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            <GrifoNoTexto start={T.bodyGrifo}>vai ou não vai</GrifoNoTexto>.
          </span>
        </Body>
      </div>

      {/* Direita: radar varrendo e os dois cartões */}
      <Esteira />
      <Card o={CARD_A} top={CARD_A_TOP} start={T.cardA} notaStart={T.notaA} />
      <Card o={CARD_B} top={CARD_B_TOP} start={T.cardB} notaStart={T.notaB} />
    </Stage>
  );
}
