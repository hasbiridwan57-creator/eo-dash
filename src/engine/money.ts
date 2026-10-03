/**
 * Mesin uang EO-Dash — INTEGER Rupiah only.
 * Aturan keras PRD Lampiran A: dilarang float di state maupun perhitungan.
 *
 * API mengikuti Lampiran B:
 *   assertRp, sum, mulDivFloor, mulDivCeil, formatRp, parseRp, formatBp
 */

export type Rupiah = number;
export type Bp = number;

export const MAX_MONEY: Rupiah = 100_000_000_000;

const idrFormatter = new Intl.NumberFormat('id-ID');

export function assertRp(n: unknown): asserts n is Rupiah {
  if (typeof n !== 'number' || !Number.isSafeInteger(n)) {
    throw new Error(`Rupiah harus safe integer, dapat: ${String(n)}`);
  }
}

export function isRp(n: unknown): n is Rupiah {
  return typeof n === 'number' && Number.isSafeInteger(n);
}

export function sum(list: readonly Rupiah[]): Rupiah {
  let total = 0;
  for (const v of list) {
    assertRp(v);
    total += v;
  }
  assertRp(total);
  return total;
}

export function mulDivFloor(a: Rupiah, b: number, c: number): number {
  assertRp(a);
  if (!Number.isSafeInteger(b)) throw new Error(`b harus safe integer, dapat: ${String(b)}`);
  if (!Number.isSafeInteger(c) || c === 0) throw new Error(`c harus safe integer bukan nol, dapat: ${String(c)}`);

  const num = BigInt(a) * BigInt(b);
  const den = BigInt(c);
  let q = num / den;
  const r = num % den;
  if (r !== 0n && (num < 0n) !== (den < 0n)) q -= 1n;
  return Number(q);
}

export function mulDivCeil(a: Rupiah, b: number, c: number): number {
  assertRp(a);
  if (!Number.isSafeInteger(b)) throw new Error(`b harus safe integer, dapat: ${String(b)}`);
  if (!Number.isSafeInteger(c) || c === 0) throw new Error(`c harus safe integer bukan nol, dapat: ${String(c)}`);

  const num = BigInt(a) * BigInt(b);
  const den = BigInt(c);
  let q = num / den;
  const r = num % den;
  if (r !== 0n && (num < 0n) === (den < 0n)) q += 1n;
  return Number(q);
}

export function formatRp(n: Rupiah): string {
  assertRp(n);
  const sign = n < 0 ? '-' : '';
  return `${sign}Rp${idrFormatter.format(Math.abs(n))}`;
}

export function parseRp(text: string): Rupiah | null {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isSafeInteger(n) && n <= MAX_MONEY ? n : null;
}

export function percentToBp(input: string): Bp | null {
  const s = input.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ''] = s.split('.');
  const bp = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  return bp <= 10000 ? bp : null;
}

export function formatBp(bp: Bp): string {
  const sign = bp < 0 ? '-' : '';
  const abs = Math.abs(bp);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  const fracStr = frac === 0 ? '' : `,${String(frac).padStart(2, '0')}`;
  return `${sign}${whole}${fracStr}%`;
}
