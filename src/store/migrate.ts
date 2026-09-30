import type { Trip } from '../engine/types';

/** Bentuk store v1 (Tahap 1): trip tunggal / null. */
type V1State = { trip: Trip | null };

/** Bentuk store v2: multi-trip + activeTripId. */
export type V2State = { trips: Record<string, Trip>; activeTripId: string | null };

/** Migrasi v1 -> v2. Tidak boleh melempar: data rusak -> state kosong. */
export function migrateV1toV2(v1: unknown): V2State {
  if (!v1 || typeof v1 !== 'object') return { trips: {}, activeTripId: null };
  const state = v1 as V1State;
  const trip = state.trip;
  if (!trip || typeof trip !== 'object') return { trips: {}, activeTripId: null };
  if (!Array.isArray(trip.people) || !Array.isArray(trip.expenses) || !Array.isArray(trip.settlements)) {
    return { trips: {}, activeTripId: null };
  }
  return {
    trips: { [trip.id]: trip },
    activeTripId: trip.id,
  };
}
