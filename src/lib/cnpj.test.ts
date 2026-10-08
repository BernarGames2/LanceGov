import { describe, expect, it } from "vitest";
import { cleanCnpj, formatCnpj, isValidCnpj, sanitizeCnpjInput } from "./cnpj";

describe("isValidCnpj", () => {
  it("aceita CNPJ numérico válido, com ou sem máscara", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11222333000181")).toBe(true);
    expect(isValidCnpj("33.000.167/0001-01")).toBe(true);
  });

  it("aceita CNPJ alfanumérico válido (exemplo da Receita Federal)", () => {
    expect(isValidCnpj("12.ABC.345/01DE-35")).toBe(true);
    expect(isValidCnpj("12abc34501de35")).toBe(true);
  });

  it("recusa dígito verificador errado", () => {
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false);
    expect(isValidCnpj("12.ABC.345/01DE-36")).toBe(false);
  });

  it("recusa tamanho errado, letra no DV e sequência repetida", () => {
    expect(isValidCnpj("11.222.333/0001-8")).toBe(false);
    expect(isValidCnpj("12.ABC.345/01DE-3A")).toBe(false);
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
    expect(isValidCnpj("")).toBe(false);
  });
});

describe("máscara", () => {
  it("formata conforme digita", () => {
    expect(formatCnpj("11")).toBe("11");
    expect(formatCnpj("112")).toBe("11.2");
    expect(formatCnpj("11222333")).toBe("11.222.333");
    expect(formatCnpj("112223330001")).toBe("11.222.333/0001");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("aceita letras só nas 12 primeiras posições e corta em 14", () => {
    expect(sanitizeCnpjInput("12abc34501deXY35")).toBe("12ABC34501DE35");
    expect(sanitizeCnpjInput("11222333000181999")).toBe("11222333000181");
    expect(formatCnpj("12abc34501de35")).toBe("12.ABC.345/01DE-35");
  });

  it("limpa pontuação e espaços", () => {
    expect(cleanCnpj(" 12.abc.345/01de-35 ")).toBe("12ABC34501DE35");
  });
});
