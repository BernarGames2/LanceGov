import { describe, expect, it } from "vitest";
import { annualMonthlyPrice, plans, priceFor } from "./plans";

describe("preço anual", () => {
  it("é mensal × 10 ÷ 12, arredondado", () => {
    expect(annualMonthlyPrice(0)).toBe(0);
    expect(annualMonthlyPrice(197)).toBe(164);
    expect(annualMonthlyPrice(497)).toBe(414);
    expect(annualMonthlyPrice(1497)).toBe(1248);
  });

  it("só muda no ciclo anual", () => {
    const pro = plans.find((plan) => plan.id === "pro")!;
    expect(priceFor(pro, "mensal")).toBe(497);
    expect(priceFor(pro, "anual")).toBe(414);
  });
});
