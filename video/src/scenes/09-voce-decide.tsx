import { Stage, Title } from "../design/components";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("09-voce-decide");

/** Rascunho: a cena "09-voce-decide" ainda vai ser construída. */
export default function Scene() {
  return (
    <Stage style={{ alignItems: "center", justifyContent: "center" }}>
      <Title>09-voce-decide</Title>
    </Stage>
  );
}
