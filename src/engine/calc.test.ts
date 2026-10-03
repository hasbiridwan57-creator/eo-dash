import { describe, it, expect } from 'vitest';
import { netProfit, marginBp, ticketsToBreakEven } from './calc';
import type { Event } from './types';

const baseEvent: Event = {
  id: 'e1', name: 'Test', date: '2026-01-01', budgetCap: 250_000_000,
  tickets: [], vendors: [], expenses: [], tasks: [], risks: [], sponsors: [], createdAt: '2026-01-01'
};

describe('M1: Financial Engine', () => {
  it('Lampiran D Case 1: Event Sehat', () => {
    const ev: Event = {
      ...baseEvent,
      tickets: [
        { id: '1', category: 'VIP', qty: 120, price: 750000, channel: 'L' },
        { id: '2', category: 'Reg', qty: 600, price: 250000, channel: 'W' },
        { id: '3', category: 'Early', qty: 150, price: 275000, channel: 'IG' },
      ],
      vendors: [{ id: 'v1', name: 'V', category: 'S', fee: 230_000_000, paid: 0 }]
    };
    expect(netProfit(ev)).toBe(51_250_000);
    expect(marginBp(ev)).toBe(1822);
    expect(ticketsToBreakEven(ev)).toBe(0);
  });

  it('Lampiran D Case 4: Floor negatif', () => {
    const ev: Event = {
      ...baseEvent,
      tickets: [{ id: '1', category: 'R', qty: 1, price: 3, channel: 'W' }],
      vendors: [{ id: 'v1', name: 'V', category: 'S', fee: 4, paid: 0 }]
    };
    expect(marginBp(ev)).toBe(-3334);
  });
});
