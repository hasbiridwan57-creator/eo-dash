import { describe, it, expect } from 'vitest';
import { draftToExpense, expenseToDraft, emptyDraft } from './ExpenseForm';
import type { Expense, Person } from '../engine/types';

const people: Person[] = [
  { id: 'p1', name: 'Ani' },
  { id: 'p2', name: 'Budi' },
];

describe('ExpenseForm logic (R1b)', () => {
  it('validasi: 99% persentase -> error menyebut sisa', () => {
    const draft = {
      ...emptyDraft(people),
      amountText: '100000',
      splitType: 'percentage' as const,
      pctText: { p1: '99' },
    };
    const r = draftToExpense(draft, people);
    expect('errors' in r).toBe(true);
    if ('errors' in r) expect(r.errors.join(' ')).toMatch(/Total persentase harus 100%/);
  });

  it('validasi: custom kurang -> error menyebut selisih', () => {
    const draft = {
      ...emptyDraft(people),
      amountText: '100000',
      splitType: 'custom' as const,
      customText: { p1: '50000' },
    };
    const r = draftToExpense(draft, people);
    expect('errors' in r).toBe(true);
    if ('errors' in r) expect(r.errors.join(' ')).toMatch(/Total pembagian/);
  });

  it('Skenario 3 lewat draft (multi-payer 60rb/40rb, equal 4 orang)', () => {
    const draft = {
      ...emptyDraft(people),
      title: 'Pengeluaran',
      amountText: '100000',
      payerMode: 'multi' as const,
      multiPayers: { p1: '60000', p2: '40000' },
      splitType: 'equal' as const,
      equalIds: new Set(['p1', 'p2']),
    };
    const r = draftToExpense(draft, people);
    expect('errors' in r).toBe(false);
    if (!('errors' in r)) {
      expect(r.payers).toEqual([
        { personId: 'p1', amount: 60000 },
        { personId: 'p2', amount: 40000 },
      ]);
    }
  });

  it('Skenario 4 lewat draft (percentage 40/30/20/10)', () => {
    const four: Person[] = [
      { id: 'p1', name: 'Ani' },
      { id: 'p2', name: 'Budi' },
      { id: 'p3', name: 'Citra' },
      { id: 'p4', name: 'Dedi' },
    ];
    const draft = {
      ...emptyDraft(four),
      title: 'Pengeluaran',
      amountText: '400000',
      splitType: 'percentage' as const,
      pctText: { p1: '40', p2: '30', p3: '20', p4: '10' },
    };
    const r = draftToExpense(draft, four);
    expect('errors' in r).toBe(false);
    if (!('errors' in r)) {
      expect(r.amount).toBe(400000);
      expect(r.split.type).toBe('percentage');
    }
  });

  it('round-trip edit: expense -> draft -> expense identik (equal)', () => {
    const original: Expense = {
      id: 'e1',
      title: 'Makan',
      category: 'Makan',
      amount: 100000,
      payers: [{ personId: 'p1', amount: 100000 }],
      split: { type: 'equal', participantIds: ['p1', 'p2'] },
      createdAt: '2026-09-30T00:00:00.000Z',
    };
    const draft = expenseToDraft(original);
    const result = draftToExpense(draft, people, original.id, original.createdAt);
    expect('errors' in result).toBe(false);
    if (!('errors' in result)) {
      expect(result.id).toBe('e1');
      expect(result.amount).toBe(100000);
      expect(result.split).toEqual({ type: 'equal', participantIds: ['p1', 'p2'] });
      expect(result.payers).toEqual(original.payers);
    }
  });

  it('round-trip edit: percentage -> draft -> expense (bp dipulihkan)', () => {
    const original: Expense = {
      id: 'e2',
      title: 'Penginapan',
      category: 'Penginapan',
      amount: 400000,
      payers: [{ personId: 'p1', amount: 400000 }],
      split: {
        type: 'percentage',
        shares: [
          { personId: 'p1', bp: 4000 },
          { personId: 'p2', bp: 6000 },
        ],
      },
      createdAt: '2026-09-30T00:00:00.000Z',
    };
    const draft = expenseToDraft(original);
    const result = draftToExpense(draft, people, original.id, original.createdAt);
    expect('errors' in result).toBe(false);
    if (!('errors' in result)) {
      expect(result.split).toEqual({
        type: 'percentage',
        shares: [
          { personId: 'p1', bp: 4000 },
          { personId: 'p2', bp: 6000 },
        ],
      });
    }
  });

  it('round-trip edit: custom -> draft -> expense', () => {
    const original: Expense = {
      id: 'e3',
      title: 'Oleh-oleh',
      category: 'Belanja',
      amount: 90000,
      payers: [{ personId: 'p2', amount: 90000 }],
      split: {
        type: 'custom',
        shares: [
          { personId: 'p1', amount: 30000 },
          { personId: 'p2', amount: 60000 },
        ],
      },
      createdAt: '2026-09-30T00:00:00.000Z',
    };
    const draft = expenseToDraft(original);
    const result = draftToExpense(draft, people, original.id, original.createdAt);
    expect('errors' in result).toBe(false);
    if (!('errors' in result)) {
      expect(result.split).toEqual({
        type: 'custom',
        shares: [
          { personId: 'p1', amount: 30000 },
          { personId: 'p2', amount: 60000 },
        ],
      });
    }
  });
});
