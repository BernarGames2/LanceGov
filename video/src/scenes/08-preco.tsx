import { Stage, Title } from "../design/components";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("08-preco");

/** Rascunho: a cena "08-preco" ainda vai ser construída. */
export default function Scene() {
  return (
    <Stage style={{ alignItems: "center", justifyContent: "center" }}>
      <Title>08-preco</Title>
    </Stage>
  );
}
