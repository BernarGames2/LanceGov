import { useCurrentFrame } from "remotion";

import { fadeUp, sec } from "../design/anim";
import { Body, Grifo, Stage, Title } from "../design/components";
import { SAFE_X } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("09-voce-decide");

/**
 * Inícios (frames locais). O quadro 0 é o começo do fade de chegada (15 f);
 * os últimos 18 f são o fade de saída para a chamada final em tinta, sem
 * nada novo.
 */
const T = {
  linha1: sec(0.4),
  linha2: sec(0.9),
  grifo: sec(1.5),
  body: sec(1.9),
} as const;

/**
 * "Você decide e participa": uma pausa tipográfica, sem interface. Coluna
 * central com a frase de apoio do site em duas linhas (a segunda grifada) e
 * a lembrança de que é a empresa, não a LanceGov, que envia a proposta e dá
 * os lances.
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
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          // Centro óptico um pouco acima do centro geométrico.
          paddingBottom: 24,
        }}
      >
        <Title fontSize={104} style={{ lineHeight: 1.25 }}>
          <div style={fadeUp(frame, T.linha1, 18, 24)}>A LanceGov prepara.</div>
          <div style={fadeUp(frame, T.linha2, 18, 24)}>
            <Grifo start={T.grifo}>Você decide e participa.</Grifo>
          </div>
        </Title>

        <Body
          fontSize={44}
          style={{
            marginTop: 52,
            maxWidth: 1300,
            textWrap: "balance",
            ...fadeUp(frame, T.body, 18, 24),
          }}
        >
          Sua empresa envia a proposta e dá os lances no portal oficial.
        </Body>
      </div>
    </Stage>
  );
}
