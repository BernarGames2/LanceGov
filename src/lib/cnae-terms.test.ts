import { describe, expect, it } from "vitest";
import { formatCnae, matchesTerm, searchTerms, termsForCnae } from "./cnae-terms";

describe("CNAE → termos de busca", () => {
  it("formata o código", () => {
    expect(formatCnae(4649408)).toBe("4649-4/08");
    expect(formatCnae("161003")).toBe("0161-0/03");
  });

  it("usa os termos de compra das atividades conhecidas, preferindo o prefixo mais longo", () => {
    expect(termsForCnae(4649408)).toEqual(["material de limpeza", "produtos de higiene"]);
    expect(termsForCnae(4789005)).toEqual(["material de limpeza", "saneantes"]);
    expect(termsForCnae(4789099)).toEqual(["materiais diversos"]);
    expect(termsForCnae(6201501)).toEqual(["software", "sistema de gestão"]);
  });

  it("extrai palavras da descrição quando a atividade não está mapeada", () => {
    expect(termsForCnae(9999999, "Comércio varejista de artigos de óptica")).toEqual(["óptica"]);
    expect(termsForCnae(9999999, "")).toEqual([]);
  });

  it("intercala as atividades, ignora código zero e não repete termos", () => {
    const terms = searchTerms([
      { codigo: 4649408 },
      { codigo: 0, descricao: "" },
      { codigo: 4761003 },
      { codigo: 4789005 },
    ]);
    expect(terms).toEqual(["material de limpeza", "material de expediente", "produtos de higiene"]);
  });

  it("confere o termo no objeto sem ligar para acento e caixa", () => {
    expect(matchesTerm("AQUISIÇÃO DE MATERIAL DE LIMPEZA", "material de limpeza")).toBe(true);
    expect(matchesTerm("Gêneros alimentícios para merenda", "generos alimenticios")).toBe(true);
    expect(matchesTerm("Transporte escolar", "material de limpeza")).toBe(false);
  });
});
