import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

import Abertura, { duration as d01 } from "./scenes/01-abertura";
import Cnpj, { duration as d02 } from "./scenes/02-cnpj";
import RaioX, { duration as d03 } from "./scenes/03-raio-x";
import Radar, { duration as d04 } from "./scenes/04-radar";
import Edital, { duration as d05 } from "./scenes/05-edital";
import Cofre, { duration as d06 } from "./scenes/06-cofre";
import WhatsApp, { duration as d07 } from "./scenes/07-whatsapp";
import Preco, { duration as d08 } from "./scenes/08-preco";
import VoceDecide, { duration as d09 } from "./scenes/09-voce-decide";
import Cta, { duration as d10 } from "./scenes/10-cta";
import { TIMING, type SceneId, type Transition } from "./scenes/timing";

const SCENES: { id: SceneId; Component: () => React.ReactNode; frames: number }[] = [
  { id: "01-abertura", Component: Abertura, frames: d01 },
  { id: "02-cnpj", Component: Cnpj, frames: d02 },
  { id: "03-raio-x", Component: RaioX, frames: d03 },
  { id: "04-radar", Component: Radar, frames: d04 },
  { id: "05-edital", Component: Edital, frames: d05 },
  { id: "06-cofre", Component: Cofre, frames: d06 },
  { id: "07-whatsapp", Component: WhatsApp, frames: d07 },
  { id: "08-preco", Component: Preco, frames: d08 },
  { id: "09-voce-decide", Component: VoceDecide, frames: d09 },
  { id: "10-cta", Component: Cta, frames: d10 },
];

/** As apresentações têm props diferentes; a TransitionSeries só precisa de uma. */
type AnyPresentation = ReturnType<typeof fade>;

function presentation(t: Transition): AnyPresentation {
  switch (t.type) {
    case "slide":
      return slide({ direction: t.direction }) as unknown as AnyPresentation;
    case "wipe":
      return wipe({ direction: t.direction }) as unknown as AnyPresentation;
    default:
      return fade();
  }
}

/** Duração total: soma das sequências menos as sobreposições das transições. */
export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames - TIMING[s.id].out.frames, 0);

/** "Como a LanceGov funciona": 10 cenas, 120 s, sem áudio. */
export function ComoFunciona() {
  return (
    <TransitionSeries>
      {SCENES.flatMap(({ id, Component, frames }) => {
        const out = TIMING[id].out;
        const items = [
          <TransitionSeries.Sequence key={id} durationInFrames={frames}>
            <Component />
          </TransitionSeries.Sequence>,
        ];
        if (out.type !== "none") {
          items.push(
            <TransitionSeries.Transition
              key={`${id}-saida`}
              presentation={presentation(out)}
              timing={linearTiming({ durationInFrames: out.frames })}
            />,
          );
        }
        return items;
      })}
    </TransitionSeries>
  );
}
