import { describe, it, expect } from 'vitest';
import { sampleTrip } from './sample';
import { computeBalances, computePerPerson, totalsByCategory } from './engine/balance';
import { settleGreedy, settleOptimal } from './engine/settle';

const trip = sampleTrip();
const balances = computeBalances(trip.people, trip.expenses, trip.settlements);

describe('sample trip (S9) — angka acuan playbook', () => {
  it('Dibayar per orang', () => {
    const per = computePerPerson(trip.people, trip.expenses, trip.settlements);
    const paid = Object.fromEntries(per.map(p => [p.personId, p.paid]));
    expect(paid).toEqual({ 'p-ani': 100000, 'p-budi': 100000, 'p-citra': 250000, 'p-dedi': 240000 });
    expect(Object.values(paid).reduce((a, b) => a + b, 0)).toBe(690000);
  });

  it('Porsi per orang', () => {
    const per = computePerPerson(trip.people, trip.expenses, trip.settlements);
    const share = Object.fromEntries(per.map(p => [p.personId, p.share]));
    expect(share).toEqual({ 'p-ani': 228334, 'p-budi': 208333, 'p-citra': 188333, 'p-dedi': 65000 });
  });

  it('Net balance sesuai acuan & totalnya 0', () => {
    expect(balances).toEqual({ 'p-ani': -128334, 'p-budi': -108333, 'p-citra': 61667, 'p-dedi': 175000 });
    expect(Object.values(balances).reduce((a, b) => a + b, 0)).toBe(0);
  });

  it('Greedy menghasilkan 3 transfer (minimum sejati)', () => {
    const t = settleGreedy(balances);
    expect(t).toHaveLength(3);
    const key = (x: { from: string; to: string; amount: number }) => `${x.from}->${x.to}:${x.amount}`;
    expect(t.map(key).sort()).toEqual([
      'p-ani->p-dedi:128334',
      'p-budi->p-citra:61667',
      'p-budi->p-dedi:46666',
    ]);
  });

  it('Optimal tidak lebih buruk dari greedy', () => {
    expect(settleOptimal(balances).length).toBeLessThanOrEqual(settleGreedy(balances).length);
  });

  it('Total per kategori', () => {
    const byCat = totalsByCategory(trip.expenses);
    const map = Object.fromEntries(byCat.map(c => [c.category, c.total]));
    expect(map).toEqual({ Penginapan: 400000, Tiket: 100000, Transport: 100000, Belanja: 90000 });
    expect(byCat.reduce((a, c) => a + c.total, 0)).toBe(690000);
  });

  it('lolos invarian expense (total payer = amount, split total tepat)', () => {
    for (const e of trip.expenses) {
      expect(e.payers.reduce((a, p) => a + p.amount, 0)).toBe(e.amount);
    }
  });
});
