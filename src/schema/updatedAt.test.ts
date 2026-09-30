/* Test R1a: marker "diedit" (updatedAt) */

import { describe, it, expect } from 'vitest';
import { tripExportSchema } from '../schema/schema';
import type { Trip, Expense } from '../engine/types';
import { sampleTrip } from '../sample';

function editWithUpdatedAt(): Expense {
  const t = sampleTrip();
  const e = t.expenses[0];
  return { ...e, updatedAt: '2026-09-30T12:00:00.000Z' };
}

describe('R1a: updatedAt', () => {
  it('tipe Expense menerima updatedAt opsional', () => {
    const e = editWithUpdatedAt();
    expect(e.updatedAt).toBe('2026-09-30T12:00:00.000Z');
  });

  it('schema Zod menerima updatedAt', () => {
    const t = sampleTrip();
    const withEdit = { ...t, expenses: [editWithUpdatedAt(), ...t.expenses.slice(1)], version: 2 };
    const r = tripExportSchema.safeParse(withEdit);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.expenses[0].updatedAt).toBe('2026-09-30T12:00:00.000Z');
  });

  it('fixture export LAMA (tanpa updatedAt) tetap lolos import', () => {
    const t = sampleTrip();
    const legacy = { ...t, version: 2 };
    const r = tripExportSchema.safeParse(legacy);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.expenses[0].updatedAt).toBeUndefined();
  });
});
