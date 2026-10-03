/**
 * data/backup.ts — Export & Import Workspace (F6).
 *
 * Format: file .json berversi, sama seperti struktur localStorage.
 *
 * Jaminan (Lampiran A & D):
 *  - Impor memvalidasi skema dan menampilkan ringkasan sebelum menimpa.
 *  - Impor file rusak TIDAK mengubah data yang ada.
 *  - Setiap risiko wajib punya Plan B — file dengan planB kosong ditolak.
 */

import type { Event } from '../engine/types';
import { SCHEMA_VERSION, type Workspace } from './schema';

export interface ImportSummary {
  ok: boolean;
  error?: string;
  summary?: {
    eventCount: number;
    firstEventName: string;
  };
  workspace?: Workspace;
}

/** Validasi sebuah Event V3. */
export function validateEventForImport(ev: unknown): string | null {
  if (typeof ev !== 'object' || ev === null) return 'Event bukan object';
  const e = ev as Record<string, unknown>;
  if (typeof e.id !== 'string' || !e.id) return 'Event.id wajib diisi';
  if (typeof e.name !== 'string' || !e.name) return 'Event.name wajib diisi';
  if (typeof e.budgetCap !== 'number' || !Number.isSafeInteger(e.budgetCap)) return 'budgetCap harus integer';
  if (!Array.isArray(e.tickets) || !Array.isArray(e.vendors) || !Array.isArray(e.tasks) || !Array.isArray(e.risks)) {
    return 'Struktur tickets/vendors/tasks/risks rusak';
  }
  // Aturan keras: risiko wajib Plan B
  for (const r of e.risks as Record<string, unknown>[]) {
    if (typeof r.planB !== 'string' || !r.planB.trim()) {
      return `Risiko "${String(r.risk)}" tidak punya Plan B — ditolak`;
    }
  }
  return null;
}

/** Parse file JSON hasil backup. Tidak menimpa data apapun. */
export function parseBackupFile(text: string): ImportSummary {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File bukan JSON yang valid' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Isi file tidak sesuai format' };
  }

  const obj = parsed as Record<string, unknown>;

  // Format lama (V2 single event) -> bungkus jadi workspace
  if (!('schemaVersion' in obj)) {
    const err = validateEventForImport(obj);
    if (err) return { ok: false, error: err };
    const ev = obj as unknown as Event;
    const ws: Workspace = {
      schemaVersion: SCHEMA_VERSION,
      currentEventId: ev.id,
      events: [ev],
    };
    return { ok: true, summary: { eventCount: 1, firstEventName: ev.name }, workspace: ws };
  }

  if (obj.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, error: `Versi skema ${String(obj.schemaVersion)} tidak didukung (butuh ${SCHEMA_VERSION})` };
  }

  if (!Array.isArray(obj.events)) {
    return { ok: false, error: 'Field events rusak' };
  }

  const events = obj.events as unknown[];
  for (const ev of events) {
    const err = validateEventForImport(ev);
    if (err) return { ok: false, error: err };
  }

  const evs = events as Event[];
  const first = evs[0];
  return {
    ok: true,
    summary: { eventCount: evs.length, firstEventName: first ? first.name : '(kosong)' },
    workspace: {
      schemaVersion: SCHEMA_VERSION,
      currentEventId: typeof obj.currentEventId === 'string' ? obj.currentEventId : (first ? first.id : ''),
      events: evs,
    },
  };
}

/** Hasilkan JSON backup untuk diunduh. */
export function buildBackupJson(ws: Workspace): string {
  return JSON.stringify({ ...ws, schemaVersion: SCHEMA_VERSION }, null, 2);
}

/** Trigger unduhan file dari browser. */
export function downloadFile(filename: string, content: string, mime = 'application/json'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
