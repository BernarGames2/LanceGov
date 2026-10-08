import { useCurrentFrame } from "remotion";

import { fadeUp, pop, sec } from "../design/anim";
import { Body, Button, Mono, Stage, Title } from "../design/components";
import { SAFE_X, color, font, size } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("10-cta");

/**
 * Inícios (frames locais). O quadro 0 é o começo do fade de chegada (18 f,
 * papel → tinta). Do segundo 4 ao 10 tudo fica parado: é o último quadro do
 * vídeo.
 */
const T = {
  abertura: sec(0.5),
  titulo: sec(1.1),
  body: sec(2.0),
  pilula: sec(2.8),
  logo: sec(3.4),
} as const;

/**
 * Wordmark para fundo tinta. O `Logo dark` do kit pinta "Lance" em tinta com
 * o grifo cobrindo só a parte de baixo das letras, e o topo some no fundo
 * escuro. Aqui segue a regra das cenas em tinta: o trecho grifado vira texto
 * lima ("Lance") e o resto fica em papel ("Gov").
 */
function LogoEscuro({ fontSize }: { fontSize: number }) {
  return (
    <span
      style={{
        fontFamily: font.serif,
        fontWeight: 600,
        fontSize,
        letterSpacing: "-0.01em",
        color: color.papel,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: color.marcaTexto }}>Lance</span>Gov
    </span>
  );
}

/**
 * Chamada final em tinta, como a seção final do site: a linha "O governo
 * compra todo dia.", o convite com "Raio-X grátis" em lima (texto colorido,
 * não o Grifo, porque o fundo é escuro), a nota de "sem cartão" e a pílula
 * lima com o endereço. O Logo fecha a cena na base.
 */
export default function Scene() {
  const frame = useCurrentFrame();
  const s = pop(frame, T.pilula);

  return (
    <Stage dark>
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 196,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: font.serif,
            fontWeight: 500,
            fontSize: size.h2,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: color.papelSuave,
            ...fadeUp(frame, T.abertura, 18, 24),
          }}
        >
          O governo compra todo dia.
        </div>

        <Title
          fontSize={size.display}
          style={{ marginTop: 14, color: color.papel, whiteSpace: "nowrap", ...fadeUp(frame, T.titulo, 18, 24) }}
        >
          Faça o <span style={{ color: color.marcaTexto }}>Raio-X grátis</span>
        </Title>

        <Body dark fontSize={40} style={{ marginTop: 40, ...fadeUp(frame, T.body, 18, 24) }}>
          Sem cartão e sem cadastro. Resultado em segundos.
        </Body>

        <div
          style={{
            marginTop: 54,
            opacity: s,
            transform: `translateY(${(1 - s) * 16}px) scale(${0.92 + s * 0.08})`,
          }}
        >
          <Button variant="primario" style={{ height: 120, padding: "0 64px" }}>
            <Mono style={{ fontSize: 56, letterSpacing: "-0.01em" }}>lancegov.com.br</Mono>
          </Button>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 818,
          display: "flex",
          justifyContent: "center",
          lineHeight: 1,
          ...fadeUp(frame, T.logo, 18, 24),
        }}
      >
        <LogoEscuro fontSize={64} />
      </div>
    </Stage>
  );
}
