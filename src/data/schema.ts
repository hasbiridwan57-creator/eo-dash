/**
 * data/schema.ts — Skema Workspace V3.
 * Aturan keras: perubahan skema wajib disertai migrasi + uji migrasi.
 */

import type { Event } from '../engine/types';

export const SCHEMA_VERSION = 3 as const;
export const STORAGE_KEY = 'eo_dash_v3';
/** Legacy key dari V2 — dipakai saat migrasi. */
export const LEGACY_STORAGE_KEY_V2 = 'eo_dash_v2';

export interface Workspace {
  schemaVersion: 3;
  currentEventId: string;
  events: Event[];
}

export function emptyWorkspace(): Workspace {
  return { schemaVersion: SCHEMA_VERSION, currentEventId: '', events: [] };
}
