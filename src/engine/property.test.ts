import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { splitEqual } from './split';
import { netBalance, computeBalances } from './balance';
import { settleGreedy } from './settle';
import type { Trip, Expense } from './types';

function makeRobustArbitraryTrip(): fc.Arbitrary<Trip> {
  const peopleArb = fc.uniqueArray(
    fc.string({ minLength: 1, maxLength: 4 }).filter(s => /^[a-z]+$/.test(s)),
    { minLength: 2, maxLength: 8 }
  );

  return peopleArb.chain(people => {
    const expensesArb = fc.array(
      fc.record({
        title: fc.constant('Expense'),
        category: fc.constant('Lainnya'),
        amount: fc.integer({ min: 100, max: 10_000_000 }),
        splitType: fc.constantFrom('equal' as const, 'percentage' as const, 'custom' as const),
      }).chain(base => {
        return fc.record({
          payers: fc.array(
            fc.record({
              personId: fc.constantFrom(...people),
              amount: fc.integer({ min: 1, max: base.amount }),
            }),
            { minLength: 1, maxLength: 3 }
          ).map(rawPayers => {
            const sum = rawPayers.reduce((a, p) => a + p.amount, 0);
            if (sum === base.amount) return rawPayers;
            return [{ personId: people[0], amount: base.amount }];
          }),
          split: (() => {
            if (base.splitType === 'equal') {
              return fc.subarray(people, { minLength: 1 }).map(participantIds => ({
                type: 'equal' as const,
                participantIds,
              }));
            }
            if (base.splitType === 'percentage') {
              return fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: people.length }).map(rawBps => {
                const total = rawBps.reduce((a, b) => a + b, 0);
                const bps = rawBps.map(b => Math.floor((b / total) * 10000));
                let diff = 10000 - bps.reduce((a, b) => a + b, 0);
                bps[0] += diff;
                const shares = people.slice(0, bps.length).map((personId, i) => ({ personId, bp: bps[i] }));
                return { type: 'percentage' as const, shares };
              });
            }
            return fc.array(fc.integer({ min: 0, max: base.amount }), { minLength: 1, maxLength: people.length }).map(rawAmts => {
              const sum = rawAmts.reduce((a, b) => a + b, 0);
              const amts = rawAmts.map(a => Math.floor((a / (sum || 1)) * base.amount));
              let diff = base.amount - amts.reduce((a, b) => a + b, 0);
              amts[0] += diff;
              const shares = people.slice(0, amts.length).map((personId, i) => ({ personId, amount: amts[i] }));
              return { type: 'custom' as const, shares };
            });
          })(),
        }).map((extra, idx): Expense => ({
          id: `e${idx}`,
          title: base.title,
          category: base.category,
          amount: base.amount,
          payers: extra.payers,
          split: extra.split,
          createdAt: '2026-09-29T00:00:00.000Z',
        }));
      }),
      { maxLength: 6 }
    );

    return expensesArb.map(expenses => ({
      id: 't-prop',
      name: 'Property Trip',
      people: people.map(id => ({ id, name: id })),
      expenses,
      settlements: [],
    }));
  });
}

describe('Property tests (fast-check) — 200 runs per properti dengan variasi penuh', () => {
  const opts = {
    numRuns: 200,
    // Cetak seed jika gagal agar reproducible
    beforeEach: () => {},
  };

  it('1. Jumlah share per expense == amount (200 runs)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        fc.array(fc.string({ minLength: 1, maxLength: 3 }), { minLength: 1, maxLength: 8 }),
        (amount, ids) => {
          const uniqueIds = Array.from(new Set(ids));
          const shares = splitEqual(amount, uniqueIds);
          const sum = shares.reduce((acc, s) => acc + s.amount, 0);
          return sum === amount;
        }
      ),
      opts
    );
  });

  it('2. Jumlah semua net balance == 0 (200 runs)', () => {
    fc.assert(
      fc.property(makeRobustArbitraryTrip(), trip => {
        const balances = computeBalances(trip.people, trip.expenses, trip.settlements);
        const sum = Object.values(balances).reduce((a, b) => a + b, 0);
        return sum === 0;
      }),
      opts
    );
  });

  it('3. Setelah semua transfer settle() diterapkan, semua saldo 0 (200 runs)', () => {
    fc.assert(
      fc.property(makeRobustArbitraryTrip(), trip => {
        const balances = computeBalances(trip.people, trip.expenses, trip.settlements);
        const transfers = settleGreedy(balances);
        const after: Record<string, number> = { ...balances };
        for (const t of transfers) {
          after[t.from] += t.amount;
          after[t.to] -= t.amount;
        }
        return Object.values(after).every(v => v === 0);
      }),
      opts
    );
  });

  it('4. Jumlah transfer <= activeCount - 1 (200 runs)', () => {
    fc.assert(
      fc.property(makeRobustArbitraryTrip(), trip => {
        const balances = computeBalances(trip.people, trip.expenses, trip.settlements);
        const transfers = settleGreedy(balances);
        const activeCount = Object.values(balances).filter(v => v !== 0).length;
        return transfers.length <= Math.max(0, activeCount - 1);
      }),
      opts
    );
  });

  it('5. Semua transfer > 0 dan from !== to (200 runs)', () => {
    fc.assert(
      fc.property(makeRobustArbitraryTrip(), trip => {
        const balances = computeBalances(trip.people, trip.expenses, trip.settlements);
        const transfers = settleGreedy(balances);
        return transfers.every(t => t.amount > 0 && t.from !== t.to);
      }),
      opts
    );
  });

  it('6. settle() deterministik: input sama -> output identik (200 runs)', () => {
    fc.assert(
      fc.property(makeRobustArbitraryTrip(), trip => {
        const balances = computeBalances(trip.people, trip.expenses, trip.settlements);
        const a = JSON.stringify(settleGreedy(balances));
        const b = JSON.stringify(settleGreedy(balances));
        return a === b;
      }),
      opts
    );
  });
});
