import { Stage, Title } from "../design/components";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("06-cofre");

/** Rascunho: a cena "06-cofre" ainda vai ser construída. */
export default function Scene() {
  return (
    <Stage style={{ alignItems: "center", justifyContent: "center" }}>
      <Title>06-cofre</Title>
    </Stage>
  );
}
