import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, ShieldAlert, DollarSign, Settings2, Plus, Users, Wallet, PiggyBank, FileText } from 'lucide-react';
import type { Event } from '../engine/types';
import type { Workspace } from '../data/schema';
import { netProfit, profitMargin, ticketsToBreakEven, budgetStatus, contingencyReserve } from '../engine/event';
import { EventSwitcher } from './EventSwitcher';
import { LiquidationReportModal } from './LiquidationReportModal';

export const Dashboard: React.FC<{
  event: Event;
  workspace?: Workspace;
  onUpdateEvent: (ev: Event) => void;
  onNewEvent?: () => void;
  onSelectEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}> = ({ event, workspace, onUpdateEvent, onNewEvent, onSelectEvent, onDeleteEvent }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [showLiquidation, setShowLiquidation] = useState(false);
  const [capInput, setCapInput] = useState(String(event.budgetCap));
  const [pctInput, setPctInput] = useState(String(event.contingencyPct ?? 15));

  const isTicketed = (event.tickets || []).some(t => t.price > 0);
  const totalGuests = (event.tickets || []).reduce((acc, t) => acc + t.qty, 0);

  const profit = netProfit(event);
  const margin = profitMargin(event);
  const bStatus = budgetStatus(event);
  const ticketsNeeded = ticketsToBreakEven(event);
  const pct = event.contingencyPct ?? 15;
  const contingency = contingencyReserve(event, pct * 100);
  const remainingBudget = event.budgetCap - bStatus.used;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const newCap = Number(capInput);
    const newPct = Number(pctInput);
    if (!Number.isInteger(newCap) || newCap < 0) return;
    onUpdateEvent({
      ...event,
      budgetCap: newCap,
      contingencyPct: newPct,
    });
    setShowConfig(false);
  };

  const stats = isTicketed ? [
    { title: 'Net Profit', value: `Rp ${profit.toLocaleString()}`, icon: DollarSign, color: profit >= 0 ? 'text-emerald-400' : 'text-rose-400' },
    { title: 'Margin', value: margin !== null ? `${margin}%` : '0%', icon: TrendingUp, color: 'text-blue-400' },
    { title: 'BEP (Tiket)', value: ticketsNeeded !== null ? `${ticketsNeeded} Unit` : 'Tercapai', icon: Target, color: 'text-amber-400' },
    { title: `Dana Darurat (${pct}%)`, value: `Rp ${contingency.toLocaleString()}`, icon: ShieldAlert, color: 'text-purple-400', clickable: true },
  ] : [
    { title: 'Total Komitmen Biaya', value: `Rp ${bStatus.used.toLocaleString()}`, icon: Wallet, color: 'text-rose-400' },
    { title: 'Sisa Pagu Budget', value: `Rp ${remainingBudget.toLocaleString()}`, icon: PiggyBank, color: remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-500' },
    { title: 'Total Target Tamu (RSVP)', value: `${totalGuests.toLocaleString()} Tamu`, icon: Users, color: 'text-indigo-400' },
    { title: `Dana Darurat (${pct}%)`, value: `Rp ${contingency.toLocaleString()}`, icon: ShieldAlert, color: 'text-purple-400', clickable: true },
  ];

  return (
    <div className="p-6">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            {workspace && onSelectEvent && (
              <EventSwitcher
                workspace={workspace}
                currentEvent={event}
                onSelectEvent={onSelectEvent}
                onNewEvent={() => onNewEvent?.()}
                onDeleteEvent={onDeleteEvent}
              />
            )}
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">{event.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isTicketed ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'}`}>
              {isTicketed ? 'Tiket Komersial' : 'RSVP & Anggaran'}
            </span>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-blue-500 mt-2 rounded-full" />
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowLiquidation(true)}
            className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <FileText size={16} /> Laporan Likuidasi
          </button>
          <button
            onClick={() => onNewEvent?.()}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} /> Event Baru
          </button>
          <button
            onClick={() => { setCapInput(String(event.budgetCap)); setPctInput(String(event.contingencyPct ?? 15)); setShowConfig(true); }}
            className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <Settings2 size={16} /> Budget & Dana Darurat
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={s.clickable ? () => { setCapInput(String(event.budgetCap)); setPctInput(String(event.contingencyPct ?? 15)); setShowConfig(true); } : undefined}
            className={`group relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-3xl hover:border-slate-700 transition-all ${s.clickable ? 'cursor-pointer hover:bg-slate-900/60' : ''}`}
          >
            <s.icon className={`mb-3 ${s.color}`} size={24} />
            <div className="text-sm text-slate-400 flex justify-between items-center">
              {s.title}
              {s.clickable && <span className="text-xs text-purple-400 opacity-60 group-hover:opacity-100">Ubah</span>}
            </div>
            <div className="text-xl font-bold mt-1">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-6">Budget Burn-Rate & Safety Buffer</h2>
        <div className="relative w-full bg-slate-800/50 h-4 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, bStatus.pct ?? 0)}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full ${bStatus.over ? "bg-rose-500" : "bg-emerald-500"} shadow-[0_0_20px_rgba(16,185,129,0.5)]`} />
        </div>
        <div className="flex justify-between mt-3 text-sm text-slate-400 font-mono">
          <span>0%</span>
          <span>Used: {bStatus.used.toLocaleString()} / Cap: {event.budgetCap.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* MODAL CONFIG BUDGET & CONTINGENCY */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowConfig(false)}>
          <form onSubmit={handleSaveConfig} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Atur Budget & Dana Darurat</h3>
            <p className="text-xs text-slate-400">
              Dana darurat (contingency reserve) adalah persentase dari budget maksimal yang dicadangkan untuk pengeluaran tak terduga di lapangan.
            </p>
            <div>
              <label className="text-xs text-slate-400">Target Budget Maksimal (Budget Cap)</label>
              <input type="number" value={capInput} onChange={e => setCapInput(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 mt-1 text-white focus:outline-none focus:border-emerald-500/50"/>
            </div>
            <div>
              <label className="text-xs text-slate-400">Persentase Dana Darurat (%)</label>
              <input type="number" min="0" max="50" value={pctInput} onChange={e => setPctInput(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 mt-1 text-white focus:outline-none focus:border-emerald-500/50"/>
              <span className="text-[10px] text-slate-500 mt-1 block">Standar industri EO: 10% s.d. 15%</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowConfig(false)} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">Batal</button>
              <button type="submit" className="flex-1 bg-emerald-500 text-slate-950 p-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL LAPORAN LIKUIDASI */}
      {showLiquidation && (
        <LiquidationReportModal event={event} onClose={() => setShowLiquidation(false)} />
      )}
    </div>
  );
};
