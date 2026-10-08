import { useCurrentFrame } from "remotion";

import { fadeUp, sec } from "../design/anim";
import { Body, Grifo, Logo, Stage, Title } from "../design/components";
import { SAFE_X, size } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("01-abertura");

/** Inícios (frames locais). O quadro 0 é o pôster: só o Logo aparece. */
const T = {
  linha1: sec(0.4),
  linha2: sec(0.9),
  grifo: sec(1.5),
  tagline: sec(2.0),
} as const;

/**
 * Abertura: a promessa. Uma coluna central com muito ar, como a abertura de
 * um filme de produto: Logo, headline em duas linhas com o grifo lima em
 * "Leia menos edital" e a assinatura em grafite.
 */
export default function Scene() {
  const frame = useCurrentFrame();

  return (
    <Stage>
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 216,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Logo fixo desde o quadro 0 (pôster). */}
        <div style={{ lineHeight: 1 }}>
          <Logo fontSize={72} />
        </div>

        <Title fontSize={size.display} style={{ marginTop: 64, lineHeight: 1.12 }}>
          <div style={fadeUp(frame, T.linha1, 18, 24)}>Ganhe mais licitações.</div>
          <div style={fadeUp(frame, T.linha2, 18, 24)}>
            <Grifo start={T.grifo}>Leia menos edital</Grifo>.
          </div>
        </Title>

        <Body
          fontSize={44}
          style={{
            marginTop: 56,
            maxWidth: 1300,
            textWrap: "balance",
            ...fadeUp(frame, T.tagline, 18, 24),
          }}
        >
          A IA que encontra, lê e prepara as licitações que sua empresa pode vencer.
        </Body>
      </div>
    </Stage>
  );
}
