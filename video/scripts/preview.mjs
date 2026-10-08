// Renderiza quadros de UMA cena isolada, para conferir o visual sem renderizar o vídeo todo.
//
//   node scripts/preview.mjs <id-da-cena> [quadro ...] [--out=pasta]
//
// Sem quadros, gera 9 quadros espaçados e uma folha de contato (contato.png).
// Cada cena vive em src/scenes/<id>.tsx e exporta `default` (componente) e `duration` (frames).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--") && !/^\d+$/.test(a));
if (!id) {
  console.error("uso: node scripts/preview.mjs <id-da-cena> [quadros...] [--out=pasta]");
  process.exit(1);
}
const outArg = args.find((a) => a.startsWith("--out="));
const outDir = path.resolve(outArg ? outArg.slice(6) : path.join(root, "out", "preview", id));
mkdirSync(outDir, { recursive: true });

const entryDir = path.join(root, ".preview");
mkdirSync(entryDir, { recursive: true });
const entry = path.join(entryDir, `${id}.tsx`);
writeFileSync(
  entry,
  `import { Composition, registerRoot } from "remotion";
import "../src/design/fonts";
import { VIDEO } from "../src/design/theme";
import Scene, { duration } from "../src/scenes/${id}";

registerRoot(() => <Composition id="Cena" component={Scene} durationInFrames={duration} {...VIDEO} />);
`,
);

const browserExecutable =
  process.env.REMOTION_BROWSER ??
  ["/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"].find((p) => existsSync(p)) ??
  null;

const serveUrl = await bundle({ entryPoint: entry, publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "Cena", browserExecutable });
const total = composition.durationInFrames;

let frames = args.filter((a) => /^\d+$/.test(a)).map(Number);
if (frames.length === 0) {
  frames = Array.from({ length: 9 }, (_, i) => Math.min(total - 1, Math.round((i * (total - 1)) / 8)));
}
frames = frames.filter((f) => f < total);

const files = [];
for (const frame of frames) {
  const output = path.join(outDir, `quadro-${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, imageFormat: "png" });
  files.push(output);
  console.log(`quadro ${frame}/${total - 1} (${(frame / 30).toFixed(2)} s) → ${output}`);
}

if (files.length > 1) {
  const sheet = path.join(outDir, "contato.png");
  const cols = 3;
  const rows = Math.ceil(files.length / cols);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error",
    ...files.flatMap((f) => ["-i", f]),
    "-filter_complex",
    files.map((_, i) => `[${i}:v]scale=640:360[s${i}]`).join(";") +
      ";" + files.map((_, i) => `[s${i}]`).join("") +
      `xstack=inputs=${files.length}:layout=` +
      files.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join("|") +
      (files.length < cols * rows ? `:fill=white` : ""),
    sheet,
  ]);
  console.log(`folha de contato → ${sheet}`);
}
console.log(`duração: ${total} quadros (${(total / 30).toFixed(2)} s)`);
