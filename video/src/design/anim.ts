import { Easing, interpolate, spring } from "remotion";

import { VIDEO } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Segundos → frames. */
export const sec = (seconds: number) => Math.round(seconds * VIDEO.fps);

/** 0 → 1 entre `start` e `start + duration` (frames), com saída suave. */
export function progress(frame: number, start: number, duration = 18, easing = Easing.out(Easing.cubic)) {
  return interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });
}

/** Mola padrão (sem quique exagerado). */
export function pop(frame: number, start: number, fps: number = VIDEO.fps) {
  return spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 140, mass: 0.8 } });
}

/** Estilo de entrada: sobe 24 px e aparece. */
export function fadeUp(frame: number, start: number, duration = 18, distance = 24): React.CSSProperties {
  const p = progress(frame, start, duration);
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` };
}

/** Estilo de saída: some descendo levemente a opacidade a partir de `start`. */
export function fadeOut(frame: number, start: number, duration = 12): React.CSSProperties {
  const p = progress(frame, start, duration, Easing.in(Easing.cubic));
  return { opacity: 1 - p };
}

/** Texto digitado: quantos caracteres aparecem no frame atual. */
export function typed(text: string, frame: number, start: number, charsPerSecond = 14) {
  const count = Math.floor(((frame - start) / VIDEO.fps) * charsPerSecond);
  return text.slice(0, Math.max(0, Math.min(text.length, count)));
}

/** Número que sobe de 0 até `value`. */
export function countUp(frame: number, start: number, value: number, duration = 36) {
  return Math.round(progress(frame, start, duration) * value);
}
