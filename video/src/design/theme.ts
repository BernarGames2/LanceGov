/**
 * Marca LanceGov no vídeo (1920×1080, 30 fps). Mesmas cores do site.
 * O lima só aparece em ação ou destaque, sempre com texto em tinta.
 * Verde, âmbar e vermelho significam vai, prazo e risco.
 */
export const color = {
  tinta: "#0f1b2d",
  papel: "#faf8f2",
  marcaTexto: "#e3f542",
  grafite: "#4a5565",
  vitoria: "#12b76a",
  vitoriaEscuro: "#067647",
  prazo: "#f5a524",
  risco: "#e5484d",
  riscoEscuro: "#b42318",
  linha: "#e6e3da",
  folha: "#ffffff",
  muted: "#f1eee6",
  whatsappFundo: "#efeae2",
  /** Texto secundário sobre fundo tinta. */
  papelSuave: "rgba(250, 248, 242, 0.72)",
} as const;

export const font = {
  serif: "Fraunces, Georgia, serif",
  sans: "Inter, system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
} as const;

/** Tamanhos pensados para 1080p e para leitura no modal do site (~768 px de largura). */
export const size = {
  display: 112,
  h1: 88,
  h2: 64,
  h3: 44,
  body: 38,
  small: 30,
  tiny: 24,
} as const;

export const radius = { card: 24, pill: 999 } as const;

export const shadow = {
  folha: "0 2px 4px rgba(15,27,45,0.04), 0 24px 64px -24px rgba(15,27,45,0.22)",
  alta: "0 4px 8px rgba(15,27,45,0.06), 0 48px 96px -32px rgba(15,27,45,0.34)",
} as const;

export const VIDEO = { width: 1920, height: 1080, fps: 30 } as const;

/** Margem lateral padrão das cenas. */
export const SAFE_X = 160;
