"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/logo";
import { RaioXLink } from "@/components/raio-x-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Menu é estado passageiro: fecha quando a página fica escondida (Activity).
  useLayoutEffect(() => {
    return () => setOpen(false);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-papel/90 backdrop-blur-md transition-colors",
        scrolled || open ? "border-linha" : "border-transparent",
      )}
    >
      <nav aria-label="Principal" className="container-lg flex h-16 items-center justify-between gap-3">
        <Link href="/" onClick={close} className="shrink-0 rounded-md" aria-label="LanceGov, página inicial">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full px-3 py-2 text-[15px] font-medium text-grafite transition-colors hover:text-tinta"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/entrar"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
          >
            Entrar
          </Link>
          <RaioXLink
            eventProps={{ local: "navbar" }}
            onClick={close}
            className={cn(buttonVariants({ size: "sm" }), "px-3.5 sm:px-4")}
          >
            Fazer Raio-X grátis
          </RaioXLink>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls="menu-celular"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
            <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
          </Button>
        </div>
      </nav>

      <div id="menu-celular" hidden={!open} className="border-t border-linha bg-papel lg:hidden">
        <ul className="container-lg flex flex-col py-3">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={close}
                className="block rounded-md py-3 text-lg font-medium text-tinta"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="sm:hidden">
            <Link href="/entrar" onClick={close} className="block rounded-md py-3 text-lg font-medium text-tinta">
              Entrar
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
