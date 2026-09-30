import { describe, it, expect } from 'vitest';
import { settle, settleGreedy, settleOptimal } from './settle';
import { netBalance } from './balance';
import type { Trip, Expense, Money } from './types';

function makeExpense(
  id: string,
  amount: number,
  payers: { personId: string; amount: number }[],
  participantIds: string[]
): Expense {
  return {
    id,
    title: `expense-${id}`,
    category: 'test',
    amount,
    payers,
    split: { type: 'equal', participantIds },
    createdAt: '2026-09-29T00:00:00.000Z',
  };
}

function tripWith(
  people: string[],
  expenses: Expense[],
  settlements: { from: string; to: string; amount: number }[] = []
): Trip {
  return {
    id: 't1',
    name: 'Test Trip',
    people: people.map(id => ({ id, name: id })),
    expenses,
    settlements: settlements.map((s, i) => ({
      id: `s${i}`,
      from: s.from,
      to: s.to,
      amount: s.amount,
      paidAt: '2026-09-29T00:00:00.000Z',
    })),
  };
}

describe('settle (greedy, maks n-1 transfer)', () => {
  it('Skenario 1: B->A 33.333, C->A 33.333', () => {
    const trip = tripWith(['A', 'B', 'C'], [makeExpense('e1', 100000, [{ personId: 'A', amount: 100000 }], ['A', 'B', 'C'])]);
    const result = settle(netBalance(trip));
    expect(result).toEqual([
      { from: 'B', to: 'A', amount: 33333 },
      { from: 'C', to: 'A', amount: 33333 },
    ]);
  });

  it('Skenario 2: 3x 25.000 ke Budi', () => {
    const trip = tripWith(
      ['Budi', 'Ani', 'Citra', 'Dedi'],
      [makeExpense('e1', 100000, [{ personId: 'Budi', amount: 100000 }], ['Budi', 'Ani', 'Citra', 'Dedi'])]
    );
    const result = settle(netBalance(trip));
    // Budi +75.000; greedy: debitur terbesar dulu (tie -> personId ascending)
    // Saldo: Ani -25.000, Citra -25.000, Dedi -25.000, Budi +75.000
    expect(result).toEqual([
      { from: 'Ani', to: 'Budi', amount: 25000 },
      { from: 'Citra', to: 'Budi', amount: 25000 },
      { from: 'Dedi', to: 'Budi', amount: 25000 },
    ]);
  });

  it('Skenario 3: multi-payer -> C->A 25.000, D->B 15.000, D->A 10.000', () => {
    const trip = tripWith(
      ['A', 'B', 'C', 'D'],
      [
        makeExpense(
          'e1',
          100000,
          [
            { personId: 'A', amount: 60000 },
            { personId: 'B', amount: 40000 },
          ],
          ['A', 'B', 'C', 'D']
        ),
      ]
    );
    const result = settle(netBalance(trip));
    // Saldo: A +35.000, B +15.000, C -25.000, D -25.000
    // Greedy: kreditur terbesar A(35k) <-> debitur terbesar (tie C/D -> personId ascending -> C)
    // C->A 25.000. Lalu A sisa 10.000, D -25.000 <-> A 10.000 -> D->A 10.000, D sisa 15.000 -> D->B 15.000
    expect(result).toEqual([
      { from: 'C', to: 'A', amount: 25000 },
      { from: 'D', to: 'A', amount: 10000 },
      { from: 'D', to: 'B', amount: 15000 },
    ]);
  });

  it('Skenario 6: pelunasan parsial -> sisa C->A 33.333', () => {
    const trip = tripWith(
      ['A', 'B', 'C'],
      [makeExpense('e1', 100000, [{ personId: 'A', amount: 100000 }], ['A', 'B', 'C'])],
      [{ from: 'B', to: 'A', amount: 33333 }]
    );
    const result = settle(netBalance(trip));
    expect(result).toEqual([{ from: 'C', to: 'A', amount: 33333 }]);
  });

  it('Skenario 7: semua saldo 0 -> daftar transfer kosong', () => {
    const trip = tripWith(['A', 'B'], [makeExpense('e1', 10000, [{ personId: 'A', amount: 10000 }], ['A', 'B'])]);
    // A bayar 10.000, equal A/B -> share 5.000/5.000 -> A +5.000, B -5.000
    // Tidak ada saldo 0 murni... pakai trip tanpa expense
    const emptyTrip = tripWith(['A', 'B'], []);
    expect(settle(netBalance(emptyTrip))).toEqual([]);
  });

  it('Skenario 7: edit expense -> saldo berubah benar (derived state)', () => {
    const base = makeExpense('e1', 100000, [{ personId: 'A', amount: 100000 }], ['A', 'B']);
    const trip = tripWith(['A', 'B'], [base]);
    expect(netBalance(trip)).toEqual({ A: 50000, B: -50000 });

    const edited = { ...base, amount: 200000, payers: [{ personId: 'A', amount: 200000 }] };
    const trip2 = tripWith(['A', 'B'], [edited]);
    expect(netBalance(trip2)).toEqual({ A: 100000, B: -100000 });
  });

  it('Invariant: jumlah transfer <= n-1', () => {
    const trip = tripWith(
      ['A', 'B', 'C', 'D', 'E'],
      [makeExpense('e1', 99999, [{ personId: 'A', amount: 99999 }], ['A', 'B', 'C', 'D', 'E'])]
    );
    const result = settle(netBalance(trip));
    expect(result.length).toBeLessThanOrEqual(4);
  });

  it('Invariant: semua transfer > 0 dan from !== to', () => {
    const trip = tripWith(
      ['A', 'B', 'C'],
      [makeExpense('e1', 100001, [{ personId: 'A', amount: 100001 }], ['A', 'B', 'C'])]
    );
    const result = settle(netBalance(trip));
    for (const t of result) {
      expect(t.amount).toBeGreaterThan(0);
      expect(t.from).not.toBe(t.to);
    }
  });
});

describe('settleOptimal (S12)', () => {
  it('counterexample greedy: menghasilkan transfer lebih sedikit', () => {
    // Saldo: A +10, B +9, C -6, D -4, E -9
    const balances = { a: 10, b: 9, c: -6, d: -4, e: -9 };
    const greedy = settleGreedy(balances);
    const optimal = settleOptimal(balances);
    expect(optimal.length).toBeLessThanOrEqual(greedy.length);
    expect(optimal.length).toBe(3);
  });

  it('sample trip: optimal sama dengan atau lebih sedikit dari greedy', () => {
    const balances = { ani: -128334, budi: -108333, citra: 61667, dedi: 175000 };
    const greedy = settleGreedy(balances);
    const optimal = settleOptimal(balances);
    expect(optimal.length).toBeLessThanOrEqual(greedy.length);
  });

  it('lebih dari 12 orang bukan-nol -> hasil sama dengan greedy (tidak hang)', () => {
    const balances: Record<string, number> = {};
    for (let i = 1; i <= 13; i++) balances[`p${i}`] = i % 2 === 0 ? -i : i;
    balances.p1 -= 13;
    const greedy = settleGreedy(balances);
    const optimal = settleOptimal(balances);
    expect(optimal).toEqual(greedy);
  });

  it('menerapkan semua transfer membuat semua saldo 0', () => {
    const balances = { a: 10, b: 9, c: -6, d: -4, e: -9 };
    const transfers = settleOptimal(balances);
    const after = { ...balances };
    for (const t of transfers) {
      after[t.from] += t.amount;
      after[t.to] -= t.amount;
    }
    for (const v of Object.values(after)) expect(v).toBe(0);
  });
});
