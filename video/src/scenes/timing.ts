import { sec } from "../design/anim";

/**
 * Tempo de cada cena (segundos de tela, contados do fim da cena anterior) e a
 * transição de saída. A sequência de cada cena dura segundos + frames da
 * transição de saída, porque a transição sobrepõe o começo da próxima cena.
 * Total: 120 s = 3600 frames.
 */
export type Transition =
  | { type: "fade"; frames: number }
  | { type: "slide"; frames: number; direction: "from-right" | "from-left" | "from-top" | "from-bottom" }
  | { type: "wipe"; frames: number; direction: "from-top" | "from-bottom" | "from-left" | "from-right" }
  | { type: "none"; frames: 0 };

export const TIMING = {
  "01-abertura": { seconds: 9.5, out: { type: "fade", frames: 15 } },
  "02-cnpj": { seconds: 10.5, out: { type: "slide", frames: 18, direction: "from-right" } },
  "03-raio-x": { seconds: 11, out: { type: "fade", frames: 15 } },
  "04-radar": { seconds: 13, out: { type: "wipe", frames: 18, direction: "from-bottom" } },
  "05-edital": { seconds: 16, out: { type: "wipe", frames: 18, direction: "from-top" } },
  "06-cofre": { seconds: 13, out: { type: "fade", frames: 15 } },
  "07-whatsapp": { seconds: 17.5, out: { type: "slide", frames: 18, direction: "from-right" } },
  "08-preco": { seconds: 11, out: { type: "fade", frames: 15 } },
  // Papel → tinta com cortina, como 04 → 05 (um fade passaria por um cinza chapado).
  "09-voce-decide": { seconds: 8.5, out: { type: "wipe", frames: 18, direction: "from-bottom" } },
  "10-cta": { seconds: 10, out: { type: "none", frames: 0 } },
} as const satisfies Record<string, { seconds: number; out: Transition }>;

export type SceneId = keyof typeof TIMING;

/** Frames da sequência da cena (inclui a sobreposição da transição de saída). */
export function sceneFrames(id: SceneId) {
  return sec(TIMING[id].seconds) + TIMING[id].out.frames;
}
