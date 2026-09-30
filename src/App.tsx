import { useState, useMemo } from 'react';
import { useStore } from './store/useStore';
import { computeBalances } from './engine/balance';
import { settleGreedy, settleOptimal } from './engine/settle';
import { formatIDR } from './engine/money';
import { encodeTrip } from './engine/share';
import { sampleTrip } from './sample';
import ExpenseForm from './components/ExpenseForm';
import ChartPanel from './components/ChartPanel';
import DataPanel from './components/DataPanel';
import type { Expense, Settlement } from './engine/types';

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

type Tab = 'balance' | 'settle' | 'riwayat' | 'grafik' | 'data';

export default function App() {
  const {
    trips, activeTripId, setTrip, deleteTrip,
    addExpense, updateExpense, removeExpense,
    addSettlement, removeSettlement,
    addPerson, removePerson, setActiveTrip,
  } = useStore();
  const [tripName, setTripName] = useState('');
  const [peopleInput, setPeopleInput] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('balance');
  const [formOpen, setFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'expense' | 'settlement' | 'person' | 'trip'; id: string; label: string } | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'expense' | 'settlement'>('all');
  const [newPerson, setNewPerson] = useState('');
  const [personMsg, setPersonMsg] = useState('');

  const trip = activeTripId ? trips[activeTripId] : null;

  const [useOptimal, setUseOptimal] = useState(true);
  const balances = useMemo(() => (trip ? computeBalances(trip.people, trip.expenses, trip.settlements) : {}), [trip]);
  const transfers = useMemo(() => {
    if (!trip) return [];
    const activePeople = Object.keys(balances).filter(id => balances[id] !== 0).length;
    return useOptimal && activePeople <= 12 ? settleOptimal(balances as Record<string, number>) : settleGreedy(balances as Record<string, number>);
  }, [balances, useOptimal]);

  async function handleShare() {
    if (!trip) return;
    const data = await encodeTrip(trip);
    const url = `${window.location.origin}/#/s/${data}`;
    await navigator.clipboard.writeText(url);
    alert('Link trip disalin!');
  }

  function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    const names = peopleInput.split(',').map(s => s.trim()).filter(Boolean);
    if (names.length < 2) { setError('Minimal 2 peserta unik.'); return; }
    const seen = new Set<string>();
    for (const n of names) {
      const low = n.toLowerCase();
      if (seen.has(low)) { setError(`Nama peserta duplikat: ${n}.`); return; }
      seen.add(low);
    }
    const people = names.map(n => ({ id: uid('p'), name: n }));
    setTrip({ id: uid('t'), name: tripName.trim() || 'Trip', people, expenses: [], settlements: [] });
    setError('');
    setTripName(''); setPeopleInput('');
  }

  function handleAddExpense(e: Expense) {
    if (!trip) return;
    if (editExpense) updateExpense(trip.id, e);
    else addExpense(trip.id, e);
    setFormOpen(false);
    setEditExpense(undefined);
  }

  function markPaid(t: { from: string; to: string; amount: number }) {
    if (!trip) return;
    const s: Settlement = { id: uid('s'), from: t.from, to: t.to, amount: t.amount, paidAt: new Date().toISOString() };
    addSettlement(trip.id, s);
  }

  async function handleCopyWhatsApp() {
    if (!trip) return;
    const text = `*Settlement: ${trip.name}*\n${transfers
      .map(t => `${trip.people.find(p => p.id === t.from)?.name ?? t.from} → ${trip.people.find(p => p.id === t.to)?.name ?? t.to}: ${formatIDR(t.amount)}`)
      .join('\n')}\n\nDihitung dengan DebtSettler`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* abaikan */ }
      document.body.removeChild(ta);
    }
  }

  function confirmAction() {
    if (!confirmDelete || !trip) return;
    const { kind, id } = confirmDelete;
    if (kind === 'expense') removeExpense(trip.id, id);
    else if (kind === 'settlement') removeSettlement(trip.id, id);
    else if (kind === 'person') {
      const used =
        trip.expenses.some(e => e.payers.some(p => p.personId === id)) ||
        trip.expenses.some(e =>
          e.split.type === 'equal'
            ? e.split.participantIds.includes(id)
            : e.split.shares.some(sh => sh.personId === id),
        ) ||
        trip.settlements.some(s => s.from === id || s.to === id);
      if (used) {
        const pname = trip.people.find(p => p.id === id)?.name ?? id;
        setPersonMsg(`Peserta ${pname} dipakai oleh expense/settlement. Hapus catatan itu dulu.`);
      } else {
        removePerson(trip.id, id);
      }
    } else if (kind === 'trip') {
      deleteTrip(id);
    }
    setConfirmDelete(null);
  }

  function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    const name = newPerson.trim();
    if (name.length < 1 || name.length > 30) { setPersonMsg('Nama peserta 1–30 karakter.'); return; }
    if (trip.people.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setPersonMsg(`Peserta "${name}" sudah ada.`); return;
    }
    addPerson(trip.id, { id: uid('p'), name });
    setNewPerson('');
    setPersonMsg('');
  }

  const history = useMemo(() => {
    if (!trip) return [];
    const items = [
      ...trip.expenses.map(e => ({ kind: 'expense' as const, id: e.id, title: e.title, at: e.createdAt, amount: e.amount, ref: e })),
      ...trip.settlements.map(s => ({
        kind: 'settlement' as const,
        id: s.id,
        title: `${trip.people.find(p => p.id === s.from)?.name ?? s.from} → ${trip.people.find(p => p.id === s.to)?.name ?? s.to}`,
        at: s.paidAt,
        amount: s.amount,
        ref: s,
      })),
    ];
    return items
      .filter(i => historyFilter === 'all' || i.kind === historyFilter)
      .sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [trip, historyFilter]);

  const totalSpent = trip ? trip.expenses.reduce((a, e) => a + e.amount, 0) : 0;

  if (!trip) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {Object.values(trips).length > 0 && (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-2">
              <h2 className="font-bold">Trip tersimpan</h2>
              {Object.values(trips).map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <button onClick={() => setTrip(t)} className="text-left flex-1">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-neutral-500 block">{t.people.length} peserta · {t.expenses.length} pengeluaran</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ kind: 'trip', id: t.id, label: t.name })}
                    className="text-red-600 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleCreateTrip} className="space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
            <h1 className="text-2xl font-bold">Buat Trip Baru</h1>
            <input
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              placeholder="Nama trip (mis: Liburan Malang)"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
              aria-label="Nama trip"
            />
            <input
              value={peopleInput}
              onChange={e => setPeopleInput(e.target.value)}
              placeholder="Peserta, pisahkan koma (Budi, Ani, Citra)"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
              aria-label="Daftar peserta"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold py-2">
              Mulai
            </button>
          </form>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
            <DataPanel />
          </div>
        </div>
      </div>
    );
  }

  const nameOf = (id: string) => trip.people.find(p => p.id === id)?.name ?? id;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <p className="text-neutral-500">
              {trip.expenses.length} pengeluaran · total {formatIDR(totalSpent)}
            </p>
          </div>
          <button
            onClick={() => setActiveTrip(null)}
            className="text-sm text-neutral-500"
            aria-label="Ganti trip"
          >
            ⏪ Trip lain
          </button>
        </div>
        <p className="text-neutral-500 text-sm">{trip.people.map(p => p.name).join(' · ')}</p>
      </header>

      <nav className="mb-6 flex gap-2 flex-wrap" aria-label="Navigasi tab">
        {(['balance', 'settle', 'riwayat', 'grafik', 'data'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1 text-sm border ${tab === t ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700'}`}
          >
            {t === 'balance' ? 'Net Balance' : t === 'settle' ? 'Settle' : t === 'riwayat' ? 'Riwayat' : t === 'grafik' ? 'Grafik' : 'Data'}
          </button>
        ))}
      </nav>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Tambah Pengeluaran</h2>
          <button
            onClick={() => { setFormOpen(f => !f); setEditExpense(undefined); }}
            className="rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold px-4 py-1.5 text-sm"
          >
            {formOpen ? 'Tutup form' : 'Tambah pengeluaran'}
          </button>
        </div>
        {formOpen && (
          <ExpenseForm
            people={trip.people}
            onSubmit={handleAddExpense}
            initial={editExpense}
          />
        )}
      </section>

      {tab === 'balance' && (
        <section className="mb-6 space-y-4">
          <h2 className="text-xl font-bold">Net Balance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {trip.people.map(p => {
              const b = balances[p.id] ?? 0;
              return (
                <div key={p.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className={b > 0 ? 'text-green-600' : b < 0 ? 'text-red-600' : 'text-neutral-500'}>
                    {b > 0 ? '+' : ''}{formatIDR(b)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {b > 0 ? 'Akan menerima' : b < 0 ? 'Harus membayar' : 'Lunas'}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm">
              Total saldo: <b>{formatIDR(Object.values(balances).reduce((a, b) => a + b, 0))}</b>
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
            <h3 className="font-semibold">Peserta</h3>
            <ul className="space-y-1">
              {trip.people.map(p => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="text-sm">{p.name}</span>
                  <button
                    onClick={() => setConfirmDelete({ kind: 'person', id: p.id, label: p.name })}
                    className="text-red-600 text-xs"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddPerson} className="flex gap-2">
              <input
                value={newPerson}
                onChange={e => setNewPerson(e.target.value)}
                placeholder="Tambah peserta"
                className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm"
                aria-label="Tambah peserta"
              />
              <button type="submit" className="rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm px-3 py-1.5">Tambah</button>
            </form>
            {personMsg && <p className="text-red-600 text-xs">{personMsg}</p>}
          </div>
        </section>
      )}

      {tab === 'settle' && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Settle</h2>
            {transfers.length > 0 && (
              <button
                onClick={handleCopyWhatsApp}
                className="rounded-lg bg-green-600 text-white text-sm px-3 py-1"
              >
                {copied ? 'Tersalin' : 'Salin untuk WhatsApp'}
              </button>
            )}
          </div>
          {transfers.length === 0 ? (
            <p className="text-neutral-500">Semua sudah lunas.</p>
          ) : (
            <ul className="space-y-2">
              {transfers.map((t, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <span>{nameOf(t.from)} → {nameOf(t.to)}: <b>{formatIDR(t.amount)}</b></span>
                  <button onClick={() => markPaid(t)} className="rounded-lg bg-green-600 text-white text-sm px-3 py-1">Tandai lunas</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'riwayat' && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Riwayat</h2>
            <div className="flex gap-1">
              {(['all', 'expense', 'settlement'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`rounded-lg px-2 py-1 text-xs border ${historyFilter === f ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700'}`}
                >
                  {f === 'all' ? 'Semua' : f === 'expense' ? 'Pengeluaran' : 'Pelunasan'}
                </button>
              ))}
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-neutral-500">Belum ada catatan.</p>
          ) : (
            <ul className="space-y-2">
              {history.map(i => (
                <li key={`${i.kind}-${i.id}`} className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                  <div>
                    <p className="font-medium">
                      <span className="text-xs mr-2 px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
                        {i.kind === 'expense' ? 'Pengeluaran' : 'Pelunasan'}
                      </span>
                      {i.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(i.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <b>{formatIDR(i.amount)}</b>
                    {i.kind === 'expense' ? (
                      <>
                        <button
                          onClick={() => { setEditExpense(i.ref as Expense); setFormOpen(true); }}
                          className="text-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ kind: 'expense', id: i.id, label: `${i.title} (${formatIDR(i.amount)})` })}
                          className="text-red-600 text-sm"
                        >
                          Hapus
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete({ kind: 'settlement', id: i.id, label: i.title })}
                        className="text-red-600 text-sm"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'grafik' && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3">Grafik</h2>
          <ChartPanel trip={trip} />
        </section>
      )}

      {tab === 'data' && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-3">Data</h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <DataPanel />
          </div>
        </section>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Konfirmasi</h3>
            <p className="text-sm mb-4">
              Hapus <b>{confirmDelete.label}</b>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-700"
              >
                Batal
              </button>
              <button
                onClick={confirmAction}
                className="rounded-lg px-4 py-2 text-sm bg-red-600 text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
