import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "LanceGov: IA para licitações. Ganhe mais licitações. Leia menos edital.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "src/assets/fonts");
const fraunces = await readFile(join(fontsDir, "Fraunces-SemiBold-latin.woff"));
const inter = await readFile(join(fontsDir, "Inter-Medium-latin.woff"));

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#faf8f2",
          color: "#0f1b2d",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontFamily: "Fraunces", fontSize: 44 }}>
          <span style={{ background: "#e3f542", padding: "0 6px", borderRadius: 6 }}>Lance</span>
          <span>Gov</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 84, lineHeight: 1.05 }}>
            Ganhe mais licitações.
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 84, lineHeight: 1.05, marginTop: 8 }}>
            <span style={{ background: "#e3f542", padding: "0 10px", borderRadius: 8 }}>Leia menos edital.</span>
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#4a5565", marginTop: 32 }}>
            Licitações para o seu CNPJ, edital lido em 1 minuto e alertas no WhatsApp.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 26, color: "#4a5565" }}>
          <span>IA para licitações · Dados oficiais do PNCP</span>
          <span style={{ marginLeft: "auto", color: "#0f1b2d" }}>lancegov.com.br</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "normal", weight: 600 },
        { name: "Inter", data: inter, style: "normal", weight: 500 },
      ],
    },
  );
}
