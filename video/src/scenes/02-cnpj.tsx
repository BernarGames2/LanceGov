import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { fadeUp, pop, progress, sec, typed } from "../design/anim";
import { Badge, Body, Button, Grifo, Kicker, Mono, Paper, Pointer, Stage, TextField, Title } from "../design/components";
import { SAFE_X, color, size } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("02-cnpj");

const CNPJ = "12.ABC.345/01DE-35";

/** Inícios (frames locais). O quadro 0 é o começo do fade de chegada (15 f). */
const T = {
  kicker: sec(0.4),
  title: sec(0.6),
  grifo: sec(1.2),
  direita: sec(0.9), // cascata de 3 f: Exemplo, campo, botão, nota
  digita: sec(1.3),
  mouse: sec(2.7),
  clique: sec(3.4),
  perfil: sec(3.6),
  cnae: sec(3.7),
  body: sec(3.8),
  chips: [sec(3.9), sec(4.1), sec(4.3)],
} as const;

/**
 * Geometria da coluna direita (px do quadro 1920×1080). A pilha toda
 * (Exemplo → perfil) fica centrada no quadro quando o perfil aparece.
 */
const R = {
  x: 960,
  w: 800,
  badgeY: 214,
  fieldY: 268,
  buttonY: 400,
  notaY: 518,
  perfilY: 600,
} as const;
const BUTTON_H = 96;
const BUTTON_W = 612;

/**
 * Ponteiro: sai de baixo e para no centro do botão. A ponta fica um pouco
 * abaixo e à direita do centro exato para a seta não cobrir o rótulo.
 */
const MOUSE_FROM = { x: 1560, y: 1000 };
const MOUSE_TO = { x: R.x + BUTTON_W / 2 + 30, y: R.buttonY + BUTTON_H / 2 + 12 };

/** Chip do perfil que entra com uma mola curta. */
function Chip({ start, children }: { start: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const s = pop(frame, start);
  return (
    <Badge
      style={{
        fontSize: 24,
        padding: "6px 16px",
        opacity: progress(frame, start, 8),
        transform: `translateY(${(1 - s) * 12}px) scale(${0.94 + s * 0.06})`,
      }}
    >
      {children}
    </Badge>
  );
}

/**
 * Passo 1: informe seu CNPJ. Título à esquerda; à direita o formulário do
 * site recebe o CNPJ de exemplo, o clique dispara o carregamento e o perfil
 * da empresa aparece numa folha de papel.
 */
export default function Scene() {
  const frame = useCurrentFrame();

  // Ponteiro: desliza 0,6 s com easing out, clica e depois sai de cena.
  const mouseP = progress(frame, T.mouse, sec(0.6), Easing.out(Easing.cubic));
  const mouseX = interpolate(mouseP, [0, 1], [MOUSE_FROM.x, MOUSE_TO.x]);
  const mouseY = interpolate(mouseP, [0, 1], [MOUSE_FROM.y, MOUSE_TO.y]);
  const mouseIn = progress(frame, T.mouse, 6);
  const mouseOut = progress(frame, T.clique + 8, 10);
  const mouseDrift = mouseOut * 18;

  // Clique: o botão afunda para 0,97 por 4 f e o ícone vira o loader.
  const pressed = interpolate(frame, [T.clique, T.clique + 2, T.clique + 6, T.clique + 9], [1, 0.97, 0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const loading = frame >= T.clique;
  const spin = (frame - T.clique) * 4;

  // Folha do perfil sobe com mola.
  const perfil = pop(frame, T.perfil);

  return (
    <Stage>
      {/* Coluna esquerda */}
      <div style={{ position: "absolute", left: SAFE_X, top: 376, width: 720 }}>
        <Kicker fontSize={38} style={fadeUp(frame, T.kicker)}>
          Passo 1
        </Kicker>
        <Title fontSize={size.h1} style={{ marginTop: 18, ...fadeUp(frame, T.title) }}>
          Informe <Grifo start={T.grifo}>seu CNPJ</Grifo>
        </Title>
        <Body fontSize={40} style={{ marginTop: 36, width: 700, ...fadeUp(frame, T.body) }}>
          A LanceGov monta o perfil da empresa com CNAEs, porte e região.
        </Body>
      </div>

      {/* Coluna direita: formulário */}
      <div style={{ position: "absolute", left: R.x, top: R.badgeY, ...fadeUp(frame, T.direita) }}>
        <Badge variant="exemplo">Exemplo</Badge>
      </div>
      <div style={{ position: "absolute", left: R.x, top: R.fieldY, ...fadeUp(frame, T.direita + 3) }}>
        <TextField value={typed(CNPJ, frame, T.digita, 14)} placeholder="Digite seu CNPJ" width={R.w} focused={!loading} />
      </div>
      <div style={{ position: "absolute", left: R.x, top: R.buttonY, ...fadeUp(frame, T.direita + 6) }}>
        <Button style={{ width: BUTTON_W, height: BUTTON_H, padding: 0, transform: `scale(${pressed})` }}>
          Ver minhas licitações grátis
          {loading ? (
            <LoaderCircle size={36} strokeWidth={2.5} style={{ transform: `rotate(${spin}deg)` }} />
          ) : (
            <ArrowRight size={36} strokeWidth={2.5} />
          )}
        </Button>
      </div>
      <div
        style={{
          position: "absolute",
          left: R.x,
          top: R.notaY,
          width: R.w,
          fontSize: 26,
          lineHeight: 1.35,
          whiteSpace: "nowrap",
          color: color.grafite,
          ...fadeUp(frame, T.direita + 9),
        }}
      >
        Grátis, sem cartão e sem cadastro. Resultado em segundos.
      </div>

      {/* Coluna direita: perfil da empresa */}
      <div
        style={{
          position: "absolute",
          left: R.x,
          top: R.perfilY,
          width: R.w,
          opacity: progress(frame, T.perfil, 8),
          transform: `translateY(${(1 - perfil) * 60}px) scale(${0.97 + perfil * 0.03})`,
          transformOrigin: "50% 100%",
        }}
      >
        <Paper style={{ padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Badge variant="exemplo">Exemplo</Badge>
            <span style={{ fontSize: 30, fontWeight: 500 }}>Perfil da empresa</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 30, lineHeight: 1.3, ...fadeUp(frame, T.cnae, 14, 12) }}>
            Comércio atacadista de higiene e limpeza
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Chip start={T.chips[0]}>
              CNAE <Mono>4649-4/08</Mono>
            </Chip>
            <Chip start={T.chips[1]}>Porte EPP</Chip>
            <Chip start={T.chips[2]}>Região de [Município]</Chip>
          </div>
        </Paper>
      </div>

      {/* Ponteiro do mouse */}
      {frame >= T.mouse && (
        <div style={{ position: "absolute", inset: 0, opacity: mouseIn * (1 - mouseOut) }}>
          <Pointer x={mouseX + mouseDrift} y={mouseY + mouseDrift} clickAt={T.clique} />
        </div>
      )}
    </Stage>
  );
}
