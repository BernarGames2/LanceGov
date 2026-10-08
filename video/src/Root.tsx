import { Composition } from "remotion";

import { fontsReady } from "./design/fonts";
import { VIDEO } from "./design/theme";
import { Kit } from "./Kit";

void fontsReady;

export const Root = () => (
  <>
    <Composition id="Kit" component={Kit} durationInFrames={90} {...VIDEO} />
  </>
);
