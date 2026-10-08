"use client";

import { CirclePlay } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { track } from "@/lib/analytics";

/** Vídeo gerado pelo projeto video/ (Remotion). Veja video/README.md para editar e renderizar. */
const VIDEO_MP4 = "/video/como-funciona.mp4";
/** Alternativa para navegadores sem H.264 (algumas versões do Chromium no Linux). */
const VIDEO_WEBM = "/video/como-funciona.webm";
const VIDEO_POSTER = "/video/como-funciona-poster.jpg";

/** O vídeo não tem narração: o roteiro escrito serve a quem não pode assistir. */
const ROTEIRO = [
  "Ganhe mais licitações. Leia menos edital. A IA que encontra, lê e prepara as licitações que sua empresa pode vencer.",
  "Passo 1: informe seu CNPJ. A LanceGov monta o perfil da empresa com CNAEs, porte e região.",
  "Raio-X do CNPJ: as licitações abertas que combinam com a sua empresa, o valor total e quantas são exclusivas para ME/EPP.",
  "Passo 2: receba as oportunidades certas. Cada licitação chega com a Nota Lance, de 0 a 100, e a recomendação: vai ou não vai.",
  "Edital entendido em 1 minuto. A IA pode errar. Por isso cada resposta mostra a página do edital.",
  "Passo 3: zero susto na habilitação. O cofre confere cada edital e avisa o que falta e o que vence antes da sessão.",
  "Tudo no WhatsApp: alertas, lembretes e perguntas sobre o edital sem abrir o computador.",
  "No plano Pro, preço para vencer com margem: veja quanto o governo pagou em compras parecidas e quanto sobra para você.",
  "A LanceGov prepara. Você decide e participa. Sua empresa envia a proposta e dá os lances no portal oficial.",
  "O governo compra todo dia. Faça o Raio-X grátis, sem cartão e sem cadastro, em lancegov.com.br.",
];

export function VideoDialog() {
  return (
    <Dialog onOpenChange={(open) => open && track("cta_click", { local: "hero-video" })}>
      <DialogTrigger className="inline-flex cursor-pointer items-center gap-2 rounded-full py-2 text-base font-medium text-tinta underline decoration-tinta/30 underline-offset-4 transition-colors hover:decoration-tinta">
        <CirclePlay aria-hidden className="size-5" />
        Ver como funciona (2 min)
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Como a LanceGov funciona</DialogTitle>
          <DialogDescription>Do CNPJ ao aviso no WhatsApp, em 2 minutos. Vídeo sem som.</DialogDescription>
        </DialogHeader>
        <div className="secao-escura overflow-hidden rounded-lg">
          {/* O conteúdo do modal só monta quando ele abre, então o vídeo só baixa nessa hora. */}
          <video
            poster={VIDEO_POSTER}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          >
            <source src={VIDEO_MP4} type='video/mp4; codecs="avc1.640028"' />
            <source src={VIDEO_WEBM} type='video/webm; codecs="vp9"' />
            <a href={VIDEO_MP4}>Baixar o vídeo</a>
          </video>
        </div>
        <details className="text-[15px] text-grafite">
          <summary className="cursor-pointer rounded-sm font-medium text-tinta">Ler o roteiro do vídeo</summary>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5">
            {ROTEIRO.map((cena) => (
              <li key={cena}>{cena}</li>
            ))}
          </ol>
        </details>
      </DialogContent>
    </Dialog>
  );
}
