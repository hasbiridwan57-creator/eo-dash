
import { describe, it, expect } from 'vitest';
import {
  formatIDR,
  assertIntegerMoney,
  parseRupiah,
  percentToBp,
  bpToPercentString,
  equalBp,
  isMoney,
} from './money';

describe('Money Helpers', () => {
  it('formats IDR correctly', () => {
    expect(formatIDR(100000)).toBe('Rp100.000');
    expect(formatIDR(0)).toBe('Rp0');
  });

  it('asserts integer money correctly', () => {
    expect(() => assertIntegerMoney(1000)).not.toThrow();
    expect(() => assertIntegerMoney(1000.5)).toThrow();
    expect(() => assertIntegerMoney(NaN)).toThrow();
  });

  it('parseRupiah: "Rp 1.250.000" -> 1250000, "" -> null, "abc" -> null', () => {
    expect(parseRupiah('Rp 1.250.000')).toBe(1250000);
    expect(parseRupiah('')).toBe(null);
    expect(parseRupiah('abc')).toBe(null);
  });

  it('percentToBp: "33,33" -> 3333, "33.3" -> 3330, "5" -> 500, "100" -> 10000, "100,01" -> null', () => {
    expect(percentToBp('33,33')).toBe(3333);
    expect(percentToBp('33.3')).toBe(3330);
    expect(percentToBp('5')).toBe(500);
    expect(percentToBp('100')).toBe(10000);
    expect(percentToBp('100,01')).toBe(null);
  });

  it('bpToPercentString: bp 3333 -> "33,33", bp 500 -> "5", bp 10000 -> "100"', () => {
    expect(bpToPercentString(3333)).toBe('33,33');
    expect(bpToPercentString(500)).toBe('5');
    expect(bpToPercentString(10000)).toBe('100');
  });

  it('equalBp(3) -> [3334, 3333, 3333], equalBp(4) -> [2500, 2500, 2500, 2500]', () => {
    expect(equalBp(3)).toEqual([3334, 3333, 3333]);
    expect(equalBp(4)).toEqual([2500, 2500, 2500, 2500]);
  });
});

