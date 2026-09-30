import { describe, it, expect } from 'vitest';
import { netBalance } from './balance';
import type { Trip, Expense, Settlement } from './types';

function makeExpense(
  id: string,
  amount: number,
  payerId: string,
  participantIds: string[]
): Expense {
  return {
    id,
    title: `expense-${id}`,
    category: 'test',
    amount,
    payers: [{ personId: payerId, amount }],
    split: { type: 'equal', participantIds },
    createdAt: '2026-09-29T00:00:00.000Z',
  };
}

function makeSettlement(id: string, from: string, to: string, amount: number): Settlement {
  return { id, from, to, amount, paidAt: '2026-09-29T00:00:00.000Z' };
}

describe('netBalance (saldo derived dari expenses + settlements)', () => {
  it('Skenario 1: A bayar 100.000 equal A/B/C -> A +66.666, B -33.333, C -33.333', () => {
    const trip: Trip = {
      id: 't1',
      name: 'Test Trip',
      people: [
        { id: 'A', name: 'A' },
        { id: 'B', name: 'B' },
        { id: 'C', name: 'C' },
      ],
      expenses: [makeExpense('e1', 100000, 'A', ['A', 'B', 'C'])],
      settlements: [],
    };
    expect(netBalance(trip)).toEqual({ A: 66666, B: -33333, C: -33333 });
  });

  it('Skenario 3: multi-payer A 60.000 B 40.000 equal 4 -> A +35.000 B +15.000 C -25.000 D -25.000', () => {
    const expense: Expense = {
      ...makeExpense('e1', 100000, 'A', ['A', 'B', 'C', 'D']),
      payers: [
        { personId: 'A', amount: 60000 },
        { personId: 'B', amount: 40000 },
      ],
    };
    const trip: Trip = {
      id: 't1',
      name: 'Test Trip',
      people: ['A', 'B', 'C', 'D'].map(id => ({ id, name: id })),
      expenses: [expense],
      settlements: [],
    };
    expect(netBalance(trip)).toEqual({ A: 35000, B: 15000, C: -25000, D: -25000 });
  });

  it('Skenario 6: pelunasan parsial B->A 33.333 setelah Skenario 1', () => {
    const trip: Trip = {
      id: 't1',
      name: 'Test Trip',
      people: ['A', 'B', 'C'].map(id => ({ id, name: id })),
      expenses: [makeExpense('e1', 100000, 'A', ['A', 'B', 'C'])],
      settlements: [makeSettlement('s1', 'B', 'A', 33333)],
    };
    expect(netBalance(trip)).toEqual({ A: 33333, B: 0, C: -33333 });
  });

  it('Invariant: jumlah semua net balance == 0', () => {
    const trip: Trip = {
      id: 't1',
      name: 'Test Trip',
      people: ['A', 'B', 'C', 'D'].map(id => ({ id, name: id })),
      expenses: [
        makeExpense('e1', 100000, 'A', ['A', 'B', 'C', 'D']),
        makeExpense('e2', 45000, 'C', ['A', 'C']),
        makeExpense('e3', 77777, 'D', ['B', 'C', 'D']),
      ],
      settlements: [makeSettlement('s1', 'B', 'A', 12000)],
    };
    const balances = netBalance(trip);
    const sum = Object.values(balances).reduce((a, b) => a + b, 0);
    expect(sum).toBe(0);
  });

  it('Skenario 7 edge: payer bukan participant -> A tetap kreditur penuh', () => {
    const trip: Trip = {
      id: 't1',
      name: 'Test Trip',
      people: ['A', 'B', 'C'].map(id => ({ id, name: id })),
      expenses: [makeExpense('e1', 50000, 'A', ['B', 'C'])],
      settlements: [],
    };
    expect(netBalance(trip)).toEqual({ A: 50000, B: -25000, C: -25000 });
  });

  it('Skenario 7 edge: trip kosong -> saldo kosong', () => {
    const trip: Trip = {
      id: 't1',
      name: 'Empty',
      people: [],
      expenses: [],
      settlements: [],
    };
    expect(netBalance(trip)).toEqual({});
  });
});
