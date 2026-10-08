import { useCurrentFrame } from "remotion";

import { fadeOut, fadeUp, pop, sec } from "../design/anim";
import { Badge, Body, Bubble, Grifo, Kicker, Phone, QuickReply, Stage, TapRing, Title } from "../design/components";
import { SAFE_X, color } from "../design/theme";
import { sceneFrames } from "./timing";

export const duration = sceneFrames("07-whatsapp");

/**
 * Inícios (frames locais). O quadro 0 é o começo do fade de chegada (15 f);
 * os últimos 18 f sobrepõem o slide de saída, onde nada novo começa.
 */
const T = {
  phone: sec(0.3),
  kicker: sec(0.5),
  title: sec(0.7),
  exemplo: sec(1.2),
  grifo: sec(1.3),
  alerta: sec(1.6),
  quick: [sec(2.6), sec(2.8)],
  body: sec(3.4),
  toque: sec(7.9),
  press: sec(8.0),
  /** As respostas rápidas somem em 6 f e saem do layout neste quadro. */
  quickFim: sec(8.3),
  pergunta: sec(8.4),
  digitando: sec(8.7),
  resposta: sec(9.2),
} as const;

/** Celular à direita: borda direita em x 1760 (margem de 160 px). */
const PHONE = { left: 1080, top: 40, width: 680, height: 1000 } as const;

/**
 * Balões em 32 px (o kit usa 28) para a conversa ser lida no modal do site.
 * Um pouco mais largos (90%) e com quebra "pretty" para não sobrar palavra
 * sozinha na última linha.
 */
const BUBBLE_TEXT: React.CSSProperties = { fontSize: 32, maxWidth: "90%", textWrap: "pretty" };

/**
 * O QuickReply do kit ocupa 86% do pai. Este pai mais largo deixa os botões
 * com os mesmos 90% da conversa que o balão de cima (bordas alinhadas).
 */
const QUICK_WRAP_WIDTH = `${(90 / 86) * 100}%`;

/**
 * Anel de toque no centro de "Ver detalhes", em coordenadas do botão
 * (90% de 604 px de largura, ~65 px de altura).
 */
const TOQUE = { x: 272, y: 33 } as const;

/**
 * Texto do demo do site, com "Nota 91" trocado por "Nota 87" (o mesmo edital
 * das cenas anteriores). Espaços inseparáveis (\u00a0) impedem quebras como
 * "R$ 184 | mil" ou "Faltam 2 | documentos".
 */
const ALERTA =
  "Bom dia! 3 licitações novas com a sua cara. A melhor: material de limpeza, R$\u00a0184\u00a0mil, " +
  "exclusiva ME/EPP, Nota\u00a087. Sessão em 12\u00a0dias. Faltam 2\u00a0documentos. Quer\u00a0ver?";

/** "Digitando…": balão da LanceGov com três pontos pulsando, sem texto. */
function Typing({ start }: { start: number }) {
  const frame = useCurrentFrame();
  const s = pop(frame, start);
  const t = frame - start;
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: color.folha,
        borderRadius: 22,
        borderTopLeftRadius: 6,
        padding: "24px 26px",
        boxShadow: "0 1px 2px rgba(15,27,45,0.12)",
        opacity: s,
        transform: `translateY(${(1 - s) * 16}px) scale(${0.96 + s * 0.04})`,
        transformOrigin: "left top",
      }}
    >
      {[0, 1, 2].map((i) => {
        // Cada ponto sobe e acende em sequência, num ciclo de 12 f.
        const wave = Math.max(0, Math.sin(((t - i * 3) / 12) * Math.PI * 2));
        return (
          <span
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: color.grafite,
              opacity: 0.35 + wave * 0.5,
              transform: `translateY(${-wave * 5}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Copiloto no WhatsApp: o alerta das 07:30 chega com as respostas rápidas,
 * o dono toca em "Ver detalhes" e a LanceGov responde com o que falta no
 * edital. Título à esquerda, celular à direita.
 */
export default function Scene() {
  const frame = useCurrentFrame();

  return (
    <Stage>
      {/* Coluna esquerda */}
      <div style={{ position: "absolute", left: SAFE_X, top: 372, width: 800 }}>
        <Kicker fontSize={38} style={fadeUp(frame, T.kicker)}>
          Copiloto no WhatsApp
        </Kicker>
        <Title fontSize={88} style={{ marginTop: 14, whiteSpace: "nowrap", ...fadeUp(frame, T.title) }}>
          Tudo <Grifo start={T.grifo}>no WhatsApp</Grifo>
        </Title>
        <Body fontSize={40} style={{ marginTop: 32, width: 720, ...fadeUp(frame, T.body) }}>
          Alertas, lembretes e perguntas sobre o edital sem abrir o computador.
        </Body>
      </div>

      {/* Celular */}
      <div style={{ position: "absolute", left: PHONE.left, top: PHONE.top, ...fadeUp(frame, T.phone, 24, 60) }}>
        <Phone width={PHONE.width} height={PHONE.height}>
          {/* Selo "Exemplo" como o chip de data do WhatsApp */}
          <div style={{ alignSelf: "center", ...fadeUp(frame, T.exemplo, 12) }}>
            <Badge variant="exemplo" style={{ background: "rgba(255,255,255,0.6)" }}>
              Exemplo
            </Badge>
          </div>

          <Bubble time="07:30" start={T.alerta} style={BUBBLE_TEXT}>
            {ALERTA}
          </Bubble>

          {frame < T.quickFim && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: -4,
                width: QUICK_WRAP_WIDTH,
                ...fadeOut(frame, T.quickFim - 6, 6),
              }}
            >
              <div style={{ position: "relative" }}>
                <QuickReply start={T.quick[0]} pressAt={T.press}>
                  Ver detalhes
                </QuickReply>
                <TapRing x={TOQUE.x} y={TOQUE.y} at={T.toque} />
              </div>
              <QuickReply start={T.quick[1]}>Lembrar amanhã</QuickReply>
            </div>
          )}

          <Bubble time="07:31" mine start={T.pergunta} style={BUBBLE_TEXT}>
            Ver detalhes
          </Bubble>

          {frame >= T.digitando && frame < T.resposta && <Typing start={T.digitando} />}

          <Bubble time="07:31" start={T.resposta} style={BUBBLE_TEXT}>
            Abri as exigências do edital. Faltam o atestado de capacidade técnica e a ficha técnica dos saneantes.
          </Bubble>
        </Phone>
      </div>
    </Stage>
  );
}
