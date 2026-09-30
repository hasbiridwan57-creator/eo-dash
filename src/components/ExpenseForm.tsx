import { useState, useEffect } from 'react';
import type { Expense, Person } from '../engine/types';
import { validateExpense } from '../engine/validate';
import { CATEGORIES } from '../engine/validate';
import { parseRupiah, percentToBp, bpToPercentString, equalBp, formatIDR } from '../engine/money';
import { splitEqual, splitPercentage, splitCustom } from '../engine/split';

export type Draft = {
  title: string;
  amountText: string;
  category: string;
  payerMode: 'single' | 'multi';
  singlePayerId: string;
  multiPayers: Record<string, string>;
  splitType: 'equal' | 'percentage' | 'custom';
  equalIds: Set<string>;
  pctText: Record<string, string>;
  customText: Record<string, string>;
};

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function expenseToDraft(e: Expense): Draft {
  const payerMode = e.payers.length > 1 ? 'multi' : 'single';
  const multiPayers: Record<string, string> = {};
  for (const p of e.payers) multiPayers[p.personId] = String(p.amount);
  const singlePayerId = e.payers[0]?.personId ?? '';

  const pctText: Record<string, string> = {};
  const customText: Record<string, string> = {};
  let splitType: Draft['splitType'] = 'equal';
  let equalIds = new Set<string>();

  if (e.split.type === 'percentage') {
    splitType = 'percentage';
    for (const s of e.split.shares) pctText[s.personId] = bpToPercentString(s.bp);
  } else if (e.split.type === 'custom') {
    splitType = 'custom';
    for (const s of e.split.shares) customText[s.personId] = String(s.amount);
  } else {
    equalIds = new Set(e.split.participantIds);
  }

  return {
    title: e.title,
    amountText: String(e.amount),
    category: e.category,
    payerMode,
    singlePayerId,
    multiPayers,
    splitType,
    equalIds,
    pctText,
    customText,
  };
}

export function emptyDraft(people: Person[]): Draft {
  return {
    title: '',
    amountText: '',
    category: 'Lainnya',
    payerMode: 'single',
    singlePayerId: people[0]?.id ?? '',
    multiPayers: {},
    splitType: 'equal',
    equalIds: new Set(people.map(p => p.id)),
    pctText: {},
    customText: {},
  };
}

export function draftToExpense(draft: Draft, people: Person[], id?: string, createdAt?: string, updatedAt?: string): Expense | { errors: string[] } {
  const errors: string[] = [];
  const amount = parseRupiah(draft.amountText);

  if (!draft.title.trim()) errors.push('Judul wajib diisi.');
  if (amount === null) errors.push('Jumlah tidak valid (harus integer positif).');

  let payers: { personId: string; amount: number }[] = [];
  if (draft.payerMode === 'single') {
    if (!draft.singlePayerId) errors.push('Pilih pembayar.');
    else if (amount !== null) payers = [{ personId: draft.singlePayerId, amount }];
  } else {
    const entries = Object.entries(draft.multiPayers).filter(([, v]) => v.trim() !== '');
    for (const [pid, text] of entries) {
      const a = parseRupiah(text);
      if (a === null) errors.push(`Nominal pembayaran tidak valid untuk ${people.find(p => p.id === pid)?.name ?? pid}.`);
      else payers.push({ personId: pid, amount: a });
    }
    if (payers.length === 0) errors.push('Minimal satu pembayar.');
    else if (amount !== null && payers.reduce((a, p) => a + p.amount, 0) !== amount)
      errors.push(`Total pembayar ${formatIDR(payers.reduce((a, p) => a + p.amount, 0))} harus sama dengan jumlah ${amount !== null ? formatIDR(amount) : '?'}.`);
  }

  let split: Expense['split'] = { type: 'equal', participantIds: [] };
  if (draft.splitType === 'equal') {
    split = { type: 'equal', participantIds: [...draft.equalIds] };
    if (draft.equalIds.size === 0) errors.push('Pilih minimal satu peserta.');
  } else if (draft.splitType === 'percentage') {
    const shares: { personId: string; bp: number }[] = [];
    let totalBp = 0;
    for (const [pid, text] of Object.entries(draft.pctText)) {
      if (!text.trim()) continue;
      const bp = percentToBp(text);
      if (bp === null) errors.push(`Persentase tidak valid untuk ${people.find(p => p.id === pid)?.name ?? pid}.`);
      else { shares.push({ personId: pid, bp }); totalBp += bp; }
    }
    if (shares.length === 0) errors.push('Minimal satu peserta.');
    else if (totalBp !== 10000) errors.push(`Total persentase harus 100% (sekarang ${totalBp / 100}%).`);
    split = { type: 'percentage', shares };
  } else {
    const shares: { personId: string; amount: number }[] = [];
    let total = 0;
    for (const [pid, text] of Object.entries(draft.customText)) {
      if (!text.trim()) continue;
      const a = parseRupiah(text);
      if (a === null) errors.push(`Nominal tidak valid untuk ${people.find(p => p.id === pid)?.name ?? pid}.`);
      else { shares.push({ personId: pid, amount: a }); total += a; }
    }
    if (shares.length === 0) errors.push('Minimal satu peserta.');
    else if (amount !== null && total !== amount) errors.push(`Total pembagian ${formatIDR(total)} harus sama dengan jumlah ${formatIDR(amount)}.`);
    split = { type: 'custom', shares };
  }

  if (errors.length > 0) return { errors };

  return {
    id: id ?? uid('e'),
    title: draft.title.trim(),
    category: draft.category,
    amount: amount!,
    payers,
    split,
    createdAt: createdAt ?? new Date().toISOString(),
    updatedAt,
  };
}

interface ExpenseFormProps {
  people: Person[];
  onSubmit: (e: Expense) => void;
  initial?: Expense;
}

export default function ExpenseForm({ people, onSubmit, initial }: ExpenseFormProps) {
  const [draft, setDraft] = useState<Draft>(() => initial ? expenseToDraft(initial) : emptyDraft(people));
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (initial) setDraft(expenseToDraft(initial));
  }, [initial]);

  const built = draftToExpense(draft, people, initial?.id, initial?.createdAt, initial ? new Date().toISOString() : undefined);
  const errors = 'errors' in built ? built.errors : [];
  const isValid = errors.length === 0;

  function update(patch: Partial<Draft>) {
    setDraft(d => ({ ...d, ...patch }));
  }

  // Preview share
  let preview: { personId: string; amount: number }[] = [];
  const eBuilt = built as Expense;
  if (isValid && eBuilt.amount > 0) {
    if (eBuilt.split.type === 'equal') preview = splitEqual(eBuilt.amount, eBuilt.split.participantIds);
    else if (eBuilt.split.type === 'percentage') preview = splitPercentage(eBuilt.amount, eBuilt.split.shares);
    else preview = splitCustom(eBuilt.amount, eBuilt.split.shares);
  }

  const totalPct = Object.entries(draft.pctText).reduce((a, [, v]) => a + (percentToBp(v) ?? 0), 0);
  const totalCustom = Object.entries(draft.customText).reduce((a, [, v]) => a + (parseRupiah(v) ?? 0), 0);
  const totalMultiPayer = Object.entries(draft.multiPayers).reduce((a, [, v]) => a + (parseRupiah(v) ?? 0), 0);
  const amountVal = parseRupiah(draft.amountText);

  function bagilRataPercentage() {
    const ids = people.map(p => p.id);
    const bps = equalBp(ids.length);
    const next: Record<string, string> = {};
    ids.forEach((pid, i) => { next[pid] = bpToPercentString(bps[i]); });
    update({ pctText: next });
  }

  function bagilRataCustomSisa() {
    if (amountVal === null) return;
    const filledIds = Object.keys(draft.customText).filter(k => parseRupiah(draft.customText[k]) !== null);
    const filledTotal = filledIds.reduce((a, k) => a + (parseRupiah(draft.customText[k]) ?? 0), 0);
    const sisa = amountVal - filledTotal;
    const kosong = people.filter(p => !filledIds.includes(p.id));
    if (kosong.length === 0 || sisa <= 0) return;
    const base = Math.floor(sisa / kosong.length);
    const r = sisa - base * kosong.length;
    const next = { ...draft.customText };
    kosong.forEach((p, i) => { next[p.id] = String(base + (i < r ? 1 : 0)); });
    update({ customText: next });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isValid) { setShowErrors(true); return; }
        if ('errors' in built) return;
        onSubmit(built as Expense);
      }}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-white dark:bg-neutral-900"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={draft.title}
          onChange={e => update({ title: e.target.value })}
          placeholder="Judul (mis: Tiket masuk)"
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          aria-label="Judul pengeluaran"
        />
        <input
          value={draft.amountText}
          onChange={e => update({ amountText: e.target.value.replace(/\D/g, '') })}
          placeholder="Jumlah (Rp)"
          inputMode="numeric"
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          aria-label="Jumlah Rupiah"
        />
        <select
          value={draft.category}
          onChange={e => update({ category: e.target.value })}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          aria-label="Kategori"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Payer */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ payerMode: 'single' })}
            className={`rounded-lg px-3 py-1 text-sm border ${draft.payerMode === 'single' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700'}`}
          >
            Pembayar tunggal
          </button>
          <button
            type="button"
            onClick={() => update({ payerMode: 'multi' })}
            className={`rounded-lg px-3 py-1 text-sm border ${draft.payerMode === 'multi' ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700'}`}
          >
            Pembayar gabungan
          </button>
        </div>
        {draft.payerMode === 'single' ? (
          <select
            value={draft.singlePayerId}
            onChange={e => update({ singlePayerId: e.target.value })}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
            aria-label="Pembayar"
          >
            <option value="">Pilih pembayar...</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        ) : (
          <div className="space-y-1">
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-24 text-sm">{p.name}</span>
                <input
                  value={draft.multiPayers[p.id] ?? ''}
                  onChange={e => update({ multiPayers: { ...draft.multiPayers, [p.id]: e.target.value.replace(/\D/g, '') } })}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1"
                  aria-label={`Nominal pembayaran ${p.name}`}
                />
              </div>
            ))}
            <p className="text-xs text-neutral-500">
              Terisi {formatIDR(totalMultiPayer)} dari {amountVal !== null ? formatIDR(amountVal) : '?'} · sisa {amountVal !== null ? formatIDR(amountVal - totalMultiPayer) : '?'}
            </p>
          </div>
        )}
      </div>

      {/* Split type */}
      <div className="flex gap-2">
        {(['equal', 'percentage', 'custom'] as const).map(t => (
          <button
            type="button"
            key={t}
            onClick={() => update({ splitType: t })}
            className={`rounded-lg px-3 py-1 text-sm border ${draft.splitType === t ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700'}`}
          >
            {t === 'equal' ? 'Rata' : t === 'percentage' ? 'Persen' : 'Nominal'}
          </button>
        ))}
      </div>

      {draft.splitType === 'equal' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => update({ equalIds: new Set(people.map(p => p.id)) })} className="rounded-lg px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-700">Pilih semua</button>
            <button type="button" onClick={() => update({ equalIds: new Set() })} className="rounded-lg px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-700">Kosongkan</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {people.map(p => (
              <button
                type="button"
                key={p.id}
                onClick={() => update({ equalIds: new Set([...draft.equalIds].includes(p.id) ? [...draft.equalIds].filter(x => x !== p.id) : [...draft.equalIds, p.id]) })}
                className={`rounded-full px-3 py-1 text-sm border ${draft.equalIds.has(p.id) ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'border-neutral-300 dark:border-neutral-700'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {draft.splitType === 'percentage' && (
        <div className="space-y-2">
          <button type="button" onClick={bagilRataPercentage} className="rounded-lg px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-700">Bagi rata</button>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-20 text-sm">{p.name}</span>
                <input
                  value={draft.pctText[p.id] ?? ''}
                  onChange={e => update({ pctText: { ...draft.pctText, [p.id]: e.target.value } })}
                  placeholder="0"
                  inputMode="decimal"
                  className="w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1"
                  aria-label={`Persentase ${p.name}`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            Total {(totalPct / 100).toLocaleString('id-ID', { minimumFractionDigits: 2 })}% · sisa {((10000 - totalPct) / 100).toLocaleString('id-ID', { minimumFractionDigits: 2 })}%
          </p>
        </div>
      )}

      {draft.splitType === 'custom' && (
        <div className="space-y-2">
          <button type="button" onClick={bagilRataCustomSisa} className="rounded-lg px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-700">Bagi rata sisa ke yang kosong</button>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-20 text-sm">{p.name}</span>
                <input
                  value={draft.customText[p.id] ?? ''}
                  onChange={e => update({ customText: { ...draft.customText, [p.id]: e.target.value.replace(/\D/g, '') } })}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1"
                  aria-label={`Nominal ${p.name}`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            Terisi {formatIDR(totalCustom)} · sisa {amountVal !== null ? formatIDR(amountVal - totalCustom) : '?'}
          </p>
        </div>
      )}

      {isValid && preview.length > 0 && (
        <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-3 text-sm">
          <p className="font-semibold mb-1">Pratinjau pembagian:</p>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {preview.map(s => (
              <li key={s.personId}>
                {people.find(p => p.id === s.personId)?.name ?? s.personId}: <b>{formatIDR(s.amount)}</b>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showErrors && errors.length > 0 && (
        <ul className="text-red-500 text-sm space-y-1">
          {errors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
      )}

      <button
        type="submit"
        disabled={!isValid}
        className="w-full rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold py-2 disabled:opacity-50"
      >
        {initial ? 'Simpan perubahan' : 'Tambah pengeluaran'}
      </button>
    </form>
  );
}
