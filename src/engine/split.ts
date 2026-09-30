/* Split engine — pembagian uang dengan integer math murni. */

import { assertIntegerMoney, isMoney, type Money } from './money';
import type { Expense } from './types';

export type Share = { personId: string; amount: Money };

/**
 * Equal split dengan sisa pembulatan deterministik.
 * Aturan (AGENTS.md §4): base = floor(amount / n), r = amount - base*n.
 * Urutkan participantIds ascending; r peserta pertama mendapat base+1.
 */
export function splitEqual(amount: Money, participantIds: string[]): Share[] {
  assertIntegerMoney(amount);
  if (amount <= 0) throw new Error(`amount must be > 0, got ${amount}`);
  if (!participantIds || participantIds.length === 0) throw new Error('participants must not be empty');

  const sorted = [...participantIds].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const seen = new Set<string>();
  for (const id of sorted) {
    if (seen.has(id)) throw new Error(`duplicate participant: ${id}`);
    seen.add(id);
  }

  const n = sorted.length;
  const base = Math.floor(amount / n);
  const remainder = amount - base * n;

  return sorted.map((personId, i) => ({
    personId,
    amount: i < remainder ? base + 1 : base,
  }));
}

/** Percentage split — largest remainder method, integer math. */
export function splitPercentage(amount: Money, shares: { personId: string; bp: number }[]): Share[] {
  assertIntegerMoney(amount);
  const totalBp = shares.reduce((sum, s) => sum + s.bp, 0);
  if (totalBp !== 10000) throw new Error(`percentage total must be 10000 bp, got ${totalBp}`);

  const rows = shares.map(s => {
    const num = amount * s.bp;
    return { personId: s.personId, floor: Math.floor(num / 10000), rem: num % 10000 };
  });

  const sumFloor = rows.reduce((sum, r) => sum + r.floor, 0);
  let leftover = amount - sumFloor;

  const sorted = [...rows].sort((a, b) => 
    b.rem !== a.rem ? b.rem - a.rem : (a.personId < b.personId ? -1 : 1)
  );
  
  for (let i = 0; i < sorted.length && leftover > 0; i++) {
    sorted[i].floor += 1;
    leftover -= 1;
  }

  return sorted.map(r => ({ personId: r.personId, amount: r.floor }));
}

/** Custom split — validasi total saja. */
export function splitCustom(amount: Money, shares: { personId: string; amount: Money }[]): Share[] {
  assertIntegerMoney(amount);
  const total = shares.reduce((sum, s) => sum + s.amount, 0);
  if (total !== amount) throw new Error(`custom total ${total} != amount ${amount}`);
  return shares;
}

/** Satu-satunya pintu untuk menghitung share sebuah expense. */
export function computeShares(e: Expense): Share[] {
  switch (e.split.type) {
    case 'equal':
      return splitEqual(e.amount, e.split.participantIds);
    case 'percentage':
      return splitPercentage(e.amount, e.split.shares);
    case 'custom':
      return splitCustom(e.amount, e.split.shares);
  }
}
