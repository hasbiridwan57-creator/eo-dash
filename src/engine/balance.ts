/* Balance engine — saldo adalah DERIVED state, tidak pernah disimpan. */

import { splitEqual, splitPercentage, splitCustom, computeShares } from './split';
import type { Trip, Expense, Settlement, Person, Money } from './types';
import { assertIntegerMoney } from './money';

export type Balances = Record<string, Money>;

export function netBalance(trip: Trip): Balances {
  return computeBalances(trip.people, trip.expenses, trip.settlements);
}

/**
 * Hitung net balance semua peserta dari expenses + settlements.
 * Aturan (AGENTS.md §6):
 *   - expense: payer += payer.amount; peserta -= share
 *   - settlement: from += amount; to -= amount
 * Positif = kreditur, negatif = debitur.
 */
export function computeBalances(
  people: Person[],
  expenses: Expense[],
  settlements: Settlement[],
): Balances {
  const balances: Balances = {};
  for (const p of people) balances[p.id] = 0;

  for (const expense of expenses) {
    assertIntegerMoney(expense.amount);

    for (const payer of expense.payers) {
      assertIntegerMoney(payer.amount);
      balances[payer.personId] = (balances[payer.personId] ?? 0) + payer.amount;
    }

    const shares = computeShares(expense);

    for (const share of shares) {
      const sid = share.personId;
      const amt = share.amount;
      balances[sid] = (balances[sid] ?? 0) - amt;
    }
  }

  for (const s of settlements) {
    assertIntegerMoney(s.amount);
    balances[s.from] = (balances[s.from] ?? 0) + s.amount;
    balances[s.to] = (balances[s.to] ?? 0) - s.amount;
  }

  return balances;
}

/** Untuk tabel transparansi: dibayar, porsi, net per orang. */
export function computePerPerson(
  people: Person[],
  expenses: Expense[],
  settlements: Settlement[]
) {
  const paid: Record<string, number> = {};
  const share: Record<string, number> = {};
  const settled: Record<string, number> = {};
  for (const p of people) {
    paid[p.id] = 0;
    share[p.id] = 0;
    settled[p.id] = 0;
  }
  for (const e of expenses) {
    for (const p of e.payers) paid[p.personId] = (paid[p.personId] ?? 0) + p.amount;
    for (const s of computeShares(e)) share[s.personId] = (share[s.personId] ?? 0) + s.amount;
  }
  for (const st of settlements) {
    settled[st.from] = (settled[st.from] ?? 0) + st.amount;
    settled[st.to] = (settled[st.to] ?? 0) - st.amount;
  }
  return people.map(p => ({
    personId: p.id,
    paid: paid[p.id],
    share: share[p.id],
    settled: settled[p.id],
    net: paid[p.id] - share[p.id] + settled[p.id],
  }));
}

export function totalsByCategory(expenses: Expense[]): { category: string; total: Money }[] {
  const m = new Map<string, number>();
  for (const e of expenses) m.set(e.category, (m.get(e.category) ?? 0) + e.amount);
  return [...m]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
