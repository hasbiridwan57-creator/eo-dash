import { describe, it, expect } from 'vitest';
import { validateExpense } from './validate';
import type { Person, Expense } from './types';

const people: Person[] = [
  { id: 'p-a', name: 'Ani' },
  { id: 'p-b', name: 'Budi' },
  { id: 'p-c', name: 'Citra' },
];

function baseExpense(): Expense {
  return {
    id: 'e1',
    title: 'Tiket',
    category: 'Tiket',
    amount: 100000,
    payers: [{ personId: 'p-a', amount: 100000 }],
    split: { type: 'equal', participantIds: ['p-a', 'p-b', 'p-c'] },
    createdAt: '2026-09-29T00:00:00.000Z',
  };
}

describe('validateExpense', () => {
  it('expense valid -> ok', () => {
    const r = validateExpense(baseExpense(), people);
    expect(r.ok).toBe(true);
  });

  it('judul kosong -> error', () => {
    const e = baseExpense();
    e.title = '  ';
    const r = validateExpense(e, people);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBeGreaterThan(0);
  });

  it('amount tidak valid (0 / negatif / float) -> error', () => {
    const e1 = { ...baseExpense(), amount: 0 };
    const e2 = { ...baseExpense(), amount: -1000 };
    const e3 = { ...baseExpense(), amount: 1000.5 };
    expect(validateExpense(e1, people).ok).toBe(false);
    expect(validateExpense(e2, people).ok).toBe(false);
    expect(validateExpense(e3, people).ok).toBe(false);
  });

  it('payers kosong -> error', () => {
    const e = { ...baseExpense(), payers: [] };
    const r = validateExpense(e, people);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some(m => /pembayar/i.test(m))).toBe(true);
  });

  it('total payer ≠ amount -> error', () => {
    const e: Expense = {
      ...baseExpense(),
      payers: [
        { personId: 'p-a', amount: 60000 },
        { personId: 'p-b', amount: 30000 },
      ],
    };
    const r = validateExpense(e, people);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some(m => /90\.000.*100\.000|100\.000.*90\.000/i.test(m))).toBe(true);
  });

  it('personId payer tidak dikenal -> error', () => {
    const e: Expense = {
      ...baseExpense(),
      payers: [{ personId: 'p-x', amount: 100000 }],
    };
    expect(validateExpense(e, people).ok).toBe(false);
  });

  it('equal: peserta duplikat -> error', () => {
    const e: Expense = {
      ...baseExpense(),
      split: { type: 'equal', participantIds: ['p-a', 'p-a'] },
    };
    expect(validateExpense(e, people).ok).toBe(false);
  });

  it('equal: peserta tidak dikenal -> error', () => {
    const e: Expense = {
      ...baseExpense(),
      split: { type: 'equal', participantIds: ['p-a', 'p-x'] },
    };
    expect(validateExpense(e, people).ok).toBe(false);
  });

  it('percentage: total bp ≠ 10000 -> error menyebut persen', () => {
    const e: Expense = {
      ...baseExpense(),
      split: { type: 'percentage', shares: [
        { personId: 'p-a', bp: 5000 },
        { personId: 'p-b', bp: 3000 },
        { personId: 'p-c', bp: 1900 },
      ] },
    };
    const r = validateExpense(e, people);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some(m => /99%/i.test(m))).toBe(true);
  });

  it('custom: total ≠ amount -> error menyebut nominal', () => {
    const e: Expense = {
      ...baseExpense(),
      split: { type: 'custom', shares: [
        { personId: 'p-a', amount: 10000 },
        { personId: 'p-b', amount: 30000 },
        { personId: 'p-c', amount: 49000 },
      ] },
    };
    const r = validateExpense(e, people);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some(m => /89\.000/i.test(m))).toBe(true);
  });

  it('kategori tidak terdaftar -> error', () => {
    const e = { ...baseExpense(), category: 'narkoba' };
    expect(validateExpense(e, people).ok).toBe(false);
  });

  it('mengumpulkan banyak error sekaligus', () => {
    const e: Expense = {
      ...baseExpense(),
      title: '',
      amount: 0,
      payers: [],
      split: { type: 'equal', participantIds: [] },
    };
    const r = validateExpense(e, people);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBeGreaterThanOrEqual(3);
  });
});
