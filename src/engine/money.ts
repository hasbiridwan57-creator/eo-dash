/* Money helpers — INTEGER Rupiah only. Dilarang float di state maupun engine. */

export type Money = number;
export const MAX_MONEY = 100_000_000_000;

const idrFormatter = new Intl.NumberFormat('id-ID');

export function isMoney(n: unknown): n is Money {
  return typeof n === 'number' && Number.isSafeInteger(n) && n > 0 && n <= MAX_MONEY;
}

/** Assertion invariant: uang harus integer terhingga. */
export function assertIntegerMoney(amount: unknown): asserts amount is Money {
  if (typeof amount !== 'number' || !Number.isInteger(amount)) {
    throw new Error(`Money must be an integer, got: ${String(amount)}`);
  }
}

/** Format integer Money ke string IDR: 100000 -> "Rp100.000" */
export function formatIDR(amount: Money): string {
  assertIntegerMoney(amount);
  return `Rp${idrFormatter.format(amount)}`;
}

/** Bagi 10000 bp rata ke n orang; sisa +1 ke yang pertama. */
export function equalBp(n: number): number[] {
  const base = Math.floor(10000 / n);
  const r = 10000 - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < r ? 1 : 0));
}

/** "Rp 1.250.000" -> 1250000 ; kosong/invalid -> null. Tidak ada desimal. */
export function parseRupiah(input: string): Money | null {
  const digits = input.replace(/\D/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isSafeInteger(n) && n <= MAX_MONEY ? n : null;
}

/** "33,33" | "33.33" | "5" -> basis points (3333 | 500). Tanpa float. */
export function percentToBp(input: string): number | null {
  const s = input.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ''] = s.split('.');
  const bp = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  return bp <= 10000 ? bp : null;
}

export function bpToPercentString(bp: number): string {
  const whole = Math.floor(bp / 100);
  const frac = bp % 100;
  return frac === 0 ? String(whole) : `${whole},${String(frac).padStart(2, '0').replace(/0$/, '')}`;
}
