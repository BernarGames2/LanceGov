import { useCurrentFrame } from "remotion";

import { fadeUp, pop, progress, sec } from "../design/anim";
import { Badge, Body, Grifo, Kicker, Mono, Paper, Stage, Title } from "../design/components";
import { SAFE_X, color } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("08-preco");

/**
 * Inícios (frames locais). O quadro 0 é o começo do slide de chegada (18 f);
 * os últimos 15 f sobrepõem o fade de saída, onde nada novo começa.
 */
const T = {
  kicker: sec(0.6),
  title: sec(0.8),
  paper: sec(1.0),
  grifo: sec(1.4),
  /** Primeiro ponto; os outros caem a cada 2 f. */
  pontos: sec(1.6),
  faixa: sec(2.4),
  faixaRotulo: sec(2.6),
  linhas: [sec(3.0), sec(3.3), sec(3.6)],
  body: sec(3.6),
} as const;

/** Folha à direita: x 900–1760, y 200–880. */
const PAPER = { left: 900, top: 200, width: 860, height: 680, padding: 40 } as const;

/** Eixo de preços: 720 px de R$ 10 a R$ 14, centrado na largura útil da folha. */
const AXIS = { width: 720, min: 10, max: 14 } as const;
const BAND_H = 64;
const DOT = 22;

const x = (v: number) => ((v - AXIS.min) / (AXIS.max - AXIS.min)) * AXIS.width;

/** Preços vencedores (R$) em compras parecidas. Exemplo. */
const PRECOS = [10.8, 11.2, 11.5, 11.7, 11.9, 12.1, 12.4, 12.9, 13.4];
const FAIXA = { de: 11.6, ate: 12.2 } as const;
const TICKS = [
  { v: 10, label: "R$ 10" },
  { v: 12, label: "R$ 12" },
  { v: 14, label: "R$ 14" },
];

/** A conta fecha: 11,60 − 9,40 − 0,95 = 1,25 e 12,20 − 9,40 − 0,95 = 1,85. */
const LINHAS = [
  { label: "Seu custo", valor: "R$ 9,40" },
  { label: "Impostos", valor: "R$ 0,95" },
  { label: "Sobra por unidade", valor: "R$ 1,25 a R$ 1,85", total: true },
];

/** Alturas do bloco do gráfico (px). O eixo fica no meio da faixa lima. */
const CHART = { rotulo: 40, gapRotulo: 14, ticksGap: 12, ticks: 30 } as const;
const AXIS_Y = CHART.rotulo + CHART.gapRotulo + BAND_H / 2;
const CHART_H = CHART.rotulo + CHART.gapRotulo + BAND_H + CHART.ticksGap + CHART.ticks;

/** Gráfico de faixa: pontos caindo no eixo e a faixa sugerida varrendo atrás deles. */
function FaixaChart() {
  const frame = useCurrentFrame();
  const band = progress(frame, T.faixa, 12);
  const bandX = x(FAIXA.de);
  const bandW = x(FAIXA.ate) - bandX;
  // Rótulo centrado sobre a faixa, preso às pontas do eixo.
  const rotuloW = 600;
  const rotuloX = Math.min(Math.max(bandX + bandW / 2 - rotuloW / 2, 0), AXIS.width - rotuloW);

  return (
    <div style={{ position: "relative", width: AXIS.width, height: CHART_H, margin: "0 auto" }}>
      {/* Rótulo da faixa sugerida */}
      <div
        style={{
          position: "absolute",
          left: rotuloX,
          top: 0,
          width: rotuloW,
          textAlign: "center",
          lineHeight: `${CHART.rotulo}px`,
          ...fadeUp(frame, T.faixaRotulo, 12, 12),
        }}
      >
        <Mono style={{ fontSize: 28, color: color.tinta, whiteSpace: "nowrap" }}>
          Faixa sugerida: R$ 11,60 a R$ 12,20
        </Mono>
      </div>

      {/* Eixo e marcas */}
      <div style={{ position: "absolute", left: 0, top: AXIS_Y - 1, width: AXIS.width, height: 2, background: color.linha }} />
      {TICKS.map((t) => (
        <div key={t.v}>
          <div
            style={{
              position: "absolute",
              left: x(t.v) - 1,
              top: AXIS_Y - 9,
              width: 2,
              height: 18,
              background: "rgba(74,85,101,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: x(t.v) - 60,
              width: 120,
              top: AXIS_Y + BAND_H / 2 + CHART.ticksGap,
              textAlign: "center",
              lineHeight: `${CHART.ticks}px`,
            }}
          >
            <Mono style={{ fontSize: 22, color: color.grafite }}>{t.label}</Mono>
          </div>
        </div>
      ))}

      {/* Faixa lima: varre da esquerda para a direita, atrás dos pontos e sobre o eixo (esconde a marca de R$ 12) */}
      <div
        style={{
          position: "absolute",
          left: bandX,
          top: AXIS_Y - BAND_H / 2,
          width: bandW * band,
          height: BAND_H,
          borderRadius: 10,
          background: color.marcaTexto,
        }}
      />

      {/* Pontos: caem no eixo em cascata, com mola */}
      {PRECOS.map((v, i) => {
        const start = T.pontos + i * 2;
        const s = pop(frame, start);
        return (
          <div
            key={v}
            style={{
              position: "absolute",
              left: x(v) - DOT / 2,
              top: AXIS_Y - DOT / 2,
              width: DOT,
              height: DOT,
              borderRadius: 999,
              background: color.tinta,
              opacity: 0.75 * progress(frame, start, 6),
              transform: `translateY(${(s - 1) * 70}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Preço para vencer (plano Pro): preços vencedores do item em compras
 * parecidas, a faixa sugerida e a conta da margem por unidade.
 */
export default function Scene() {
  const frame = useCurrentFrame();

  return (
    <Stage>
      {/* Coluna esquerda */}
      <div style={{ position: "absolute", left: SAFE_X, top: 296, width: 680 }}>
        <Kicker fontSize={38} style={fadeUp(frame, T.kicker)}>
          Plano Pro
        </Kicker>
        <Title fontSize={84} style={{ marginTop: 14, ...fadeUp(frame, T.title) }}>
          Preço para vencer <Grifo start={T.grifo}>com margem</Grifo>
        </Title>
        <Body fontSize={40} style={{ marginTop: 40, width: 640, ...fadeUp(frame, T.body) }}>
          Veja quanto o governo pagou em compras parecidas e quanto sobra para você.
        </Body>
      </div>

      {/* Folha do preço */}
      <div style={{ position: "absolute", left: PAPER.left, top: PAPER.top, ...fadeUp(frame, T.paper, 18, 40) }}>
        <Paper
          style={{
            width: PAPER.width,
            height: PAPER.height,
            padding: PAPER.padding,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Badge variant="exemplo">Exemplo</Badge>
            <span style={{ fontSize: 26, fontWeight: 500, whiteSpace: "nowrap" }}>
              Item 7 · Detergente neutro, galão 5 L
            </span>
          </div>
          <div style={{ marginTop: 14, fontSize: 26, color: color.grafite }}>Preços vencedores em compras parecidas</div>

          <div style={{ marginTop: 54 }}>
            <FaixaChart />
          </div>

          <div style={{ marginTop: "auto" }}>
            {LINHAS.map((l, i) => (
              <div
                key={l.label}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  padding: "18px 0",
                  borderTop: `2px solid ${l.total ? color.tinta : color.linha}`,
                  ...fadeUp(frame, T.linhas[i], 12, 16),
                }}
              >
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: l.total ? 500 : 400,
                    color: l.total ? color.tinta : color.grafite,
                  }}
                >
                  {l.label}
                </span>
                <Mono style={{ fontSize: 34, color: color.tinta }}>{l.valor}</Mono>
              </div>
            ))}
          </div>
        </Paper>
      </div>
    </Stage>
  );
}
