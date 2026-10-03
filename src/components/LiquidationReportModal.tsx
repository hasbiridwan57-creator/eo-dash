import React from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Event } from '../engine/types';
import { netProfit, profitMargin, budgetStatus, totalInflow, totalOutflow } from '../engine/event';

export const LiquidationReportModal: React.FC<{
  event: Event;
  onClose: () => void;
}> = ({ event, onClose }) => {
  const inflow = totalInflow(event);
  const outflow = totalOutflow(event);
  const profit = netProfit(event);
  const margin = profitMargin(event);
  const bStatus = budgetStatus(event);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 my-8 space-y-6 text-slate-100 shadow-2xl">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Laporan Resmi EO-Dash</div>
            <h2 className="text-2xl font-black text-white mt-1">{event.name}</h2>
            <p className="text-xs text-slate-400">Tanggal Pelaksanaan: {event.date} • Venue: {event.venue || 'Lokasi Utama'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <Printer size={14} /> Cetak / PDF
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Total Inflow (Uang Masuk)</div>
            <div className="text-lg font-mono font-bold text-emerald-400">Rp {inflow.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Total Outflow (Vendor & Ops)</div>
            <div className="text-lg font-mono font-bold text-rose-400">Rp {outflow.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Hasil Bersih / P&L</div>
            <div className={`text-lg font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              Rp {profit.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Profit Margin</div>
            <div className="text-lg font-mono font-bold text-blue-400">{margin !== null ? `${margin}%` : '0%'}</div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40">
            <h3 className="font-bold text-sm text-slate-200 mb-2">1. Rekapitulasi Pembayaran Vendor</h3>
            <div className="space-y-1.5">
              {event.vendors.map((v) => (
                <div key={v.id} className="flex justify-between items-center py-1 border-b border-slate-900 last:border-0">
                  <div>
                    <span className="font-medium text-white">{v.name}</span>
                    <span className="text-slate-500 ml-2">({v.category})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">Rp {v.fee.toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${v.paid >= v.fee ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {v.paid >= v.fee ? 'Lunas' : `Sisa: Rp ${(v.fee - v.paid).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40">
            <h3 className="font-bold text-sm text-slate-200 mb-2">2. Rekapitulasi Penjualan & Registrasi</h3>
            <div className="space-y-1.5">
              {event.tickets.map((t) => (
                <div key={t.id} className="flex justify-between items-center py-1 border-b border-slate-900 last:border-0">
                  <div>
                    <span className="font-medium text-white">{t.category}</span>
                    <span className="text-slate-500 ml-2">({t.qty} pax @ {t.price > 0 ? `Rp ${t.price.toLocaleString()}` : 'Free/RSVP'})</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {t.price > 0 ? `Rp ${(t.qty * t.price).toLocaleString()}` : 'RSVP Tamu'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-500">
          <span>Dicetak otomatis via EO-Dash System</span>
          <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck size={14} /> Terverifikasi Integer Math</span>
        </div>
      </div>
    </div>
  );
};
