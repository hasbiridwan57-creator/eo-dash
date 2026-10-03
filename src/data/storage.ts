/**
 * data/storage.ts — Persistence layer.
 * Penyimpanan berversi + migrasi otomatis dari eo_dash_v2.
 *
 * Jaminan (Lampiran A):
 *  - Data rusak tidak boleh membuat aplikasi crash -> fallback empty workspace.
 *  - Kuota localStorage hampir penuh -> peringatan ke UI.
 */

import { STORAGE_KEY, LEGACY_STORAGE_KEY_V2, emptyWorkspace, type Workspace } from './schema';
import { isLegacyV2, migrateV2ToWorkspace } from './migrate';

export class StorageError extends Error {}

/** Cek apakah localStorage mendekati penuh (estimasi konservatif). */
export function isStorageNearFull(): boolean {
  try {
    const probe = '__eo_dash_probe__';
    const chunk = 'x'.repeat(100_000); // 100KB
    let n = 0;
    while (n < 60) {
      localStorage.setItem(probe, chunk.repeat(n));
      n++;
    }
    localStorage.removeItem(probe);
    return false;
  } catch {
    return true;
  }
}

/** Baca workspace dari localStorage + migrasi otomatis dari V2. */
export function loadWorkspace(): Workspace {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new StorageError('Tidak bisa membaca penyimpanan browser');
  }

  // Sudah ada workspace v3
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schemaVersion === 3 && Array.isArray(parsed.events)) {
        return parsed as Workspace;
      }
    } catch {
      // JSON corrupt -> jangan crash, lanjut cek legacy
    }
  }

  // Migrasi dari V2 (single Event object)
  let legacyRaw: string | null = null;
  try {
    legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY_V2);
  } catch {
    // ignore
  }

  if (legacyRaw) {
    try {
      const parsed = JSON.parse(legacyRaw);
      if (isLegacyV2(parsed)) {
        return migrateV2ToWorkspace(parsed as Record<string, unknown>);
      }
    } catch {
      // legacy corrupt -> abaikan
    }
  }

  return emptyWorkspace();
}

/** Simpan workspace. Lempar StorageError jika gagal (mis. kuota penuh). */
export function saveWorkspace(ws: Workspace): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
  } catch (e) {
    throw new StorageError(
      `Gagal menyimpan. Penyimpanan browser mungkin penuh. (${e instanceof Error ? e.message : 'unknown'})`
    );
  }
}
