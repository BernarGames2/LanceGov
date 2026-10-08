// Gera as versões do site a partir do master, em 1080p (nítido no modal em
// telas retina): H.264 com "faststart" para começar a tocar antes de baixar
// tudo, e uma alternativa VP9 (WebM).
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "out", "como-funciona-master.mp4");
const outDir = path.join(root, "..", "public", "video");
mkdirSync(outDir, { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-i", input,
    "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-profile:v", "high", "-level:v", "4.0", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-an",
    path.join(outDir, "como-funciona.mp4"),
  ],
  { stdio: "inherit" },
);
console.log("→ public/video/como-funciona.mp4");

// Alternativa VP9 para navegadores sem H.264 (algumas versões do Chromium no Linux).
execFileSync(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-i", input,
    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4",
    "-pix_fmt", "yuv420p", "-an",
    path.join(outDir, "como-funciona.webm"),
  ],
  { stdio: "inherit" },
);
console.log("→ public/video/como-funciona.webm");
