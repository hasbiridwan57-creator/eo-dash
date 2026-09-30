import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { splitEqual } from './split';
import { netBalance } from './balance';
import { settle } from './settle';
import type { Trip, Expense, Money } from './types';

function makeArbitraryTrip(): fc.Arbitrary<Trip> {
  const peopleArb = fc.uniqueArray(fc.string({ minLength: 1, maxLength: 3 }).filter(s => /^[A-Za-z]+$/.test(s)), {
    minLength: 2,
    maxLength: 6,
  });

  return peopleArb.chain(people => {
    const expensesArb = fc.array(
      fc.integer({ min: 1, max: 500000 }).map(amount => {
        const payer = people[0];
        const participants = people;
        const expense: Expense = {
          id: `e${Math.random()}`,
          title: 'p',
          category: 'test',
          amount,
          payers: [{ personId: payer, amount }],
          split: { type: 'equal', participantIds: participants },
          createdAt: '2026-09-29T00:00:00.000Z',
        };
        return expense;
      }),
      { maxLength: 5 }
    );

    return expensesArb.map(expenses => ({
      id: 't',
      name: 't',
      people: people.map(id => ({ id, name: id })),
      expenses,
      settlements: [],
    }));
  });
}

describe('Property tests (fast-check) — invariant AGENTS.md §8', () => {
  it('1. Jumlah share per expense == amount', () => {
    fc.assert(
      fc.property(
        fc.record({
          amount: fc.integer({ min: 1, max: 1000000 }),
          n: fc.integer({ min: 1, max: 10 }),
        }),
        ({ amount, n }) => {
          const ids = Array.from({ length: n }, (_, i) => `p${i}`);
          const shares = splitEqual(amount, ids);
          const sum = shares.reduce((acc, s) => acc + s.amount, 0);
          return sum === amount;
        }
      )
    );
  });

  it('2. Jumlah semua net balance == 0', () => {
    fc.assert(
      fc.property(makeArbitraryTrip(), trip => {
        const balances = netBalance(trip);
        const sum = Object.values(balances).reduce((a, b) => a + b, 0);
        return sum === 0;
      })
    );
  });

  it('3. Setelah semua transfer settle() diterapkan, semua saldo 0', () => {
    fc.assert(
      fc.property(makeArbitraryTrip(), trip => {
        const balances = netBalance(trip);
        const transfers = settle(balances);
        const after = { ...balances };
        for (const t of transfers) {
          after[t.from] += t.amount;
          after[t.to] -= t.amount;
        }
        return Object.values(after).every(v => v === 0);
      })
    );
  });

  it('4. Jumlah transfer <= n - 1', () => {
    fc.assert(
      fc.property(makeArbitraryTrip(), trip => {
        const balances = netBalance(trip);
        const transfers = settle(balances);
        return transfers.length <= trip.people.length - 1;
      })
    );
  });

  it('5. Semua transfer > 0 dan from !== to', () => {
    fc.assert(
      fc.property(makeArbitraryTrip(), trip => {
        const balances = netBalance(trip);
        const transfers = settle(balances);
        return transfers.every(t => t.amount > 0 && t.from !== t.to);
      })
    );
  });

  it('6. settle() deterministik: input sama -> output identik', () => {
    fc.assert(
      fc.property(makeArbitraryTrip(), trip => {
        const balances = netBalance(trip);
        const a = JSON.stringify(settle(balances));
        const b = JSON.stringify(settle(balances));
        return a === b;
      })
    );
  });
});
