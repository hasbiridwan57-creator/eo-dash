import { useRef, useState } from 'react';
import type { Trip } from '../engine/types';
import { tripExportSchema, EXPORT_VERSION } from '../schema/schema';
import { useStore } from '../store/useStore';

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/** Trip contoh untuk demo cepat. Semua angka integer, total payers = amount, bp = 10000. */
function sampleTrip(): Trip {
  const people = [
    { id: 'sp-1', name: 'Hasbi' },
    { id: 'sp-2', name: 'Ridwan' },
    { id: 'sp-3', name: 'Budi' },
    { id: 'sp-4', name: 'Ani' },
  ];
  return {
    id: uid('t'),
    name: 'Trip Demo Malang',
    people,
    expenses: [
      {
        id: uid('e'), title: 'Penginapan 2 malam', category: 'Penginapan', amount: 1200000,
        payers: [{ personId: 'sp-1', amount: 1200000 }],
        split: { type: 'equal', participantIds: ['sp-1', 'sp-2', 'sp-3', 'sp-4'] },
        createdAt: '2026-09-30T08:00:00.000Z',
      },
      {
        id: uid('e'), title: 'Tiket kereta PP', category: 'Tiket', amount: 800000,
        payers: [{ personId: 'sp-2', amount: 800000 }],
        split: { type: 'percentage', shares: [{ personId: 'sp-1', bp: 3000 }, { personId: 'sp-2', bp: 3000 }, { personId: 'sp-3', bp: 2000 }, { personId: 'sp-4', bp: 2000 }] },
        createdAt: '2026-09-30T09:00:00.000Z',
      },
      {
        id: uid('e'), title: 'Makan malam', category: 'Makan', amount: 360000,
        payers: [{ personId: 'sp-3', amount: 360000 }],
        split: { type: 'equal', participantIds: ['sp-1', 'sp-2', 'sp-3', 'sp-4'] },
        createdAt: '2026-09-30T19:00:00.000Z',
      },
      {
        id: uid('e'), title: 'Bensin', category: 'Transport', amount: 250000,
        payers: [{ personId: 'sp-1', amount: 250000 }],
        split: { type: 'custom', shares: [{ personId: 'sp-1', amount: 100000 }, { personId: 'sp-2', amount: 100000 }, { personId: 'sp-3', amount: 50000 }] },
        createdAt: '2026-09-30T10:00:00.000Z',
      },
    ],
    settlements: [
      { id: uid('s'), from: 'sp-3', to: 'sp-1', amount: 100000, paidAt: '2026-09-30T20:00:00.000Z' },
    ],
  };
}

export default function DataPanel() {
  const trips = useStore(s => s.trips);
  const activeTripId = useStore(s => s.activeTripId);
  const importTrip = useStore(s => s.importTrip);
  const setTrip = useStore(s => s.setTrip);
  const trip = activeTripId ? trips[activeTripId] : null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function handleExport() {
    if (!trip) return;
    const data = { version: EXPORT_VERSION, ...trip };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg({ kind: 'ok', text: 'File JSON berhasil diunduh.' });
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        const r = tripExportSchema.safeParse(raw);
        if (!r.success) {
          setMsg({ kind: 'err', text: `Import gagal: ${r.error.issues[0]?.message ?? 'data tidak valid'}` });
          return;
        }
        const { version: _v, ...t } = r.data;
        importTrip(t);
        setMsg({ kind: 'ok', text: `Trip "${t.name}" berhasil diimpor.` });
      } catch {
        setMsg({ kind: 'err', text: 'Import gagal: file bukan JSON valid.' });
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  }

  function handleSample() {
    setTrip(sampleTrip());
    setMsg({ kind: 'ok', text: 'Trip demo dimuat. Lihat tab Grafik & Settle.' });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={handleExport} className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-semibold px-3 py-1.5">Export JSON</button>
        <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm px-3 py-1.5">Import JSON</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
        <button onClick={handleSample} className="rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm px-3 py-1.5">Muat trip demo</button>
      </div>
      {msg && <p className={`text-sm ${msg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
      <p className="text-xs text-neutral-500">
        Import divalidasi ketat oleh Zod: uang harus integer, total pembayar = jumlah, persentase tepat 100%, dan semua peserta terdaftar.
      </p>
    </div>
  );
}
