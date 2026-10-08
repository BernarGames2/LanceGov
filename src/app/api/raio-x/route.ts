import { NextResponse } from "next/server";

import { cleanCnpj, isValidCnpj } from "@/lib/cnpj";
import type { RaioXResult } from "@/lib/raio-x";
import { memo } from "@/lib/server/http";
import { searchOpen } from "@/lib/server/pncp";
import { buildRaioX, RaioXFailure } from "@/lib/server/raio-x";
import { getEmpresa } from "@/lib/server/receita";

/**
 * A Receita e o PNCP às vezes demoram; dá tempo para as reservas responderem
 * (pior caso: 2 × 7 s na Receita + 10 s na busca + 2 × 12 s na consulta).
 */
export const maxDuration = 60;

/** O mesmo CNPJ consultado de novo em 10 minutos reaproveita o resultado. */
const cachedResult = memo<RaioXResult>(10 * 60 * 1000);

/** Limite simples por IP, para ninguém usar a rota para martelar as fontes públicas. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function rateLimited(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/**
 * POST { cnpj } → Raio-X com dados reais: a empresa na base pública da
 * Receita e as licitações abertas compatíveis no PNCP.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const cnpj = typeof body?.cnpj === "string" ? cleanCnpj(body.cnpj) : "";
  if (!isValidCnpj(cnpj)) {
    return NextResponse.json({ message: "CNPJ inválido. Confira os caracteres." }, { status: 400 });
  }

  if (rateLimited(request)) {
    return NextResponse.json(
      { message: "Muitas consultas seguidas. Espere um minuto e tente de novo." },
      { status: 429 },
    );
  }

  try {
    const result = await cachedResult(cnpj, () => buildRaioX(cnpj, { getEmpresa, searchOpen }));
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RaioXFailure) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[raio-x] erro inesperado:", error);
    return NextResponse.json(
      { message: "Não deu para fazer o Raio-X agora. Tente de novo em instantes." },
      { status: 500 },
    );
  }
}
