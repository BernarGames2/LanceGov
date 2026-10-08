"use client";

import { CirclePlay, Play } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { track } from "@/lib/analytics";

/**
 * Modal do vídeo "Ver como funciona". Quando o vídeo existir, passe `src`
 * (MP4/WebM) e ele toca no lugar do placeholder.
 */
export function VideoDialog({ src }: { src?: string }) {
  return (
    <Dialog onOpenChange={(open) => open && track("cta_click", { local: "hero-video" })}>
      <DialogTrigger className="inline-flex cursor-pointer items-center gap-2 rounded-full py-2 text-base font-medium text-tinta underline decoration-tinta/30 underline-offset-4 transition-colors hover:decoration-tinta">
        <CirclePlay aria-hidden className="size-5" />
        Ver como funciona (2 min)
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Como a LanceGov funciona</DialogTitle>
          <DialogDescription>
            Do CNPJ ao aviso no WhatsApp, em 2 minutos.
          </DialogDescription>
        </DialogHeader>
        <div className="secao-escura relative aspect-video overflow-hidden rounded-lg">
          {src ? (
            <video src={src} controls autoPlay playsInline className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-marca-texto text-tinta">
                <Play aria-hidden className="size-7 translate-x-0.5" />
              </span>
              <p className="text-base text-papel/80">Vídeo em produção.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
