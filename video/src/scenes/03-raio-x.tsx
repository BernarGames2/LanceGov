import { interpolateColors, useCurrentFrame } from "remotion";

import { countUp, fadeUp, pop, progress, sec } from "../design/anim";
import { Badge, Grifo, Kicker, Mono, Paper, Stage, Title } from "../design/components";
import { color, font, SAFE_X } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("03-raio-x");

/**
 * Raio-X do CNPJ: o painel da página /raio-x do site, com os quatro números
 * do EXEMPLO (src/lib/raio-x.ts) subindo em cascata. Depois o bloco das
 * disputas exclusivas ME/EPP ganha o grifo e a borda tinta.
 */
const T = {
  kicker: sec(0.6),
  title: sec(0.8),
  titleGrifo: sec(1.6),
  paper: sec(1.2),
  blocks: [sec(1.8), sec(2.1), sec(2.4), sec(2.7)],
  destaque: sec(4.4),
} as const;

const PAPER = { x: SAFE_X, y: 450, w: 1600, h: 420, pad: 40 } as const;
const BLOCK = { w: 350, h: 250, gap: 40 } as const;
const COUNT_FRAMES = 36;

/**
 * "R$ 3,9 mi" a partir de décimos de milhão (39 → 3,9). O número fica em 64 px;
 * "R$" e "mi" em 40 px para caber no bloco de 350 px. A vírgula do mono é
 * apertada para "3,9" não ler como "3 , 9".
 */
function Reais({ tenths }: { tenths: number }) {
  const unit: React.CSSProperties = { fontSize: 40 };
  return (
    <>
      <span style={unit}>R$ </span>
      {Math.floor(tenths / 10)}
      <span style={{ margin: "0 -0.14em" }}>,</span>
      {tenths % 10}
      <span style={unit}> mi</span>
    </>
  );
}

type Stat = {
  target: number;
  render: (value: number) => React.ReactNode;
  label: React.ReactNode;
  destaque?: boolean;
};

const STATS: Stat[] = [
  { target: 41, render: (v) => v, label: "licitações abertas compatíveis" },
  { target: 39, render: (v) => <Reais tenths={v} />, label: "em valor total aberto agora" },
  {
    target: 17,
    render: (v) => v,
    label: <Grifo start={T.destaque}>exclusivas para ME/EPP</Grifo>,
    destaque: true,
  },
  {
    target: 52,
    render: (v) => <Reais tenths={v} />,
    label: "em 63 licitações que passaram nas últimas 4 semanas",
  },
];

function StatBlock({ stat, start }: { stat: Stat; start: number }) {
  const frame = useCurrentFrame();
  const s = pop(frame, start);
  const value = countUp(frame, start, stat.target, COUNT_FRAMES);
  const hl = stat.destaque ? progress(frame, T.destaque, 12) : 0;
  const borderColor = interpolateColors(hl, [0, 1], [color.linha, color.tinta]);

  return (
    // Vaga cinza por baixo, como o carregamento da página /raio-x: o bloco "assenta" nela.
    <div style={{ width: BLOCK.w, height: BLOCK.h, borderRadius: 20, background: color.muted }}>
      <div
        style={{
          boxSizing: "border-box",
          width: BLOCK.w,
          height: BLOCK.h,
          padding: "30px 30px 26px",
          background: color.papel,
          border: `2px solid ${borderColor}`,
          borderRadius: 20,
          // +1 px por dentro da borda: 3 px tinta no destaque, sem mexer no layout.
          boxShadow: `inset 0 0 0 1px ${interpolateColors(hl, [0, 1], ["rgba(15,27,45,0)", color.tinta])}`,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          opacity: s,
          transform: `translateY(${(1 - s) * 22}px) scale(${0.94 + s * 0.06})`,
        }}
      >
        <Mono style={{ fontSize: 64, lineHeight: 1, color: color.tinta, whiteSpace: "nowrap" }}>
          {stat.render(value)}
        </Mono>
        <div style={{ fontFamily: font.sans, fontSize: 28, lineHeight: 1.3, color: color.grafite }}>{stat.label}</div>
      </div>
    </div>
  );
}

export default function Scene() {
  const frame = useCurrentFrame();

  return (
    <Stage>
      {/* Topo: kicker + título */}
      <div style={{ position: "absolute", left: SAFE_X, top: 150, width: 1600 }}>
        <Kicker style={fadeUp(frame, T.kicker, 15, 14)}>Raio-X do CNPJ</Kicker>
        <Title fontSize={72} style={{ marginTop: 18, ...fadeUp(frame, T.title) }}>
          As licitações abertas que
          <br />
          <Grifo start={T.titleGrifo}>combinam com a sua empresa</Grifo>
        </Title>
      </div>

      {/* Painel do Raio-X */}
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
          justifyContent: "space-between",
          ...fadeUp(frame, T.paper, 18, 32),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Badge variant="exemplo">Exemplo</Badge>
            <Mono style={{ fontSize: 40, lineHeight: 1, letterSpacing: "0.01em", color: color.tinta }}>
              12.ABC.345/01DE-35
            </Mono>
          </div>
          <div style={{ fontSize: 26, color: color.grafite, whiteSpace: "nowrap" }}>
            CNAE <Mono style={{ color: color.tinta }}>4649-4/08</Mono> · Porte EPP
          </div>
        </div>

        <div style={{ display: "flex", gap: BLOCK.gap }}>
          {STATS.map((stat, i) => (
            <StatBlock key={i} stat={stat} start={T.blocks[i]} />
          ))}
        </div>
      </Paper>
    </Stage>
  );
}
