import { describe, it, expect } from 'vitest';
import { parseBackupFile, buildBackupJson } from './backup';
import { emptyWorkspace } from './schema';
import { isLegacyV2, migrateV2ToWorkspace } from './migrate';
import type { Event } from '../engine/types';

const sampleEvent: Event = {
  id: 'e1', name: 'Konser Test', date: '2026-12-31', budgetCap: 500_000_000,
  tickets: [{ id: 't1', category: 'VIP', qty: 10, price: 1000000, channel: 'Loket' }],
  vendors: [{ id: 'v1', name: 'Sound', category: 'Sound', fee: 50_000_000, paid: 25_000_000 }],
  expenses: [], tasks: [], risks: [], sponsors: [], createdAt: '2026-01-01',
};

describe('M2: Data Layer', () => {
  it('migrasi V2 -> Workspace v3 tidak kehilangan data', () => {
    const legacy = JSON.parse(JSON.stringify(sampleEvent));
    expect(isLegacyV2(legacy)).toBe(true);
    const ws = migrateV2ToWorkspace(legacy);
    expect(ws.schemaVersion).toBe(3);
    expect(ws.events).toHaveLength(1);
    expect(ws.events[0].name).toBe('Konser Test');
    expect(ws.currentEventId).toBe('e1');
  });

  it('data rusak tidak mengubah data lama (import ditolak)', () => {
    const corrupt = '{ this is not json';
    const res = parseBackupFile(corrupt);
    expect(res.ok).toBe(false);
    expect(res.workspace).toBeUndefined();
  });

  it('impor risiko tanpa Plan B ditolak', () => {
    const badEvent = { ...sampleEvent, risks: [{ id: 'r1', risk: 'Genset mati', impact: 'Tinggi', planB: '' }] };
    const ws = { schemaVersion: 3 as const, currentEventId: 'e1', events: [badEvent] };
    const res = parseBackupFile(JSON.stringify(ws));
    expect(res.ok).toBe(false);
    expect(res.error).toContain('Plan B');
  });

  it('round-trip: export lalu impor menghasilkan data identik', () => {
    const ws = emptyWorkspace();
    ws.events.push(sampleEvent);
    ws.currentEventId = 'e1';
    const json = buildBackupJson(ws);
    const res = parseBackupFile(json);
    expect(res.ok).toBe(true);
    expect(res.workspace?.events).toEqual([sampleEvent]);
  });
});
