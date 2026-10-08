import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Fontes locais (public/fonts), subconjunto latino: cobre o português.
 * Carregar daqui evita depender da rede na hora de renderizar.
 */
export const fontsReady = Promise.all([
  loadFont({ family: "Fraunces", url: staticFile("fonts/Fraunces-600.woff2"), weight: "600" }),
  loadFont({ family: "Inter", url: staticFile("fonts/Inter-variable.woff2"), weight: "400 600" }),
  loadFont({ family: "IBM Plex Mono", url: staticFile("fonts/IBMPlexMono-500.woff2"), weight: "500" }),
]);
