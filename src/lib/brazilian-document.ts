/** Receita Federal: CNPJ numérico e alfanumérico usam módulo 11. */
export function normalizeDocument(value: string): string {
  return value.trim().toUpperCase().replace(/[.\s/\-]/g, "");
}

export function isValidCnpj(value: string): boolean {
  const document = normalizeDocument(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(document) || /^(.)\1{13}$/.test(document)) return false;

  function digit(base: string): number {
    let weight = base.length - 7;
    const sum = Array.from(base).reduce((total, character) => {
      const result = total + (character.charCodeAt(0) - 48) * weight;
      weight = weight === 2 ? 9 : weight - 1;
      return result;
    }, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  const base = document.slice(0, 12);
  const first = digit(base);
  return document.slice(12) === `${first}${digit(base + first)}`;
}

export function isValidCpf(value: string): boolean {
  const document = normalizeDocument(value);
  if (!/^\d{11}$/.test(document) || /^(.)\1{10}$/.test(document)) return false;
  for (let length = 9; length <= 10; length++) {
    const sum = Array.from(document.slice(0, length)).reduce(
      (total, character, index) => total + Number(character) * (length + 1 - index), 0
    );
    const remainder = (sum * 10) % 11;
    if (Number(document[length]) !== (remainder === 10 ? 0 : remainder)) return false;
  }
  return true;
}

export function isValidDocument(value: string): boolean {
  return isValidCpf(value) || isValidCnpj(value);
}

export function formatDocument(value: string): string {
  const document = normalizeDocument(value);
  if (isValidCpf(document)) return document.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  if (isValidCnpj(document)) return document.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5");
  return value;
}
