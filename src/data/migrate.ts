/**
 * data/migrate.ts — Migrasi data lama ke Workspace v3.
 * Tujuan: pengguna V2 tidak kehilangan data saat upgrade.
 *
 * Sumber: `eo_dash_v2` (single Event object, tanpa schemaVersion).
 * Target : Workspace v3 (multi-event).
 *
 * Aturan (Lampiran D): impor file rusak / skema salah tidak boleh
 * mengubah data yang ada — migrasi melempar error, bukan menimpa.
 */

import type { Event } from '../engine/types';
import { SCHEMA_VERSION, type Workspace } from './schema';

/** Deteksi shape data V2: object Event tanpa schemaVersion. */
export function isLegacyV2(data: unknown): data is { events?: never } & Partial<Event> {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  if ('schemaVersion' in obj) return false;
  // Penanda wajib Event V2/V3
  return 'id' in obj && 'name' in obj && Array.isArray(obj.tickets) && Array.isArray(obj.vendors);
}

/** Migrasi single Event V2 -> Workspace v3. */
export function migrateV2ToWorkspace(legacy: Record<string, unknown>): Workspace {
  const events: Event[] = [];
  const ev = legacy as unknown as Event;
  events.push({
    ...ev,
    // V3 field baru — default array kosong jika tidak ada
    tasks: Array.isArray(ev.tasks) ? ev.tasks : [],
    risks: Array.isArray(ev.risks) ? ev.risks : [],
    expenses: Array.isArray(ev.expenses) ? ev.expenses : [],
    contingencyPct: typeof ev.contingencyPct === 'number' ? ev.contingencyPct : 15,
  });
  return {
    schemaVersion: SCHEMA_VERSION,
    currentEventId: ev.id,
    events,
  };
}
