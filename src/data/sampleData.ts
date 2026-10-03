/**
 * data/sampleData.ts — Data contoh EO-Dash.
 * Dipakai saat workspace kosong (fresh install) agar pembeli langsung melihat
 * tampilan lengkap, sesuai onboarding PRD bagian 7 ("Muat data contoh").
 */

import type { Event, RundownItem, CommitteeMember } from '../engine/types';

export function createSampleEvent(): Event {
  return {
    id: 'evt-sample-1',
    name: 'Konser Musik Akhir Tahun',
    date: '2026-12-31',
    budgetCap: 500_000_000,
    venue: 'Gelora Bung Karno Stadium',
    tickets: [
      { id: 't1', category: 'VIP', qty: 100, price: 1_000_000, channel: 'Loket' },
      { id: 't2', category: 'Reguler', qty: 1000, price: 300_000, channel: 'Website' },
    ],
    sponsors: [
      { id: 'sp1', name: 'Bermaz Motors', amount: 50_000_000, status: 'Terbayar', deliverable: 'Logo exposure, booth activity' },
      { id: 'sp2', name: 'GoFood Partner', amount: 25_000_000, status: 'Komitmen', deliverable: 'Stage mention' },
    ],
    vendors: [
      { id: 'v1', name: 'Sound & Lighting', category: 'Sound', fee: 150_000_000, paid: 75_000_000, contact: '0812-3344-5566', accountNumber: 'BCA-1234567890', bankName: 'Bank BCA', riderNotes: 'Check line array speaker, test mains L/R stereo' },
      { id: 'v2', name: 'Talent XYZ', category: 'Talent Fee', fee: 200_000_000, paid: 200_000_000, contact: '0813-9988-7766', accountNumber: 'Mandiri-9876543210', bankName: 'Bank Mandiri', riderNotes: 'Rider: 4x water bottle, 2x sandwich, dressing room AC' },
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
    rundown: [
      { id: 'rd-1', timeStart: '13:00', timeEnd: '15:00', activity: 'Loading Vendor & Soundcheck', location: 'Main Stage', pic: 'Adit (Audio)', cue: 'Clear stage, check line audio 32ch', status: 'Done' as const },
      { id: 'rd-2', timeStart: '16:00', timeEnd: '17:00', activity: 'Briefing Seluruh Panitia & Keamanan', location: 'Lobby', pic: 'Hasbi (Show Dir)', status: 'Done' as const },
      { id: 'rd-3', timeStart: '17:30', timeEnd: '19:00', activity: 'Open Gate & Scan Barcode Tiket', location: 'Gate 1-4', pic: 'Rani (Ticketing)', cue: 'Gate LED On, turnstile active', status: 'Standby' as const },
      { id: 'rd-4', timeStart: '19:30', timeEnd: '20:30', activity: 'Opening Act: Band Lokal', location: 'Main Stage', pic: 'Dimas (Stage Mgr)', cue: 'Lights cyan warm, audio preset 1', status: 'Upcoming' as const },
      { id: 'rd-5', timeStart: '20:45', timeEnd: '22:30', activity: 'Main Performance / Headliner', location: 'Main Stage', pic: 'Hasbi (Show Dir)', cue: 'Blackout -> Pyro -> Video Intro', status: 'Upcoming' as const },
      { id: 'rd-6', timeStart: '22:30', timeEnd: '23:30', activity: 'Crowd Dispersal & Load-out Vendor', location: 'All Area', pic: 'Security Lead', cue: 'House lights 100% on', status: 'Upcoming' as const },
    ],
    committee: [
      { id: 'cm-1', name: 'Hasbi Ridwan', role: 'Project Director & Finance Lead', division: 'Finance & Ticketing', phone: '0812-9988-7766' },
      { id: 'cm-2', name: 'Dimas Pratama', role: 'Stage Manager', division: 'Event / Show', phone: '0813-1122-3344' },
      { id: 'cm-3', name: 'Rani Wulandari', role: 'Head of Ticketing & Gate', division: 'Finance & Ticketing', phone: '0817-5544-3322' },
      { id: 'cm-4', name: 'Bambang Sudiro', role: 'Security & Licensing Coordinator', division: 'Security & Perizinan', phone: '0811-9900-1122' },
    ] as CommitteeMember[],
    createdAt: '2026-10-01',
  };
}
