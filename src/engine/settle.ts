/* Settle engine — greedy settlement, menghasilkan instruksi transfer ringkas. */

import type { Money } from './types';
import type { Balances } from './balance';

export type Transfer = { from: string; to: string; amount: Money };

/**
 * Greedy settlement (AGENTS.md §6):
 * 1. Pisahkan kreditur (saldo > 0) & debitur (saldo < 0), abaikan 0.
 * 2. Ambil kreditur saldo terbesar & debitur utang terbesar (tie-break personId ascending).
 * 3. Transfer min(saldo kreditur, |utang debitur|).
 * 4. Berhenti saat semua 0.
 *
 * Hasil: paling banyak n-1 transfer. BUKAN jaminan minimum (masalah aslinya NP-hard).
 */
export function settleGreedy(balances: Balances): Transfer[] {
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0)
    .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < 0)
    .sort((a, b) => {
      const da = -a[1];
      const db = -b[1];
      return db !== da ? db - da : a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
    });

  // copy nilai mutable
  const c = creditors.map(([id, v]) => ({ id, v }));
  const d = debtors.map(([id, v]) => ({ id, v: -v }));

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < c.length && di < d.length) {
    const creditor = c[ci];
    const debtor = d[di];
    const amount = Math.min(creditor.v, debtor.v);
    if (amount > 0) {
      transfers.push({ from: debtor.id, to: creditor.id, amount });
    }
    creditor.v -= amount;
    debtor.v -= amount;
    if (creditor.v === 0) ci++;
    if (debtor.v === 0) di++;
  }

  return transfers;
}

export const settle = settleGreedy;

export const OPTIMAL_MAX_PEOPLE = 12;

/**
 * Settlement optimal untuk <= 12 orang bukan-nol: pecah saldo menjadi
 * grup sebanyak mungkin yang totalnya 0 (bitmask DP, 2^n). Setiap grup
 * diselesaikan greedy. Jumlah transfer = n - jumlah_grup.
 * Di atas 12 orang, jatuh kembali ke greedy (hindari 2^n meledak).
 */
export function settleOptimal(balances: Balances): Transfer[] {
  const people = Object.entries(balances)
    .filter(([, v]) => v !== 0)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const greedy = settleGreedy(balances);
  if (people.length === 0 || people.length > OPTIMAL_MAX_PEOPLE) return greedy;

  const n = people.length;
  const N = 1 << n;
  const sum = new Float64Array(N);
  for (let m = 1; m < N; m++) {
    const low = m & -m;
    sum[m] = sum[m ^ low] + people[31 - Math.clz32(low)][1];
  }

  const dp = new Int16Array(N);
  const from = new Int16Array(N);
  for (let m = 1; m < N; m++) {
    let best = -1;
    let bi = -1;
    for (let i = 0; i < n; i++) {
      if (!((m >> i) & 1)) continue;
      const v = dp[m ^ (1 << i)];
      if (v > best) {
        best = v;
        bi = i;
      }
    }
    dp[m] = best + (sum[m] === 0 ? 1 : 0);
    from[m] = bi;
  }

  const groups: number[][] = [];
  let m = N - 1;
  let cur: number[] = [];
  while (m) {
    const i = from[m];
    cur.push(i);
    m ^= 1 << i;
    if (sum[m] === 0) {
      groups.push(cur);
      cur = [];
    }
  }

  const out: Transfer[] = [];
  for (const g of groups) {
    const sub: Record<string, number> = {};
    for (const i of g) sub[people[i][0]] = people[i][1];
    out.push(...settleGreedy(sub));
  }
  return out.length <= greedy.length ? out : greedy;
}
