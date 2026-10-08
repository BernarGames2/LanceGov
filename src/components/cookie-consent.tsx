"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  getConsent,
  openCookiePreferences,
  OPEN_PREFERENCES_EVENT,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";

/** undefined no servidor: o banner só decide depois de ler o navegador. */
function useConsent() {
  return useSyncExternalStore(subscribeConsent, getConsent, () => undefined);
}

/**
 * O aviso aparece na primeira rolagem (ou depois de alguns segundos), para não
 * cobrir o campo de CNPJ na primeira tela do celular. Nada é rastreado antes
 * da escolha, então esperar não muda o que é coletado.
 */
const SHOW_BANNER_AFTER_MS = 8000;

export function CookieConsent() {
  const consent = useConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [bannerReady, setBannerReady] = useState(false);

  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
  }, []);

  useEffect(() => {
    if (bannerReady) return;
    const show = () => setBannerReady(true);
    const timer = window.setTimeout(show, SHOW_BANNER_AFTER_MS);
    window.addEventListener("scroll", show, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", show);
    };
  }, [bannerReady]);

  return (
    <>
      {consent === null && bannerReady && !preferencesOpen && (
        <section
          aria-label="Aviso de cookies"
          className="folha fixed inset-x-3 bottom-3 z-50 p-4 shadow-folha-alta animate-surgir sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md sm:p-5"
        >
          <p className="text-sm leading-relaxed text-tinta sm:text-[15px]">
            Usamos cookies essenciais para o site funcionar e, com a sua permissão, cookies de
            análise para melhorar a LanceGov. Veja a{" "}
            <Link href="/privacidade" className="font-medium underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
            <Button size="sm" onClick={() => saveConsent(true)}>
              Aceitar
            </Button>
            <Button size="sm" variant="outline" onClick={() => saveConsent(false)}>
              Recusar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPreferencesOpen(true)}>
              Personalizar
            </Button>
          </div>
        </section>
      )}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        {preferencesOpen && (
          <PreferencesContent
            initialAnalytics={consent?.analytics ?? false}
            onSave={(analytics) => {
              saveConsent(analytics);
              setPreferencesOpen(false);
            }}
          />
        )}
      </Dialog>
    </>
  );
}

function PreferencesContent({
  initialAnalytics,
  onSave,
}: {
  initialAnalytics: boolean;
  onSave: (analytics: boolean) => void;
}) {
  const [analytics, setAnalytics] = useState(initialAnalytics);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Preferências de cookies</DialogTitle>
        <DialogDescription>Escolha o que a LanceGov pode usar. Você muda isso quando quiser.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col divide-y divide-linha rounded-xl border border-linha">
        <div className="flex items-start justify-between gap-4 p-4">
          <div>
            <p id="cookies-essenciais" className="font-medium">
              Essenciais
            </p>
            <p className="mt-1 text-sm text-grafite">
              Fazem o site funcionar e guardam esta escolha. Sempre ativos.
            </p>
          </div>
          <Switch checked disabled aria-labelledby="cookies-essenciais" />
        </div>
        <div className="flex items-start justify-between gap-4 p-4">
          <div>
            <label htmlFor="cookies-analise" className="font-medium">
              Análise
            </label>
            <p className="mt-1 text-sm text-grafite">
              Mostram quais páginas e botões são usados, para melhorar o produto.
            </p>
          </div>
          <Switch id="cookies-analise" checked={analytics} onCheckedChange={setAnalytics} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onSave(false)}>
          Recusar todos
        </Button>
        <Button variant="dark" onClick={() => onSave(analytics)}>
          Salvar preferências
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="cursor-pointer self-start rounded-sm text-sm whitespace-nowrap text-grafite underline underline-offset-4 hover:text-tinta"
    >
      Preferências de cookies
    </button>
  );
}
