import { useState, useMemo, useEffect } from 'react';
import {
  Plus, X, Edit3, Trash2, Check, Copy, Share2, Download,
  ArrowLeft, Wallet, Users, Receipt, BarChart3, Database, Home,
} from 'lucide-react';
import { useStore } from './store/useStore';
import { computeBalances, computePerPerson } from './engine/balance';
import { chooseTransfers } from './engine/settle';
import { formatIDR } from './engine/money';
import { encodeTrip, decodeTrip } from './engine/share';
import { parseHash, toHash, type Route, type TabName } from './routes';
import ExpenseForm from './components/ExpenseForm';
import ChartPanel from './components/ChartPanel';
import DataPanel from './components/DataPanel';
import type { Expense, Settlement } from './engine/types';

function uid(prefix: string): string { return `${prefix}-${crypto.randomUUID()}`; }

export default function App() {
  const {
    trips, activeTripId, setTrip, deleteTrip,
    addExpense, updateExpense, removeExpense,
    addSettlement, removeSettlement,
    addPerson, removePerson, setActiveTrip,
  } = useStore();
  const [route, setRoute] = useState<Route>(parseHash(window.location.hash));
  const [formOpen, setFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'expense' | 'settlement' | 'person' | 'trip'; id: string; label: string } | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'expense' | 'settlement'>('all');
  const [newPerson, setNewPerson] = useState('');
  const [personMsg, setPersonMsg] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [useOptimal, setUseOptimal] = useState(true);
  const [sharePreview, setSharePreview] = useState<{ name: string; people: number; expenses: number; total: number; net: [string, number][] } | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  // R2: hashchange listener
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(window.location.hash));
      setShareLoading(true);
      setSharePreview(null);
      setShareError(null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // R2: route -> store sync + redirect
  useEffect(() => {
    if (route.name === 'trip') {
      if (trips[route.tripId]) setActiveTrip(route.tripId);
      else {
        setToast('Trip tidak ditemukan.');
        window.location.hash = '#/';
      }
    } else {
      setActiveTrip(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, trips]);

  // R2: load tanpa hash & activeTripId ada -> ganti hash
  useEffect(() => {
    if (!window.location.hash && activeTripId) {
      window.location.hash = toHash({ name: 'trip', tripId: activeTripId, tab: 'expenses' });
    }
  }, [activeTripId]);

  // R4: route share -> decode
  useEffect(() => {
    let cancelled = false;
    if (route.name === 'share') {
      setShareLoading(true);
      setSharePreview(null);
      setShareError(null);
      decodeTrip(route.data)
        .then(trip => {
          if (cancelled) return;
          const total = trip.expenses.reduce((a, e) => a + e.amount, 0);
          const net = computeBalances(trip.people, trip.expenses, trip.settlements);
          setSharePreview({
            name: trip.name,
            people: trip.people.length,
            expenses: trip.expenses.length,
            total,
            net: trip.people.map(p => [p.name, net[p.id] ?? 0] as [string, number]),
          });
          setShareLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setShareError('Link rusak atau data tidak valid. Periksa kembali linknya.');
          setShareLoading(false);
        });
    } else {
      setSharePreview(null);
      setShareError(null);
    }
    return () => { cancelled = true; };
  }, [route]);

  const trip = activeTripId ? trips[activeTripId] : null;
  const tab = route.name === 'trip' ? route.tab : 'expenses';

  const balances = useMemo(() => (trip ? computeBalances(trip.people, trip.expenses, trip.settlements) : {}), [trip]);
  const settlementData = useMemo(() => chooseTransfers(balances, useOptimal), [balances, useOptimal]);

  function setTab(t: TabName) {
    if (route.name === 'trip') window.location.hash = toHash({ ...route, tab: t });
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ===== R4: Share link =====
  async function handleShare() {
    if (!trip) return;
    const data = await encodeTrip(trip);
    const url = `${window.location.origin}/#/s/${data}`;
    if (url.length > 8000) {
      showToast('Data terlalu besar untuk link, gunakan Export JSON.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link trip disalin!');
    } catch {
      showToast('Gagal menyalin. Salin manual dari address bar.');
    }
  }

  async function handleSaveSharedTrip() {
    if (route.name !== 'share') return;
    try {
      const t = await decodeTrip(route.data);
      const newTrip = { ...t, id: uid('t'), name: `${t.name} (disalin)` };
      setTrip(newTrip);
      const newHash = toHash({ name: 'trip', tripId: newTrip.id, tab: 'expenses' });
      window.history.replaceState(null, '', newHash);
      setRoute({ name: 'trip', tripId: newTrip.id, tab: 'expenses' });
      showToast('Trip disimpan ke perangkat Anda.');
    } catch {
      setShareError('Gagal menyimpan trip.');
    }
  }

  // ===== CRUD =====
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

  function confirmAction() {
    if (!confirmDelete || !trip) return;
    const { kind, id } = confirmDelete;
    if (kind === 'expense') removeExpense(trip.id, id);
    else if (kind === 'settlement') removeSettlement(trip.id, id);
    else if (kind === 'person') {
      const used =
        trip.expenses.some(e => e.payers.some(p => p.personId === id)) ||
        trip.expenses.some(e => e.split.type === 'equal' ? e.split.participantIds.includes(id) : e.split.shares.some(sh => sh.personId === id)) ||
        trip.settlements.some(s => s.from === id || s.to === id);
      if (used) {
        const pname = trip.people.find(p => p.id === id)?.name ?? id;
        setPersonMsg(`Peserta ${pname} dipakai oleh expense/settlement. Hapus catatan itu dulu.`);
      } else removePerson(trip.id, id);
    } else if (kind === 'trip') deleteTrip(id);
    setConfirmDelete(null);
  }

  function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    const name = newPerson.trim();
    if (name.length < 1 || name.length > 30) { setPersonMsg('Nama peserta 1–30 karakter.'); return; }
    if (trip.people.some(p => p.name.toLowerCase() === name.toLowerCase())) { setPersonMsg(`Peserta "${name}" sudah ada.`); return; }
    addPerson(trip.id, { id: uid('p'), name });
    setNewPerson('');
    setPersonMsg('');
  }

  const history = useMemo(() => {
    if (!trip) return [];
    const items = [
      ...trip.expenses.map(e => ({ kind: 'expense' as const, id: e.id, title: e.title, at: e.createdAt, amount: e.amount, ref: e, edited: !!e.updatedAt })),
      ...trip.settlements.map(s => ({
        kind: 'settlement' as const,
        id: s.id,
        title: `${trip.people.find(p => p.id === s.from)?.name ?? s.from} → ${trip.people.find(p => p.id === s.to)?.name ?? s.to}`,
        at: s.paidAt,
        amount: s.amount,
        ref: s,
        edited: false,
      })),
    ];
    return items.filter(i => historyFilter === 'all' || i.kind === historyFilter).sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [trip, historyFilter]);

  const totalSpent = trip ? trip.expenses.reduce((a, e) => a + e.amount, 0) : 0;
  const nameOf = (id: string) => trip?.people.find(p => p.id === id)?.name ?? id;
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // ===== R6: ErrorBoundary data dump =====
  function dumpData() {
    const raw = localStorage.getItem('debtsettler') ?? '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'debtsettler-raw.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ===== R4: Share preview route =====
  if (route.name === 'share') {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 max-w-2xl mx-auto">
        <div className="border border-border bg-card p-6 space-y-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 size={24} /> Trip dari Link
          </h1>
          <p className="text-xs text-muted-foreground">
            Link adalah salinan (snapshot). Perubahan tidak tersinkron otomatis.
          </p>
          {shareLoading && <p className="text-muted-foreground">Memuat data…</p>}
          {shareError && (
            <div className="space-y-4">
              <p className="text-destructive">{shareError}</p>
              <button onClick={() => { window.location.hash = '#/'; }} className="border border-border px-4 py-2 text-sm hover:bg-muted">
                <ArrowLeft size={14} className="inline mr-2" />Kembali
              </button>
            </div>
          )}
          {sharePreview && (
            <div className="space-y-4">
              <div className="border-l-4 border-accent pl-4">
                <h2 className="text-xl font-bold">{sharePreview.name}</h2>
                <p className="text-muted-foreground text-sm">{sharePreview.people} peserta · {sharePreview.expenses} pengeluaran · total {formatIDR(sharePreview.total)}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Net Balance (read-only)</h3>
                {sharePreview.net.map(([name, b]) => (
                  <div key={name} className="flex justify-between text-sm border-b border-border py-1">
                    <span>{name}</span>
                    <span className={b > 0 ? 'text-accent' : b < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                      {b > 0 ? '+' : ''}{formatIDR(b)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveSharedTrip} className="bg-accent text-black font-semibold px-4 py-2 text-sm flex items-center gap-2">
                  <Download size={14} /> Simpan sebagai trip saya
                </button>
                <button onClick={() => { window.location.hash = '#/'; }} className="border border-border px-4 py-2 text-sm">
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Home: daftar trip =====
  if (!trip) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          {Object.values(trips).length > 0 && (
            <div className="border border-border bg-card p-6 space-y-2">
              <h2 className="font-bold flex items-center gap-2"><Home size={18} /> Trip tersimpan</h2>
              {Object.values(trips).map(t => (
                <div key={t.id} className="flex items-center justify-between border-t border-border pt-2">
                  <button onClick={() => { window.location.hash = toHash({ name: 'trip', tripId: t.id, tab: 'expenses' }); }} className="text-left flex-1">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground block">{t.people.length} peserta · {t.expenses.length} pengeluaran</span>
                  </button>
                  <button onClick={() => setConfirmDelete({ kind: 'trip', id: t.id, label: t.name })} className="text-destructive text-sm p-1" aria-label={`Hapus trip ${t.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <DataPanel />
        </div>
      </div>
    );
  }

  // ===== Trip view =====
  const TABS: { id: TabName; label: string; icon: typeof Wallet }[] = [
    { id: 'expenses', label: 'Pengeluaran', icon: Receipt },
    { id: 'balance', label: 'Net Balance', icon: Wallet },
    { id: 'settle', label: 'Settle', icon: Check },
    { id: 'history', label: 'Riwayat', icon: BarChart3 },
    { id: 'charts', label: 'Grafik', icon: BarChart3 },
    { id: 'data', label: 'Data', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-6 border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <p className="text-muted-foreground text-sm">
              {trip.expenses.length} pengeluaran · total {formatIDR(totalSpent)}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleShare} className="border border-border p-2 hover:bg-muted" aria-label="Bagikan trip">
              <Share2 size={16} />
            </button>
            <button onClick={() => { window.location.hash = '#/'; }} className="border border-border p-2 hover:bg-muted" aria-label="Trip lain">
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
          <Users size={14} /> {trip.people.map(p => p.name).join(' · ')}
        </p>
      </header>

      {/* R2: Tab nav (hash-driven) */}
      <nav className="mb-6 flex gap-1 flex-wrap border-b border-border" aria-label="Navigasi tab">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-sm flex items-center gap-2 border-b-2 ${active ? 'border-accent text-foreground font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </nav>

      {tab === 'expenses' && (
        <section className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pengeluaran</h2>
            <button
              onClick={() => { setFormOpen(f => !f); setEditExpense(undefined); }}
              className="bg-primary text-on-primary font-semibold px-4 py-2 text-sm flex items-center gap-2"
            >
              {formOpen ? <><X size={14} /> Tutup</> : <><Plus size={14} /> Tambah pengeluaran</>}
            </button>
          </div>
          {formOpen && <ExpenseForm people={trip.people} onSubmit={handleAddExpense} initial={editExpense} />}
          {trip.expenses.length === 0 ? (
            <div className="border border-border bg-card p-8 text-center">
              <Receipt size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Belum ada pengeluaran. Tambahkan pengeluaran pertama Anda.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {trip.expenses.map(e => (
                <li key={e.id} className="flex items-center justify-between border border-border bg-card p-4">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.category} · {fmtDate(e.createdAt)}{e.updatedAt ? ' · diedit ' + fmtDate(e.updatedAt) : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <b>{formatIDR(e.amount)}</b>
                    <button onClick={() => { setEditExpense(e); setFormOpen(true); }} className="text-secondary p-1" aria-label={`Edit ${e.title}`}>
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setConfirmDelete({ kind: 'expense', id: e.id, label: `${e.title} (${formatIDR(e.amount)})` })} className="text-destructive p-1" aria-label={`Hapus ${e.title}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'balance' && (
        <section className="mb-6 space-y-4">
          <h2 className="text-xl font-bold">Net Balance</h2>
          {trip.people.length === 0 ? (
            <div className="border border-border bg-card p-8 text-center">
              <Users size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Belum ada peserta.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {trip.people.map(p => {
                  const b = balances[p.id] ?? 0;
                  return (
                    <div key={p.id} className="border border-border bg-card p-4">
                      <p className="font-semibold">{p.name}</p>
                      <p className={b > 0 ? 'text-accent' : b < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                        {b > 0 ? '+' : ''}{formatIDR(b)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b > 0 ? 'Akan menerima' : b < 0 ? 'Harus membayar' : 'Lunas'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="border border-border bg-card p-4">
                <p className="text-sm">
                  Total saldo: <b>{formatIDR(Object.values(balances).reduce((a, b) => a + b, 0))}</b>
                  {Object.values(balances).reduce((a, b) => a + b, 0) !== 0 && (
                    <span className="text-destructive"> — Invariant rusak, hubungi developer.</span>
                  )}
                </p>
              </div>
              <div className="border border-border bg-card p-4 space-y-2">
                <h3 className="font-semibold">Peserta</h3>
                <ul className="space-y-1">
                  {trip.people.map(p => (
                    <li key={p.id} className="flex items-center justify-between">
                      <span className="text-sm">{p.name}</span>
                      <button onClick={() => setConfirmDelete({ kind: 'person', id: p.id, label: p.name })} className="text-destructive p-1" aria-label={`Hapus ${p.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleAddPerson} className="flex gap-2 pt-2">
                  <input
                    value={newPerson}
                    onChange={e => setNewPerson(e.target.value)}
                    placeholder="Tambah peserta"
                    className="flex-1 border border-border bg-background px-3 py-2 text-sm"
                    aria-label="Tambah peserta"
                  />
                  <button type="submit" className="border border-border px-4 py-2 text-sm">Tambah</button>
                </form>
                {personMsg && <p className="text-destructive text-xs">{personMsg}</p>}
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'settle' && (
        <section className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Settle</h2>
            {settlementData.transfers.length > 0 && (
              <button onClick={async () => {
                const text = `*Settlement: ${trip.name}*\n${settlementData.transfers.map(t => `${nameOf(t.from)} → ${nameOf(t.to)}: ${formatIDR(t.amount)}`).join('\n')}\n\nDihitung dengan DebtSettler`;
                try { await navigator.clipboard.writeText(text); showToast('Tersalin'); } catch { showToast('Gagal menyalin'); }
              }} className="bg-accent text-black font-semibold px-4 py-2 text-sm flex items-center gap-2">
                <Copy size={14} /> Salin untuk WhatsApp
              </button>
            )}
          </div>
          {/* R3: toggle optimal */}
          <div className="border border-border bg-card p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useOptimal && settlementData.canOptimize}
                disabled={!settlementData.canOptimize}
                onChange={e => setUseOptimal(e.target.checked)}
                className="w-5 h-5 accent-accent"
              />
              <span className="text-sm">Cari jumlah transfer lebih sedikit</span>
            </label>
            {!settlementData.canOptimize && (
              <p className="text-xs text-muted-foreground">&gt;12 orang, memakai metode ringkas.</p>
            )}
            {settlementData.canOptimize && settlementData.optimalCount < settlementData.greedyCount && (
              <p className="text-xs text-accent">
                Ringkas: {settlementData.greedyCount} transfer → Diperkecil: {settlementData.optimalCount} transfer
              </p>
            )}
          </div>
          {settlementData.transfers.length === 0 ? (
            <div className="border border-border bg-card p-8 text-center">
              <Check size={32} className="mx-auto mb-3 text-accent" />
              <p className="text-muted-foreground text-sm">Semua sudah lunas.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {settlementData.transfers.map((t, i) => (
                <li key={i} className="flex items-center justify-between border border-border bg-card p-4">
                  <span>{nameOf(t.from)} → {nameOf(t.to)}: <b>{formatIDR(t.amount)}</b></span>
                  <button onClick={() => markPaid(t)} className="bg-accent text-black text-sm px-3 py-1 flex items-center gap-1">
                    <Check size={14} /> Tandai lunas
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'history' && (
        <section className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Riwayat</h2>
            <div className="flex gap-1">
              {(['all', 'expense', 'settlement'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1 text-xs border ${historyFilter === f ? 'bg-primary text-on-primary border-primary' : 'border-border text-muted-foreground'}`}
                >
                  {f === 'all' ? 'Semua' : f === 'expense' ? 'Pengeluaran' : 'Pelunasan'}
                </button>
              ))}
            </div>
          </div>
          {history.length === 0 ? (
            <div className="border border-border bg-card p-8 text-center">
              <BarChart3 size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Belum ada catatan.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map(i => (
                <li key={`${i.kind}-${i.id}`} className="flex items-center justify-between border border-border bg-card p-4">
                  <div>
                    <p className="font-medium">
                      <span className="text-xs mr-2 px-1.5 py-0.5 bg-muted">
                        {i.kind === 'expense' ? 'Pengeluaran' : 'Pelunasan'}
                      </span>
                      {i.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(i.at)}{i.edited ? ' · diedit' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <b>{formatIDR(i.amount)}</b>
                    {i.kind === 'expense' ? (
                      <>
                        <button onClick={() => { setEditExpense(i.ref as Expense); setFormOpen(true); setTab('expenses'); }} className="text-secondary p-1" aria-label="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setConfirmDelete({ kind: 'expense', id: i.id, label: `${i.title} (${formatIDR(i.amount)})` })} className="text-destructive p-1" aria-label="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete({ kind: 'settlement', id: i.id, label: i.title })} className="text-destructive p-1" aria-label="Batalkan pelunasan">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'charts' && (
        <section className="mb-6 space-y-4">
          <h2 className="text-xl font-bold">Grafik</h2>
          <ChartPanel trip={trip} />
        </section>
      )}

      {tab === 'data' && (
        <section className="mb-6 space-y-4">
          <h2 className="text-xl font-bold">Data</h2>
          <DataPanel />
          <button onClick={dumpData} className="border border-border px-4 py-2 text-sm flex items-center gap-2 hover:bg-muted">
            <Download size={14} /> Unduh data mentah (backup darurat)
          </button>
        </section>
      )}

      {/* Confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus">
          <div className="bg-card border border-border p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Konfirmasi</h3>
            <p className="text-sm mb-4">
              Hapus <b>{confirmDelete.label}</b>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="border border-border px-4 py-2 text-sm">Batal</button>
              <button onClick={confirmAction} className="bg-destructive text-on-destructive px-4 py-2 text-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border px-4 py-2 text-sm z-50 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
