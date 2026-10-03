import React, { useState } from 'react';
import { Plus, Trash2, Clock, MapPin, User, Sparkles, CheckCircle, Radio, Phone, Users } from 'lucide-react';
import type { Event, RundownItem, CommitteeMember } from '../engine/types';

export const RundownPanel: React.FC<{
  event: Event;
  onUpdateEvent: (ev: Event) => void;
}> = ({ event, onUpdateEvent }) => {
  const [showRundownModal, setShowRundownModal] = useState(false);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);

  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('Main Stage');
  const [pic, setPic] = useState('');
  const [cue, setCue] = useState('');
  const [status, setStatus] = useState<RundownItem['status']>('Upcoming');

  const [cName, setCName] = useState('');
  const [cRole, setCRole] = useState('');
  const [cDivision, setCDivision] = useState<CommitteeMember['division']>('Event / Show');
  const [cPhone, setCPhone] = useState('');

  const rundownList = event.rundown || [];
  const committeeList = event.committee || [];

  const handleAddRundown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeStart || !timeEnd || !activity) return;

    const newItem: RundownItem = {
      id: 'rd-' + Date.now(),
      timeStart,
      timeEnd,
      activity,
      location,
      pic: pic || 'Panitia',
      cue,
      status,
    };

    onUpdateEvent({
      ...event,
      rundown: [...rundownList, newItem],
    });

    setTimeStart('');
    setTimeEnd('');
    setActivity('');
    setCue('');
    setShowRundownModal(false);
  };

  const handleUpdateStatus = (id: string, newStatus: RundownItem['status']) => {
    const updated = rundownList.map(item => item.id === id ? { ...item, status: newStatus } : item);
    onUpdateEvent({ ...event, rundown: updated });
  };

  const handleDeleteRundown = (id: string) => {
    onUpdateEvent({ ...event, rundown: rundownList.filter(item => item.id !== id) });
  };

  const handleAddCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cRole) return;

    const newMember: CommitteeMember = {
      id: 'cm-' + Date.now(),
      name: cName,
      role: cRole,
      division: cDivision,
      phone: cPhone || '-',
    };

    onUpdateEvent({
      ...event,
      committee: [...committeeList, newMember],
    });

    setCName('');
    setCRole('');
    setCPhone('');
    setShowCommitteeModal(false);
  };

  const handleDeleteCommittee = (id: string) => {
    onUpdateEvent({ ...event, committee: committeeList.filter(m => m.id !== id) });
  };

  const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 mt-1 text-white focus:outline-none focus:border-cyan-500/50";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-cyan-400" size={22} />
              Run-of-Show & Cue Sheet Hari-H
            </h2>
            <p className="text-xs text-slate-400 mt-1">Timeline menit-ke-menit, panggung, PIC, dan instruksi teknis (Audio/Lighting/Cue)</p>
          </div>
          <button
            onClick={() => setShowRundownModal(true)}
            className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} /> Tambah Sesi Rundown
          </button>
        </div>

        <div className="space-y-3">
          {rundownList.map((item) => {
            const isLive = item.status === 'Live';
            const isDone = item.status === 'Done';
            const isStandby = item.status === 'Standby';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLive
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : isStandby
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : isDone
                    ? 'bg-slate-950/30 border-slate-800 opacity-60'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-center shrink-0">
                      <span className="font-mono text-cyan-400 font-bold text-sm block">{item.timeStart}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">s/d {item.timeEnd}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.activity}
                        </span>
                        {isLive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                            <Radio size={12} /> ON STAGE
                          </span>
                        )}
                        {isStandby && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            STANDBY
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            SELESAI
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-500" /> {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-slate-500" /> PIC: <strong className="text-slate-300">{item.pic}</strong>
                        </span>
                      </div>

                      {item.cue && (
                        <div className="mt-2.5 text-xs bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-amber-300 flex items-start gap-1.5">
                          <Sparkles size={14} className="shrink-0 mt-0.5 text-amber-400" />
                          <span><strong className="text-slate-300">Cue Instruksi:</strong> {item.cue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(item.id, e.target.value as RundownItem['status'])}
                      className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Standby">Standby</option>
                      <option value="Live">Live / On-Stage</option>
                      <option value="Done">Selesai</option>
                    </select>
                    <button
                      onClick={() => handleDeleteRundown(item.id)}
                      className="text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {rundownList.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              Belum ada sesi rundown. Klik "Tambah Sesi Rundown" untuk menyusun jadwal acara.
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-indigo-400" size={22} />
              Tim & Roster EO
            </h2>
            <p className="text-xs text-slate-400 mt-1">PIC divisi & kontak panitia</p>
          </div>
          <button
            onClick={() => setShowCommitteeModal(true)}
            className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus size={14} /> Tambah
          </button>
        </div>

        <div className="space-y-3">
          {committeeList.map((member) => (
            <div key={member.id} className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm text-white flex items-center gap-2">
                  {member.name}
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {member.division}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{member.role}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Phone size={11} /> {member.phone}
                </div>
              </div>
              <button
                onClick={() => handleDeleteCommittee(member.id)}
                className="text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {committeeList.length === 0 && (
            <p className="text-slate-500 text-xs text-center py-6">Belum ada data anggota panitia.</p>
          )}
        </div>
      </div>

      {showRundownModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowRundownModal(false)}>
          <form onSubmit={handleAddRundown} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Tambah Sesi Rundown</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Jam Mulai (HH:MM)</label>
                <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-slate-400">Jam Selesai (HH:MM)</label>
                <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} required className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Nama Aktivitas / Penampil</label>
              <input value={activity} onChange={e => setActivity(e.target.value)} required placeholder="Soundcheck / Sambutan / Main Performance" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Area / Panggung</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Main Stage / Gate 1" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-slate-400">PIC Penanggung Jawab</label>
                <input value={pic} onChange={e => setPic(e.target.value)} placeholder="Stage Manager / Dimas" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Instruksi Teknis & Cue (Opsional)</label>
              <textarea value={cue} onChange={e => setCue(e.target.value)} rows={2} placeholder="Spotlight artist, audio tape intro, smoke machine" className={inputCls} />
            </div>

            <div>
              <label className="text-xs text-slate-400">Status Awal</label>
              <select value={status} onChange={e => setStatus(e.target.value as RundownItem['status'])} className={inputCls}>
                <option value="Upcoming">Upcoming</option>
                <option value="Standby">Standby</option>
                <option value="Live">Live / On-Stage</option>
                <option value="Done">Selesai</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowRundownModal(false)} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold">Batal</button>
              <button type="submit" className="flex-1 bg-cyan-500 text-slate-950 p-3 rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {showCommitteeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowCommitteeModal(false)}>
          <form onSubmit={handleAddCommittee} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Tambah Anggota Panitia</h3>
            
            <div>
              <label className="text-xs text-slate-400">Nama Lengkap</label>
              <input value={cName} onChange={e => setCName(e.target.value)} required placeholder="Budi Santoso" className={inputCls} />
            </div>

            <div>
              <label className="text-xs text-slate-400">Divisi</label>
              <select value={cDivision} onChange={e => setCDivision(e.target.value as CommitteeMember['division'])} className={inputCls}>
                <option value="Event / Show">Event / Show</option>
                <option value="Finance & Ticketing">Finance & Ticketing</option>
                <option value="Production & Sound">Production & Sound</option>
                <option value="Security & Perizinan">Security & Perizinan</option>
                <option value="F&B & Hospitality">F&B & Hospitality</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400">Jabatan / Role</label>
              <input value={cRole} onChange={e => setCRole(e.target.value)} required placeholder="Stage Manager / Sound Eng" className={inputCls} />
            </div>

            <div>
              <label className="text-xs text-slate-400">No. WhatsApp / Telepon</label>
              <input value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="0812-xxxx-xxxx" className={inputCls} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCommitteeModal(false)} className="flex-1 bg-slate-800 p-3 rounded-xl font-semibold">Batal</button>
              <button type="submit" className="flex-1 bg-indigo-500 text-white p-3 rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
