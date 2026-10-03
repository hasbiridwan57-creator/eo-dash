/**
 * data/sampleData.ts — Data contoh EO-Dash.
 * Dipakai saat workspace kosong (fresh install) agar pembeli langsung melihat
 * tampilan lengkap, sesuai onboarding PRD bagian 7 ("Muat data contoh").
 */

import type { Event } from '../engine/types';

export function createSampleEvent(): Event {
  return {
    id: 'evt-sample-1',
    name: 'Konser Musik Akhir Tahun',
    date: '2026-12-31',
    budgetCap: 500_000_000,
    tickets: [
      { id: 't1', category: 'VIP', qty: 100, price: 1_000_000, channel: 'Loket' },
      { id: 't2', category: 'Reguler', qty: 1000, price: 300_000, channel: 'Website' },
    ],
    sponsors: [
      { id: 'sp1', name: 'Bermaz Motors', amount: 50_000_000, status: 'Terbayar', deliverable: 'Logo exposure, booth activity' },
      { id: 'sp2', name: 'GoFood Partner', amount: 25_000_000, status: 'Komitmen', deliverable: 'Stage mention' },
    ],
    vendors: [
      { id: 'v1', name: 'Sound & Lighting', category: 'Sound', fee: 150_000_000, paid: 75_000_000 },
      { id: 'v2', name: 'Talent XYZ', category: 'Talent Fee', fee: 200_000_000, paid: 200_000_000 },
    ],
    expenses: [
      { id: 'e1', title: 'Perizinan', category: 'Perizinan', amount: 20_000_000, date: '2026-10-01' },
    ],
    tasks: [
      { id: 'ts-1', title: 'Izin Keramaian Polda / Polsek', category: 'Perizinan', deadline: '2026-12-15', done: false },
      { id: 'ts-2', title: 'Pelunasan Vendor Sound System', category: 'Vendor', deadline: '2026-12-25', done: true },
    ],
    risks: [
      {
        id: 'r-1',
        risk: 'Genset utama drop / mati lampu',
        impact: 'Tinggi',
        planB: 'Sediakan genset cadangan 100KVA standby di lokasi.',
      },
    ],
    createdAt: '2026-10-01',
  };
}
