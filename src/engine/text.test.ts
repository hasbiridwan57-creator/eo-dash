import { describe, it, expect } from 'vitest';
import { settlementText } from './text';
import type { Transfer } from './settle';

describe('settlementText', () => {
  it('format sama persis dengan contoh playbook', () => {
    const transfers: Transfer[] = [
      { from: 'B', to: 'A', amount: 33333 },
      { from: 'C', to: 'A', amount: 33333 },
    ];
    const nameOf = (id: string) => id;
    const expected = `*Settlement: Liburan Malang 2026*\nB → A: Rp33.333\nC → A: Rp33.333\n\nDihitung dengan DebtSettler`;
    expect(settlementText('Liburan Malang 2026', transfers, nameOf)).toBe(expected);
  });

  it('transfers kosong -> pesan lunas', () => {
    expect(settlementText('T', [], () => 'x')).toBe(
      `*Settlement: T*\nSemua sudah lunas.\n\nDihitung dengan DebtSettler`
    );
  });
});
