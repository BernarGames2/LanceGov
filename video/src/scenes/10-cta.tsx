import { Stage, Title } from "../design/components";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("10-cta");

/** Rascunho: a cena "10-cta" ainda vai ser construída. */
export default function Scene() {
  return (
    <Stage style={{ alignItems: "center", justifyContent: "center" }}>
      <Title>10-cta</Title>
    </Stage>
  );
}
