import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CalendarClock, Check, CheckCheck, X } from "lucide-react";

import { countUp, pop, progress } from "./anim";
import { color, font, radius, shadow, size } from "./theme";

/* ------------------------------------------------------------------ */
/* Palco e tipografia                                                 */
/* ------------------------------------------------------------------ */

/** Fundo da cena: papel (padrão) ou tinta (cena escura). */
export function Stage({
  dark = false,
  children,
  style,
}: {
  dark?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: dark ? color.tinta : color.papel,
        color: dark ? color.papel : color.tinta,
        fontFamily: font.sans,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** Wordmark: "LanceGov" em Fraunces com "Lance" grifado. */
export function Logo({ fontSize = 56, dark = false }: { fontSize?: number; dark?: boolean }) {
  return (
    <span
      style={{
        fontFamily: font.serif,
        fontWeight: 600,
        fontSize,
        letterSpacing: "-0.01em",
        color: dark ? color.papel : color.tinta,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          color: color.tinta,
          backgroundImage: `linear-gradient(${color.marcaTexto}, ${color.marcaTexto})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 88%",
          backgroundSize: "100% 0.62em",
          padding: "0 0.06em",
          margin: "0 -0.06em",
        }}
      >
        Lance
      </span>
      Gov
    </span>
  );
}

/**
 * Grifo marca-texto que passa por trás do texto em 12 frames (400 ms),
 * a partir de `start`. O texto grifado fica sempre em tinta.
 */
export function Grifo({ children, start }: { children: React.ReactNode; start: number }) {
  const frame = useCurrentFrame();
  const p = progress(frame, start, 12);
  return (
    <span
      style={{
        color: color.tinta,
        backgroundImage: `linear-gradient(${color.marcaTexto}, ${color.marcaTexto})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        backgroundSize: `${p * 100}% 0.62em`,
        padding: "0 0.06em",
        margin: "0 -0.06em",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

/** Rótulo pequeno acima do título (ex.: "PASSO 1"). */
export function Kicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        fontFamily: font.mono,
        fontWeight: 500,
        fontSize: size.tiny,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: dark ? color.papelSuave : color.grafite,
      }}
    >
      {children}
    </div>
  );
}

/** Título em Fraunces. */
export function Title({
  children,
  fontSize = size.h1,
  style,
}: {
  children: React.ReactNode;
  fontSize?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: font.serif,
        fontWeight: 600,
        fontSize,
        lineHeight: 1.08,
        letterSpacing: "-0.015em",
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Texto de apoio em Inter. */
export function Body({
  children,
  dark = false,
  fontSize = size.body,
  style,
}: {
  children: React.ReactNode;
  dark?: boolean;
  fontSize?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: font.sans,
        fontWeight: 400,
        fontSize,
        lineHeight: 1.4,
        color: dark ? color.papelSuave : color.grafite,
        textWrap: "pretty",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Número/valor/CNPJ em IBM Plex Mono. */
export function Mono({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ fontFamily: font.mono, fontWeight: 500, fontVariantNumeric: "tabular-nums", ...style }}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Peças de interface                                                 */
/* ------------------------------------------------------------------ */

/** Cartão "folha de papel". */
export function Paper({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: color.folha,
        border: `2px solid ${color.linha}`,
        borderRadius: radius.card,
        boxShadow: shadow.folha,
        color: color.tinta,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type BadgeVariant = "default" | "destaque" | "vitoria" | "prazo" | "risco" | "exemplo";

const badgeStyle: Record<BadgeVariant, React.CSSProperties> = {
  default: { border: `2px solid ${color.linha}`, background: color.folha, color: color.tinta },
  destaque: { border: "2px solid transparent", background: color.marcaTexto, color: color.tinta },
  vitoria: { border: "2px solid rgba(18,183,106,0.3)", background: "rgba(18,183,106,0.1)", color: color.vitoriaEscuro },
  prazo: { border: "2px solid rgba(245,165,36,0.4)", background: "rgba(245,165,36,0.15)", color: color.tinta },
  risco: { border: "2px solid rgba(229,72,77,0.3)", background: "rgba(229,72,77,0.1)", color: color.riscoEscuro },
  exemplo: {
    border: `2px dashed rgba(74,85,101,0.45)`,
    background: "transparent",
    color: color.grafite,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: 20,
  },
};

export function Badge({
  children,
  variant = "default",
  style,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        borderRadius: radius.pill,
        padding: "6px 18px",
        fontFamily: font.sans,
        fontWeight: 500,
        fontSize: 26,
        whiteSpace: "nowrap",
        ...badgeStyle[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Botão pílula. "primario" é lima com texto tinta. */
export function Button({
  children,
  variant = "primario",
  style,
}: {
  children: React.ReactNode;
  variant?: "primario" | "escuro" | "contorno";
  style?: React.CSSProperties;
}) {
  const variants: Record<string, React.CSSProperties> = {
    primario: { background: color.marcaTexto, color: color.tinta },
    escuro: { background: color.tinta, color: color.papel },
    contorno: { background: color.folha, color: color.tinta, border: `2px solid rgba(15,27,45,0.15)` },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        height: 96,
        padding: "0 48px",
        borderRadius: radius.pill,
        fontFamily: font.sans,
        fontWeight: 500,
        fontSize: 34,
        whiteSpace: "nowrap",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Cor do medidor: verde (vai), âmbar (atenção), vermelho (risco). */
export function notaColor(score: number) {
  if (score >= 70) return color.vitoria;
  if (score >= 40) return color.prazo;
  return color.risco;
}

/**
 * Medidor circular da Nota Lance. O arco e o número sobem de 0 até `score`
 * a partir de `start` (use start negativo para já aparecer cheio).
 */
export function NotaLance({
  score,
  diameter = 140,
  start = -100,
  duration = 30,
  label = true,
}: {
  score: number;
  diameter?: number;
  start?: number;
  duration?: number;
  label?: boolean;
}) {
  const frame = useCurrentFrame();
  const value = countUp(frame, start, score, duration);
  const stroke = Math.max(10, Math.round(diameter / 11));
  const r = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: diameter, height: diameter }}>
        <svg width={diameter} height={diameter} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={diameter / 2} cy={diameter / 2} r={r} fill="none" stroke={color.linha} strokeWidth={stroke} />
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={r}
            fill="none"
            stroke={notaColor(score)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font.mono,
            fontWeight: 500,
            fontSize: Math.round(diameter * 0.32),
            color: color.tinta,
          }}
        >
          {value}
        </div>
      </div>
      {label && (
        <span style={{ fontFamily: font.sans, fontWeight: 500, fontSize: 22, color: color.grafite }}>Nota Lance</span>
      )}
    </div>
  );
}

export type Oportunidade = {
  orgao: string;
  objeto: string;
  modalidade: string;
  valor: string;
  participacao: string;
  nota: number;
  vai: boolean;
  dias: number;
};

/** Cartão de oportunidade (igual ao do site, em escala de vídeo). */
export function OpportunityCard({
  o,
  exemplo = true,
  notaStart = -100,
  style,
}: {
  o: Oportunidade;
  exemplo?: boolean;
  notaStart?: number;
  style?: React.CSSProperties;
}) {
  return (
    <Paper style={{ padding: 40, width: 760, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 32 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: color.grafite }}>
            {exemplo && <Badge variant="exemplo">Exemplo</Badge>}
            <span>{o.orgao}</span>
          </div>
          <div style={{ marginTop: 16, fontSize: 38, fontWeight: 500, lineHeight: 1.2 }}>{o.objeto}</div>
          <div style={{ marginTop: 4, fontSize: 24, color: color.grafite }}>{o.modalidade}</div>
          <Mono style={{ display: "block", marginTop: 20, fontSize: 52 }}>{o.valor}</Mono>
        </div>
        <NotaLance score={o.nota} diameter={136} start={notaStart} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
        <Badge variant={o.vai ? "vitoria" : "risco"}>
          {o.vai ? <Check size={24} strokeWidth={2.5} /> : <X size={24} strokeWidth={2.5} />}
          {o.vai ? "Vai" : "Não vai"}
        </Badge>
        <Badge>{o.participacao}</Badge>
        <Badge variant="prazo">
          <CalendarClock size={24} strokeWidth={2} />
          Sessão em <Mono>{o.dias}</Mono> dias
        </Badge>
      </div>
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* WhatsApp                                                            */
/* ------------------------------------------------------------------ */

/**
 * Celular com a conversa da LanceGov no WhatsApp. Sem verde-e-amarelo:
 * fundo bege do WhatsApp, balões brancos e respostas do usuário em lima claro.
 */
export function Phone({
  children,
  width = 620,
  height = 940,
  style,
}: {
  children: React.ReactNode;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 64,
        background: color.tinta,
        padding: 16,
        boxShadow: shadow.alta,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 50,
          overflow: "hidden",
          background: color.whatsappFundo,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "40px 28px 22px",
            background: "rgba(255,255,255,0.75)",
            borderBottom: `2px solid ${color.linha}`,
          }}
        >
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: color.tinta,
              color: color.marcaTexto,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: font.serif,
              fontWeight: 600,
              fontSize: 34,
            }}
          >
            L
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 30, fontWeight: 500, color: color.tinta }}>LanceGov</div>
            <div style={{ fontSize: 22, color: color.grafite }}>conta comercial</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, padding: "24px 22px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Balão de mensagem que entra com uma mola a partir de `start`. */
export function Bubble({
  children,
  time,
  mine = false,
  start,
  style,
}: {
  children: React.ReactNode;
  time: string;
  mine?: boolean;
  start: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const s = pop(frame, start);
  if (frame < start) return null;
  return (
    <div
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "86%",
        background: mine ? "#f4fbc8" : color.folha,
        borderRadius: 22,
        borderTopLeftRadius: mine ? 22 : 6,
        borderTopRightRadius: mine ? 6 : 22,
        padding: "16px 22px 12px",
        fontSize: 28,
        lineHeight: 1.35,
        color: color.tinta,
        boxShadow: "0 1px 2px rgba(15,27,45,0.12)",
        opacity: s,
        transform: `translateY(${(1 - s) * 16}px) scale(${0.96 + s * 0.04})`,
        transformOrigin: mine ? "right top" : "left top",
        ...style,
      }}
    >
      {children}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 6,
          marginTop: 6,
          fontFamily: font.mono,
          fontSize: 18,
          color: color.grafite,
        }}
      >
        {time}
        {mine && <CheckCheck size={20} color={color.grafite} />}
      </div>
    </div>
  );
}

/** Botão de resposta rápida do WhatsApp. `pressAt` escurece o botão no toque. */
export function QuickReply({ children, start, pressAt }: { children: React.ReactNode; start: number; pressAt?: number }) {
  const frame = useCurrentFrame();
  const s = pop(frame, start);
  const pressed = pressAt !== undefined && frame >= pressAt && frame < pressAt + 8;
  if (frame < start) return null;
  return (
    <div
      style={{
        alignSelf: "flex-start",
        width: "86%",
        textAlign: "center",
        background: pressed ? color.muted : color.folha,
        borderRadius: 18,
        padding: "16px 0",
        fontSize: 27,
        fontWeight: 500,
        color: color.tinta,
        boxShadow: "0 1px 2px rgba(15,27,45,0.12)",
        opacity: s,
        transform: `translateY(${(1 - s) * 12}px)`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formulário de CNPJ                                                  */
/* ------------------------------------------------------------------ */

/** Campo com cursor piscando. `value` vazio mostra o placeholder. */
export function TextField({
  value,
  placeholder,
  width = 760,
  focused = true,
  style,
}: {
  value: string;
  placeholder: string;
  width?: number;
  focused?: boolean;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  return (
    <div
      style={{
        width,
        height: 104,
        borderRadius: radius.pill,
        background: color.folha,
        border: `3px solid ${focused ? color.tinta : color.linha}`,
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
        fontSize: 38,
        ...style,
      }}
    >
      {value ? (
        <Mono style={{ letterSpacing: "0.03em" }}>{value}</Mono>
      ) : (
        <span style={{ color: "rgba(74,85,101,0.8)" }}>{placeholder}</span>
      )}
      {focused && (
        <span
          style={{
            width: 3,
            height: 46,
            marginLeft: value ? 4 : 0,
            order: value ? 1 : -1,
            background: color.tinta,
            opacity: caretOn ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}

/** Ponteiro de mouse simples, para mostrar um clique. */
export function Pointer({ x, y, clickAt }: { x: number; y: number; clickAt?: number }) {
  const frame = useCurrentFrame();
  const ring =
    clickAt === undefined ? 0 : interpolate(frame, [clickAt, clickAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {clickAt !== undefined && frame >= clickAt && (
        <div
          style={{
            position: "absolute",
            left: -36,
            top: -36,
            width: 72,
            height: 72,
            borderRadius: 999,
            border: `4px solid ${color.tinta}`,
            opacity: 1 - ring,
            transform: `scale(${0.4 + ring})`,
          }}
        />
      )}
      <svg width="44" height="56" viewBox="0 0 22 28" style={{ filter: "drop-shadow(0 4px 6px rgba(15,27,45,0.3))" }}>
        <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.8 L18.5 15.8 Z" fill={color.tinta} stroke={color.folha} strokeWidth="1.6" />
      </svg>
    </div>
  );
}
