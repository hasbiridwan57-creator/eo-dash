import { describe, it, expect, beforeEach } from 'vitest';
import { migrateV1toV2 } from '../store/migrate';

describe('migrateV1toV2', () => {
  it('migrasi trip tunggal v1 -> bentuk multi-trip v2', () => {
    const v1 = {
      trip: {
        id: 't-old',
        name: 'Trip Lama',
        people: [{ id: 'p1', name: 'A' }],
        expenses: [],
        settlements: [],
      },
    };
    const v2 = migrateV1toV2(v1 as any);
    expect(v2.activeTripId).toBe('t-old');
    expect(Object.keys(v2.trips)).toEqual(['t-old']);
    expect(v2.trips['t-old'].name).toBe('Trip Lama');
  });

  it('state null / bentuk tidak dikenal -> state kosong (bukan throw)', () => {
    expect(migrateV1toV2(null as any)).toEqual({ trips: {}, activeTripId: null });
    expect(migrateV1toV2(undefined as any)).toEqual({ trips: {}, activeTripId: null });
    expect(migrateV1toV2({ unrelated: true } as any)).toEqual({ trips: {}, activeTripId: null });
  });

  it('trip v1 yang rusak (people bukan array) -> state kosong', () => {
    const v1 = { trip: { id: 'x', name: 'x', people: 'not-an-array' } };
    expect(migrateV1toV2(v1 as any)).toEqual({ trips: {}, activeTripId: null });
  });
});
