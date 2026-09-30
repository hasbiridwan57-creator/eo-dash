import { describe, it, expect } from 'vitest';
import { computePerPerson, totalsByCategory } from './balance';
import type { Person, Expense } from './types';

const people: Person[] = [
  { id: 'p-ani', name: 'Ani' },
  { id: 'p-budi', name: 'Budi' },
  { id: 'p-citra', name: 'Citra' },
  { id: 'p-dedi', name: 'Dedi' },
];

function expense(
  id: string,
  amount: number,
  payers: { personId: string; amount: number }[],
  participantIds: string[],
  category: string
): Expense {
  return {
    id,
    title: `e-${id}`,
    category,
    amount,
    payers,
    split: { type: 'equal', participantIds },
    createdAt: '2026-09-29T00:00:00.000Z',
  };
}

describe('computePerPerson (S9 sample trip subset)', () => {
  it('E1 Tiket 100.000 payer Budi equal 4 -> paid/share benar', () => {
    const expenses = [
      expense('e1', 100000, [{ personId: 'p-budi', amount: 100000 }], ['p-ani', 'p-budi', 'p-citra', 'p-dedi'], 'Tiket'),
    ];
    const rows = computePerPerson(people, expenses, []);
    const byId = Object.fromEntries(rows.map(r => [r.personId, r]));
    expect(byId['p-budi'].paid).toBe(100000);
    expect(byId['p-ani'].paid).toBe(0);
    expect(byId['p-ani'].share).toBe(25000);
    expect(byId['p-budi'].share).toBe(25000);
  });

  it('net = paid - share + settled, dan jumlah net = 0', () => {
    const expenses = [
      expense('e1', 100000, [{ personId: 'p-budi', amount: 100000 }], ['p-ani', 'p-budi', 'p-citra', 'p-dedi'], 'Tiket'),
      expense('e2', 90000, [{ personId: 'p-dedi', amount: 90000 }], ['p-ani', 'p-citra'], 'Belanja'),
    ];
    const settlements = [{ id: 's1', from: 'p-ani', to: 'p-budi', amount: 10000, paidAt: '2026-09-29T00:00:00.000Z' }];
    const rows = computePerPerson(people, expenses, settlements);
    const sum = rows.reduce((a, r) => a + r.net, 0);
    expect(sum).toBe(0);
    for (const r of rows) {
      expect(r.net).toBe(r.paid - r.share + r.settled);
    }
  });
});

describe('totalsByCategory', () => {
  it('gabung dan urut total per kategori', () => {
    const expenses = [
      expense('e1', 100000, [{ personId: 'p-budi', amount: 100000 }], ['p-ani', 'p-budi', 'p-citra', 'p-dedi'], 'Tiket'),
      expense('e2', 50000, [{ personId: 'p-ani', amount: 50000 }], ['p-ani', 'p-budi'], 'Tiket'),
      expense('e3', 200000, [{ personId: 'p-citra', amount: 200000 }], ['p-ani', 'p-citra'], 'Penginapan'),
    ];
    const totals = totalsByCategory(expenses);
    expect(totals).toEqual([
      { category: 'Penginapan', total: 200000 },
      { category: 'Tiket', total: 150000 },
    ]);
  });

  it('expenses kosong -> array kosong', () => {
    expect(totalsByCategory([])).toEqual([]);
  });
});
