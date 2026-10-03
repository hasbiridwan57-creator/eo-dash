import React, { useState } from 'react';
import { Plus, CheckCircle2, Trash2, CheckSquare, Square, AlertTriangle, Pencil } from 'lucide-react';
import type { Event, Vendor, Ticket, Task, RiskItem } from '../engine/types';

export const DataPanel: React.FC<{
  event: Event;
  onUpdateEvent: (ev: Event) => void;
  tab: 'finance' | 'ops';
}> = ({ event, onUpdateEvent, tab }) => {

  // Modals
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  // Form states
  const [vName, setVName] = useState(''); const [vCat, setVCat] = useState('Sound'); const [vFee, setVFee] = useState(''); const [vPaid, setVPaid] = useState('');
  const [tCat, setTCat] = useState('VIP'); const [tQty, setTQty] = useState(''); const [tPrice, setTPrice] = useState(''); const [tChan, setTChan] = useState('Website');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);
  const [taskTitle, setTaskTitle] = useState(''); const [taskCat, setTaskCat] = useState<any>('Perizinan'); const [taskDate, setTaskDate] = useState('');
  const [riskDesc, setRiskDesc] = useState(''); const [riskImpact, setRiskImpact] = useState<any>('Tinggi'); const [riskPlanB, setRiskPlanB] = useState('');
  const [sponsorName, setSponsorName] = useState(''); const [sponsorAmount, setSponsorAmount] = useState(''); const [sponsorStatus, setSponsorStatus] = useState<'Komitmen'|'Aktif'|'Terbayar'>('Komitmen'); const [deliverable, setDeliverable] = useState('');

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskCat(task.category);
    setTaskDate(task.deadline);
    setShowTaskModal(true);
  };

  const handleEditRisk = (risk: RiskItem) => {
    setEditingRisk(risk);
    setRiskDesc(risk.risk);
    setRiskImpact(risk.impact);
    setRiskPlanB(risk.planB);
    setShowRiskModal(true);
  };

  const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 mt-1 text-white focus:outline-none focus:border-emerald-500/50";

  return (
    <div className="p-6">
      {tab === 'finance' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VENDORS */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Vendor & Talent Payables</h2>
              <button onClick={() => setShowVendorModal(true)} className="bg-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1 hover:bg-emerald-500/30">
                <Plus size={16}/> Tambah Vendor
              </button>
            </div>
            <div className="space-y-4">
              {event.vendors.map(v => (
                <div key={v.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.category} • Rp {v.paid.toLocaleString()} / Rp {v.fee.toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    {v.paid < v.fee && (
                      <button onClick={() => {
                        const updated = event.vendors.map(x => x.id === v.id ? { ...x, paid: x.fee } : x);
                        onUpdateEvent({ ...event, vendors: updated });
                      }} className="text-emerald-400 p-2 hover:bg-emerald-500/10 rounded-xl" title="Lunaskan">
                        <CheckCircle2 size={18}/>
                      </button>
                    )}
                    <button onClick={() => onUpdateEvent({ ...event, vendors: event.vendors.filter(x => x.id !== v.id) })} className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-xl">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TICKETS & REGISTRATION */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Registrasi, Undangan & Tiket</h2>
                <p className="text-xs text-slate-400 mt-1">Kelola kuota peserta, tamu RSVP, atau tiket berbayar</p>
              </div>
              <button onClick={() => setShowTicketModal(true)} className="bg-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1 hover:bg-emerald-500/30">
                <Plus size={16}/> Tambah Data
              </button>
            </div>
            <div className="space-y-4">
              {event.tickets.map(t => (
                <div key={t.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {t.category}
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{t.channel}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t.price > 0 ? (
                        `${t.qty} unit @ Rp ${t.price.toLocaleString()}`
                      ) : (
                        `${t.qty} Tamu / Kuota Undangan`
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {t.price > 0 ? (
                      <span className="font-mono text-emerald-400 font-bold">Rp {(t.qty * t.price).toLocaleString()}</span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">Non-Komersial / RSVP</span>
                    )}
                    <button onClick={() => onUpdateEvent({ ...event, tickets: event.tickets.filter(x => x.id !== t.id) })} className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-xl">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SPONSORS */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Sponsorship Inflow</h2>
              <button onClick={() => setShowSponsorModal(true)} className="bg-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1 hover:bg-emerald-500/30">
                <Plus size={16}/> Tambah Sponsor
              </button>
            </div>
            <div className="space-y-4">
              {(event.sponsors || []).map(s => (
                <div key={s.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {s.name}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.status === 'Terbayar' ? 'bg-emerald-500/20 text-emerald-400' : s.status === 'Aktif' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>{s.status}</span>
                    </div>
                    {s.deliverable && <div className="text-xs text-slate-500 mt-1">Deliverable: {s.deliverable}</div>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-bold ${s.status === 'Terbayar' ? 'text-emerald-400' : 'text-amber-400'}`}>Rp {s.amount.toLocaleString()}</span>
                    <button onClick={() => onUpdateEvent({ ...event, sponsors: event.sponsors!.filter(x => x.id !== s.id) })} className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-xl">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
              {(event.sponsors || []).length === 0 && <p className="text-slate-600 text-sm text-center py-8">Belum ada sponsor.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CHECKLIST */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Milestone & Checklist</h2>
              <button onClick={() => setShowTaskModal(true)} className="bg-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1 hover:bg-emerald-500/30">
                <Plus size={16}/> Tambah Task
              </button>
            </div>
            <div className="space-y-3">
              {(event.tasks || []).map(task => (
                <div key={task.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button onClick={() => {
                      const updated = event.tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t);
                      onUpdateEvent({ ...event, tasks: updated });
                    }} className={task.done ? "text-emerald-400" : "text-slate-500"}>
                      {task.done ? <CheckSquare size={20}/> : <Square size={20}/>}
                    </button>
                    <div>
                      <div className={`font-semibold ${task.done ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</div>
                      <div className="text-xs text-slate-500">{task.category} • Deadline: {task.deadline}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditTask(task)} className="text-slate-400 hover:text-white p-2" title="Edit Task">
                      <Pencil size={16}/>
                    </button>
                    <button onClick={() => onUpdateEvent({ ...event, tasks: event.tasks.filter(t => t.id !== task.id) })} className="text-rose-500 p-2" title="Hapus">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RISK MATRIX */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Risk Matrix & Plan B</h2>
              <button onClick={() => setShowRiskModal(true)} className="bg-emerald-500/20 text-emerald-400 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1 hover:bg-emerald-500/30">
                <Plus size={16}/> Tambah Risiko
              </button>
            </div>
            <div className="space-y-4">
              {(event.risks || []).map(r => (
                <div key={r.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold flex items-center gap-2 text-white">
                      <AlertTriangle size={16} className={r.impact === 'Tinggi' ? 'text-rose-500' : 'text-amber-500'}/>
                      {r.risk}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditRisk(r)} className="text-slate-400 hover:text-white p-1" title="Edit">
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => onUpdateEvent({ ...event, risks: event.risks.filter(x => x.id !== r.id) })} className="text-rose-500 hover:text-rose-400 p-1" title="Hapus">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${r.impact === 'Tinggi' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.impact}</span>
                  <div className="text-xs text-emerald-400 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/50">
                    <strong>Plan B:</strong> {r.planB}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL VENDOR */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowVendorModal(false)}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!vName || !vFee) return;
            const newV: Vendor = { id: 'v-'+Date.now(), name: vName, category: vCat, fee: Number(vFee), paid: Number(vPaid) || 0 };
            onUpdateEvent({ ...event, vendors: [...event.vendors, newV] });
            setShowVendorModal(false); setVName(''); setVFee(''); setVPaid('');
          }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Tambah Vendor</h3>
            <div><label className="text-xs text-slate-400">Nama</label><input value={vName} onChange={e => setVName(e.target.value)} required placeholder="Vendor Sound" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Kategori</label><select value={vCat} onChange={e => setVCat(e.target.value)} className={inputCls}><option>Sound</option><option>Talent Fee</option><option>Venue</option><option>Perizinan</option><option>Marketing</option></select></div>
            <div><label className="text-xs text-slate-400">Total Fee</label><input type="number" value={vFee} onChange={e => setVFee(e.target.value)} required placeholder="50000000" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Sudah Dibayar/DP</label><input type="number" value={vPaid} onChange={e => setVPaid(e.target.value)} placeholder="10000000" className={inputCls}/></div>
            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowVendorModal(false)} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold">Batal</button><button type="submit" className="flex-1 bg-emerald-500 text-slate-950 p-3 rounded-xl font-bold">Simpan</button></div>
          </form>
        </div>
      )}

      {/* MODAL TICKET / REGISTRASI */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowTicketModal(false)}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!tCat || !tQty) return;
            const newT: Ticket = { id: 't-'+Date.now(), category: tCat, qty: Number(tQty), price: Number(tPrice || 0), channel: tChan || 'Direct' };
            onUpdateEvent({ ...event, tickets: [...event.tickets, newT] });
            setShowTicketModal(false); setTQty(''); setTPrice('');
          }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Tambah Tiket / Undangan</h3>
            <div><label className="text-xs text-slate-400">Kategori / Nama Kelompok Tamu</label><input value={tCat} onChange={e => setTCat(e.target.value)} required placeholder="VIP / Tamu Undangan / Reguler" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Channel / Media Undangan</label><input value={tChan} onChange={e => setTChan(e.target.value)} required placeholder="Website / WhatsApp / Undangan Fisik" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Jumlah (Qty / Tamu)</label><input type="number" value={tQty} onChange={e => setTQty(e.target.value)} required min="1" placeholder="100" className={inputCls}/></div>
            <div>
              <label className="text-xs text-slate-400">Harga per Tiket (Rp) — Isi 0 jika Undangan Gratis</label>
              <input type="number" value={tPrice} onChange={e => setTPrice(e.target.value)} min="0" placeholder="0 untuk free / 250000" className={inputCls}/>
            </div>
            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowTicketModal(false)} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold">Batal</button><button type="submit" className="flex-1 bg-emerald-500 text-black p-3 rounded-xl font-bold">Simpan</button></div>
          </form>
        </div>
      )}

      {/* MODAL TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowTaskModal(false)}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!taskTitle || !taskDate) return;
            if (editingTask) {
              const updated = event.tasks.map(t => t.id === editingTask.id ? { ...t, title: taskTitle, category: taskCat, deadline: taskDate } : t);
              onUpdateEvent({ ...event, tasks: updated });
            } else {
              const newTask: Task = { id: 'ts-'+Date.now(), title: taskTitle, category: taskCat, deadline: taskDate, done: false };
              onUpdateEvent({ ...event, tasks: [...(event.tasks || []), newTask] });
            }
            setShowTaskModal(false); setEditingTask(null); setTaskTitle(''); setTaskDate('');
          }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">{editingTask ? 'Edit Task' : 'Tambah Task Ops'}</h3>
            <div><label className="text-xs text-slate-400">Nama Task</label><input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required placeholder="Izin Polsek H-14" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Kategori</label><select value={taskCat} onChange={e => setTaskCat(e.target.value as any)} className={inputCls}><option>Perizinan</option><option>Vendor</option><option>Talent</option><option>Marketing</option><option>Logistik</option><option>Hari-H</option></select></div>
            <div><label className="text-xs text-slate-400">Deadline</label><input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} required className={inputCls}/></div>
            <div className="flex gap-3 pt-2"><button type="button" onClick={() => { setShowTaskModal(false); setEditingTask(null); }} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold">Batal</button><button type="submit" className="flex-1 bg-emerald-500 text-slate-950 p-3 rounded-xl font-bold">Simpan</button></div>
          </form>
        </div>
      )}

      {/* MODAL RISK */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowRiskModal(false)}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!riskDesc || !riskPlanB) return;
            if (editingRisk) {
              const updated = event.risks.map(r => r.id === editingRisk.id ? { ...r, risk: riskDesc, impact: riskImpact, planB: riskPlanB } : r);
              onUpdateEvent({ ...event, risks: updated });
            } else {
              const newR: RiskItem = { id: 'r-'+Date.now(), risk: riskDesc, impact: riskImpact, planB: riskPlanB };
              onUpdateEvent({ ...event, risks: [...(event.risks || []), newR] });
            }
            setShowRiskModal(false); setEditingRisk(null); setRiskDesc(''); setRiskPlanB('');
          }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">{editingRisk ? 'Edit Risiko' : 'Tambah Risk & Plan B'}</h3>
            <div><label className="text-xs text-slate-400">Potensi Risiko</label><input value={riskDesc} onChange={e => setRiskDesc(e.target.value)} required placeholder="Hujan lebat saat event outdoor" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Dampak</label><select value={riskImpact} onChange={e => setRiskImpact(e.target.value)} className={inputCls}><option>Tinggi</option><option>Sedang</option><option>Rendah</option></select></div>
            <div><label className="text-xs text-slate-400">Plan B (Solusi Cepat)</label><input value={riskPlanB} onChange={e => setRiskPlanB(e.target.value)} required placeholder="Sediakan 50 jas hujan + tenda darurat" className={inputCls}/></div>
            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowRiskModal(false)} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold">Batal</button><button type="submit" className="flex-1 bg-emerald-500 text-slate-950 p-3 rounded-xl font-bold">Simpan</button></div>
          </form>
        </div>
      )}

      {/* MODAL SPONSOR */}
      {showSponsorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowSponsorModal(false)}>
          <form onSubmit={e => {
            e.preventDefault();
            if (!sponsorName || !sponsorAmount) return;
            const newSponsor: any = { 
              id: 'sp-'+Date.now(), 
              name: sponsorName, 
              amount: Number(sponsorAmount), 
              status: sponsorStatus, 
              deliverable: deliverable.trim() || undefined 
            };
            onUpdateEvent({ ...event, sponsors: [...(event.sponsors || []), newSponsor] });
            setShowSponsorModal(false); setSponsorName(''); setSponsorAmount(''); setDeliverable('');
          }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Tambah Sponsor</h3>
            <div><label className="text-xs text-slate-400">Nama Perusahaan / Sponsor</label><input value={sponsorName} onChange={e => setSponsorName(e.target.value)} required placeholder="PT. Maju Mundur" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Jumlah Kontribusi (Rp)</label><input type="number" value={sponsorAmount} onChange={e => setSponsorAmount(e.target.value)} required placeholder="25000000" className={inputCls}/></div>
            <div><label className="text-xs text-slate-400">Status Pembayaran</label><select value={sponsorStatus} onChange={e => setSponsorStatus(e.target.value as any)} className={inputCls}><option>Komitmen</option><option>Aktif</option><option>Terbayar</option></select></div>
            <div><label className="text-xs text-slate-400">Deliverables (Opsional)</label><textarea value={deliverable} onChange={e => setDeliverable(e.target.value)} placeholder="Logo exposure, booth activity, stage mention..." className={`${inputCls} min-h-[80px] resize-none`}></textarea></div>
            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowSponsorModal(false)} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold">Batal</button><button type="submit" className="flex-1 bg-emerald-500 text-slate-950 p-3 rounded-xl font-bold">Simpan</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
