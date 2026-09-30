import { describe, it, expect } from 'vitest';
import { tripExportSchema } from './schema';
import type { Trip } from '../engine/types';

const validTrip: Trip = {
  id: 't-1',
  name: 'Trip Test',
  people: [
    { id: 'p-1', name: 'Budi' },
    { id: 'p-2', name: 'Ani' },
  ],
  expenses: [
    {
      id: 'e-1',
      title: 'Makan',
      category: 'Makan',
      amount: 100000,
      payers: [{ personId: 'p-1', amount: 100000 }],
      split: { type: 'equal', participantIds: ['p-1', 'p-2'] },
      createdAt: '2026-09-30T00:00:00.000Z',
    },
  ],
  settlements: [],
};

describe('tripExportSchema', () => {
  it('menerima trip valid', () => {
    const r = tripExportSchema.safeParse({ ...validTrip, version: 2 });
    expect(r.success).toBe(true);
  });

  it('menolak trip dengan uang float', () => {
    const bad = JSON.parse(JSON.stringify(validTrip));
    bad.expenses[0].amount = 100000.5;
    const r = tripExportSchema.safeParse({ ...bad, version: 2 });
    expect(r.success).toBe(false);
  });

  it('menolak total payers != amount', () => {
    const bad = JSON.parse(JSON.stringify(validTrip));
    bad.expenses[0].payers[0].amount = 50000;
    const r = tripExportSchema.safeParse({ ...bad, version: 2 });
    expect(r.success).toBe(false);
  });

  it('menolak total bp != 10000 untuk percentage', () => {
    const bad = JSON.parse(JSON.stringify(validTrip));
    bad.expenses[0].split = {
      type: 'percentage',
      shares: [
        { personId: 'p-1', bp: 5000 },
        { personId: 'p-2', bp: 4000 },
      ],
    };
    const r = tripExportSchema.safeParse({ ...bad, version: 2 });
    expect(r.success).toBe(false);
  });

  it('menolak total custom != amount', () => {
    const bad = JSON.parse(JSON.stringify(validTrip));
    bad.expenses[0].split = {
      type: 'custom',
      shares: [
        { personId: 'p-1', amount: 60000 },
        { personId: 'p-2', amount: 60000 },
      ],
    };
    const r = tripExportSchema.safeParse({ ...bad, version: 2 });
    expect(r.success).toBe(false);
  });

  it('menolak personId tidak terdaftar', () => {
    const bad = JSON.parse(JSON.stringify(validTrip));
    bad.expenses[0].payers[0].personId = 'p-999';
    const r = tripExportSchema.safeParse({ ...bad, version: 2 });
    expect(r.success).toBe(false);
  });
});
