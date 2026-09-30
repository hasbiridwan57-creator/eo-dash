import type { Person, Expense, Settlement } from './types';
import { isMoney, formatIDR } from './money';

export const CATEGORIES = ['Makan', 'Transport', 'Penginapan', 'Tiket', 'Belanja', 'Lainnya'] as const;
export type Category = (typeof CATEGORIES)[number];

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateExpense(e: Expense, people: Person[]): ValidationResult {
  const errors: string[] = [];
  const knownIds = new Set(people.map(p => p.id));

  const title = (e.title ?? '').trim();
  if (title.length < 1 || title.length > 80) errors.push('Judul harus 1–80 karakter.');

  if (!isMoney(e.amount)) errors.push(`Jumlah harus integer antara 1 dan 100.000.000.000 (sekarang ${String(e.amount)}).`);

  if (!e.payers || e.payers.length === 0) {
    errors.push('Minimal satu pembayaran (payers) wajib diisi.');
  } else {
    const seen = new Set<string>();
    for (const p of e.payers) {
      if (!knownIds.has(p.personId)) errors.push(`Pembayar tidak dikenal: ${p.personId}.`);
      if (seen.has(p.personId)) errors.push(`Pembayar duplikat: ${p.personId}.`);
      seen.add(p.personId);
      if (!isMoney(p.amount)) errors.push(`Nominal pembayaran tidak valid: ${String(p.amount)}.`);
    }
    const total = e.payers.reduce((a, p) => a + (isMoney(p.amount) ? p.amount : 0), 0);
    if (isMoney(e.amount) && total !== e.amount) {
      errors.push(`Total pembayar ${formatIDR(total)} harus sama dengan jumlah ${formatIDR(e.amount)}.`);
    }
  }

  switch (e.split.type) {
    case 'equal': {
      const ids = e.split.participantIds ?? [];
      if (ids.length === 0) errors.push('Peserta equal split tidak boleh kosong.');
      const seen = new Set<string>();
      for (const id of ids) {
        if (!knownIds.has(id)) errors.push(`Peserta tidak dikenal: ${id}.`);
        if (seen.has(id)) errors.push(`Peserta duplikat: ${id}.`);
        seen.add(id);
      }
      break;
    }
    case 'percentage': {
      const shares = e.split.shares ?? [];
      if (shares.length === 0) errors.push('Peserta percentage split tidak boleh kosong.');
      const seen = new Set<string>();
      let totalBp = 0;
      for (const s of shares) {
        if (!knownIds.has(s.personId)) errors.push(`Peserta tidak dikenal: ${s.personId}.`);
        if (seen.has(s.personId)) errors.push(`Peserta duplikat: ${s.personId}.`);
        seen.add(s.personId);
        if (!Number.isInteger(s.bp) || s.bp < 0) errors.push(`Persentase tidak valid: ${String(s.bp)}.`);
        totalBp += s.bp;
      }
      if (shares.length > 0 && totalBp !== 10000) {
        errors.push(`Total persentase harus 100% (sekarang ${totalBp / 100}%).`);
      }
      break;
    }
    case 'custom': {
      const shares = e.split.shares ?? [];
      if (shares.length === 0) errors.push('Peserta custom split tidak boleh kosong.');
      const seen = new Set<string>();
      let total = 0;
      for (const s of shares) {
        if (!knownIds.has(s.personId)) errors.push(`Peserta tidak dikenal: ${s.personId}.`);
        if (seen.has(s.personId)) errors.push(`Peserta duplikat: ${s.personId}.`);
        seen.add(s.personId);
        if (!Number.isInteger(s.amount) || s.amount < 0) errors.push(`Nominal tidak valid: ${String(s.amount)}.`);
        total += s.amount;
      }
      if (isMoney(e.amount) && shares.length > 0 && total !== e.amount) {
        errors.push(`Total pembagian ${formatIDR(total)} harus sama dengan jumlah ${formatIDR(e.amount)}.`);
      }
      break;
    }
  }

  if (!CATEGORIES.includes(e.category as Category)) errors.push(`Kategori tidak valid: ${e.category}.`);

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export function validateSettlement(s: Settlement, people: Person[]): ValidationResult {
  const errors: string[] = [];
  const knownIds = new Set(people.map(p => p.id));
  if (!knownIds.has(s.from)) errors.push(`Pengirim tidak dikenal: ${s.from}.`);
  if (!knownIds.has(s.to)) errors.push(`Penerima tidak dikenal: ${s.to}.`);
  if (s.from === s.to) errors.push('Pengirim dan penerima tidak boleh sama.');
  if (!isMoney(s.amount)) errors.push(`Jumlah harus integer positif (sekarang ${String(s.amount)}).`);
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
