import { afterEach, describe, expect, it, vi } from "vitest";

import { brasilApiEmpresa, searchResponse } from "@/lib/server/__fixtures__/fixtures";
import { POST } from "./route";

function post(body: unknown) {
  return POST(new Request("http://localhost/api/raio-x", { method: "POST", body: JSON.stringify(body) }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("POST /api/raio-x", () => {
  it("recusa CNPJ inválido sem consultar nada", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await post({ cnpj: "11.222.333/0001-82" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "CNPJ inválido. Confira os caracteres." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("monta o Raio-X real com a Receita e o PNCP", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-08T12:00:00-03:00"), toFake: ["Date"] });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        new Response(JSON.stringify(url.includes("brasilapi") ? brasilApiEmpresa : searchResponse), { status: 200 }),
      ),
    );
    const response = await post({ cnpj: "33.000.167/0001-01" });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.exemplo).toBe(false);
    expect(body.empresa.nome).toBe("Distribuidora Exemplo de Limpeza LTDA");
    expect(body.oportunidades[0]).toMatchObject({ municipio: "Campinas", valor: 184000 });
    expect(body.abertas.quantidade).toBe(2);
  });
});

describe("limite por IP", () => {
  it("responde 429 depois de muitas consultas seguidas", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 404 })));
    let last = 0;
    for (let i = 0; i < 14; i++) {
      const response = await POST(
        new Request("http://localhost/api/raio-x", {
          method: "POST",
          headers: { "x-forwarded-for": "203.0.113.9" },
          body: JSON.stringify({ cnpj: "11.444.777/0001-61" }),
        }),
      );
      last = response.status;
    }
    expect(last).toBe(429);
  });
});
