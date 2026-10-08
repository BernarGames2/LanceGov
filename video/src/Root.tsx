import { Composition } from "remotion";

import { ComoFunciona, TOTAL_FRAMES } from "./ComoFunciona";
import { fontsReady } from "./design/fonts";
import { VIDEO } from "./design/theme";

void fontsReady;

export const Root = () => (
  <Composition id="ComoFunciona" component={ComoFunciona} durationInFrames={TOTAL_FRAMES} {...VIDEO} />
);
