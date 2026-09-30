import { describe, it, expect } from 'vitest';
import { splitEqual, splitPercentage, splitCustom } from './split';

describe('splitEqual (equal split dengan sisa pembulatan deterministik)', () => {
  it('Skenario 1: Rp100.000 untuk 3 peserta -> A 33.334, B 33.333, C 33.333', () => {
    const result = splitEqual(100000, ['A', 'B', 'C']);
    expect(result).toEqual([
      { personId: 'A', amount: 33334 },
      { personId: 'B', amount: 33333 },
      { personId: 'C', amount: 33333 },
    ]);
  });

  it('Skenario 2: Rp100.000 untuk 4 peserta -> 25.000 masing-masing', () => {
    const result = splitEqual(100000, ['Budi', 'Ani', 'Citra', 'Dedi']);
    expect(result).toEqual([
      { personId: 'Ani', amount: 25000 },
      { personId: 'Budi', amount: 25000 },
      { personId: 'Citra', amount: 25000 },
      { personId: 'Dedi', amount: 25000 },
    ]);
  });

  it('Skenario 7 edge: amount <= 0 ditolak', () => {
    expect(() => splitEqual(0, ['A', 'B'])).toThrow();
    expect(() => splitEqual(-100, ['A', 'B'])).toThrow();
  });

  it('Skenario 7 edge: peserta duplikat ditolak', () => {
    expect(() => splitEqual(1000, ['A', 'A'])).toThrow();
  });

  it('Skenario 7 edge: peserta kosong ditolak', () => {
    expect(() => splitEqual(1000, [])).toThrow();
  });

  it('Skenario 4: Percentage 50/30/20 dari 100.001 -> 50.001, 30.000, 20.000', () => {
    const result = splitPercentage(100001, [
      { personId: 'A', bp: 5000 },
      { personId: 'B', bp: 3000 },
      { personId: 'C', bp: 2000 },
    ]);
    expect(result).toEqual([
      { personId: 'A', amount: 50001 },
      { personId: 'B', amount: 30000 },
      { personId: 'C', amount: 20000 },
    ]);
  });

  it('Skenario 4: percentage total != 10000 bp ditolak', () => {
    expect(() => splitPercentage(100000, [
      { personId: 'A', bp: 5000 },
      { personId: 'B', bp: 3000 },
      { personId: 'C', bp: 1900 },
    ])).toThrow();
  });

  it('Skenario 5: Custom A=10.000 B=30.000 C=50.000 dari 90.000', () => {
    const result = splitCustom(90000, [
      { personId: 'A', amount: 10000 },
      { personId: 'B', amount: 30000 },
      { personId: 'C', amount: 50000 },
    ]);
    expect(result).toEqual([
      { personId: 'A', amount: 10000 },
      { personId: 'B', amount: 30000 },
      { personId: 'C', amount: 50000 },
    ]);
  });

  it('Skenario 5: custom total 89.000 != amount 90.000 ditolak', () => {
    expect(() => splitCustom(90000, [
      { personId: 'A', amount: 10000 },
      { personId: 'B', amount: 30000 },
      { personId: 'C', amount: 49000 },
    ])).toThrow();
  });
});
