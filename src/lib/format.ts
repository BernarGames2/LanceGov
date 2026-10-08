const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** R$ 184.000 (sem centavos). */
export function formatBRL(value: number) {
  return brl.format(value).replace(/ /g, " ");
}

/** 184.000 (sem o símbolo). */
export function formatInteger(value: number) {
  return integer.format(value);
}

/** R$ 3,9 mi / R$ 184 mil, para cartões de resumo. */
export function formatBRLCompact(value: number) {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const digits = millions >= 100 ? 0 : 1;
    return `R$ ${millions.toLocaleString("pt-BR", { maximumFractionDigits: digits })} mi`;
  }
  if (value >= 1_000) {
    return `R$ ${Math.round(value / 1_000).toLocaleString("pt-BR")} mil`;
  }
  return formatBRL(value);
}
