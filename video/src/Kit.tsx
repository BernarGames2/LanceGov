import { useCurrentFrame } from "remotion";

import { typed } from "./design/anim";
import {
  Badge, Body, Bubble, Button, Grifo, Kicker, Logo, Mono, NotaLance, OpportunityCard, Phone, Pointer, QuickReply, Stage, TextField, Title,
} from "./design/components";
import { SAFE_X } from "./design/theme";

/** Mostruário dos componentes, para conferir o visual (não entra no vídeo). */
export function Kit() {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div style={{ position: "absolute", left: SAFE_X, top: 80, width: 900, display: "flex", flexDirection: "column", gap: 28 }}>
        <Logo />
        <Kicker>Passo 1 · Raio-X</Kicker>
        <Title>Ganhe mais licitações. <Grifo start={0}>Leia menos edital</Grifo>.</Title>
        <Body>A LanceGov acompanha as licitações do Brasil e lê cada edital em um minuto.</Body>
        <TextField value={typed("12.ABC.345/01DE-35", frame, 0, 20)} placeholder="Digite seu CNPJ" />
        <div style={{ display: "flex", gap: 16 }}>
          <Button>Ver minhas licitações grátis</Button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Badge variant="vitoria">Vai</Badge><Badge variant="prazo">Sessão em <Mono>12</Mono> dias</Badge><Badge variant="risco">Falta</Badge><Badge variant="destaque">Em breve</Badge>
        </div>
      </div>
      <OpportunityCard
        o={{ orgao: "Prefeitura de [Município]", objeto: "Material de limpeza", modalidade: "Pregão eletrônico", valor: "R$ 184.000", participacao: "Exclusiva ME/EPP", nota: 87, vai: true, dias: 12 }}
        style={{ position: "absolute", left: SAFE_X, top: 760, transform: "scale(0.7)", transformOrigin: "left top" }}
      />
      <Phone style={{ position: "absolute", right: SAFE_X, top: 70 }}>
        <Bubble start={0} time="07:30">Bom dia! 3 licitações novas com a sua cara. A melhor: material de limpeza, R$ 184 mil, exclusiva ME/EPP, Nota 91.</Bubble>
        <QuickReply start={0}>Ver detalhes</QuickReply>
        <QuickReply start={0}>Lembrar amanhã</QuickReply>
        <Bubble start={0} time="07:31" mine>Ver detalhes</Bubble>
      </Phone>
      <div style={{ position: "absolute", left: 1100, top: 120 }}><NotaLance score={91} start={0} diameter={160} /></div>
      <Pointer x={900} y={640} clickAt={20} />
    </Stage>
  );
}
