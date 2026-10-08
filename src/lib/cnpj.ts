/**
 * CNPJ numérico e alfanumérico (Receita Federal, a partir de jul/2026).
 * As 12 primeiras posições aceitam 0-9 e A-Z; as 2 últimas são sempre
 * dígitos verificadores, calculados pelo módulo 11 com valor = ASCII - 48.
 */

const LENGTH = 14;
const BASE_LENGTH = 12;
const WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const BASE_CHAR = /^[0-9A-Z]$/;
const DIGIT = /^[0-9]$/;

/** Remove máscara e espaços, passa para maiúsculas. */
export function cleanCnpj(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

/**
 * Filtra o que o usuário digitou: letras só nas 12 primeiras posições,
 * dígitos nas 2 últimas, no máximo 14 caracteres.
 */
export function sanitizeCnpjInput(value: string) {
  let result = "";
  for (const char of cleanCnpj(value)) {
    if (result.length >= LENGTH) break;
    const allowed = result.length < BASE_LENGTH ? BASE_CHAR : DIGIT;
    if (allowed.test(char)) result += char;
  }
  return result;
}

/** Aplica a máscara 00.000.000/0000-00 conforme o usuário digita. */
export function formatCnpj(value: string) {
  const raw = sanitizeCnpjInput(value);
  const parts = [
    raw.slice(0, 2),
    raw.slice(2, 5),
    raw.slice(5, 8),
    raw.slice(8, 12),
    raw.slice(12, 14),
  ];
  let formatted = parts[0];
  if (parts[1]) formatted += `.${parts[1]}`;
  if (parts[2]) formatted += `.${parts[2]}`;
  if (parts[3]) formatted += `/${parts[3]}`;
  if (parts[4]) formatted += `-${parts[4]}`;
  return formatted;
}

function checkDigit(chars: string, weights: number[]) {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += (chars.charCodeAt(i) - 48) * weights[i];
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string) {
  const cnpj = cleanCnpj(value);
  if (cnpj.length !== LENGTH) return false;

  const base = cnpj.slice(0, BASE_LENGTH);
  if (![...base].every((char) => BASE_CHAR.test(char))) return false;
  if (!DIGIT.test(cnpj[12]) || !DIGIT.test(cnpj[13])) return false;
  // Sequências repetidas (00000000000000, 11111111111111...) passam no
  // cálculo, mas não existem.
  if (/^(.)\1+$/.test(cnpj)) return false;

  const first = checkDigit(base, WEIGHTS_FIRST);
  const second = checkDigit(base + first, WEIGHTS_SECOND);
  return cnpj.endsWith(`${first}${second}`);
}
