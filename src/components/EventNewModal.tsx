import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { EventType } from '../data/eventTemplates';
import { EVENT_TEMPLATES } from '../data/eventTemplates';
import type { Event } from '../engine/types';

export const EventNewModal: React.FC<{
  onClose: () => void;
  onCreate: (event: Event) => void;
}> = ({ onClose, onCreate }) => {
  const [templateId, setTemplateId] = useState<EventType>('konser');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [budgetCapStr, setBudgetCapStr] = useState(String(EVENT_TEMPLATES.konser.defaultBudgetCap));

  const currentTemplate = EVENT_TEMPLATES[templateId];

  const handleTemplateChange = (newType: EventType) => {
    setTemplateId(newType);
    setBudgetCapStr(String(EVENT_TEMPLATES[newType].defaultBudgetCap));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDate) return;

    // Deep copy template untuk dihindari mutation
    const currentTemplate = EVENT_TEMPLATES[templateId];

    const newEvent: Event = {
      id: 'evt-' + Date.now(),
      name: eventName,
      date: eventDate,
      budgetCap: Number(budgetCapStr) || currentTemplate.defaultBudgetCap,
      tickets: currentTemplate.tickets.map((t: any) => ({ ...t, id: `new-${Date.now()}-${t.id}` })),
      vendors: currentTemplate.vendors.map((v: any) => ({ ...v, id: `new-${Date.now()}-${v.id}` })),
      expenses: [],
      tasks: currentTemplate.tasks.map((ts: any) => ({ ...ts, id: `new-${Date.now()}-${ts.id}` })),
      risks: currentTemplate.risks.map((r: any) => ({ ...r, id: `new-${Date.now()}-${r.id}` })),
      sponsors: (currentTemplate.sponsors || []).map((s: any) => ({ ...s, id: `new-${Date.now()}-${s.id}` })),
      rundown: (currentTemplate.rundown || []).map((rd: any) => ({ ...rd, id: `new-${Date.now()}-${rd.id}` })),
      committee: (currentTemplate.committee || []).map((c: any) => ({ ...c, id: `new-${Date.now()}-${c.id}` })),
      createdAt: new Date().toISOString(),
    };

    onCreate(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <form onSubmit={handleCreate} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-lg w-full space-y-6">
        <h2 className="text-2xl font-bold text-center">Buat Event Baru</h2>

        {/* Template Selector */}
        <div>
          <label className="text-sm text-slate-400">Pilih Template Event</label>
          <select value={templateId} onChange={e => handleTemplateChange(e.target.value as EventType)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 mt-2 text-white focus:outline-none focus:border-emerald-500/50">
            {Object.values(EVENT_TEMPLATES).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-2">{currentTemplate.description}</p>
        </div>

        {/* Nama Event */}
        <div>
          <label className="text-sm text-slate-400">Nama Event</label>
          <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} required placeholder="Konser Musik Akhir Tahun" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 mt-2 text-white" />
        </div>

        {/* Tanggal */}
        <div>
          <label className="text-sm text-slate-400">Tanggal Event</label>
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 mt-2 text-white" />
        </div>

        {/* Budget Cap */}
        <div>
          <label className="text-sm text-slate-400">Target Budget Maksimal (Rp)</label>
          <input type="number" value={budgetCapStr} onChange={e => setBudgetCapStr(e.target.value)} required placeholder={String(currentTemplate.defaultBudgetCap)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 mt-2 text-white" />
        </div>

        {/* Preview Summary */}
        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-emerald-400">Preview Modul {currentTemplate.name}:</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {templateId === 'wedding' || templateId === 'corporate' ? 'RSVP / Undangan' : 'Tiket Komersial'}
            </span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <span className="text-slate-200 font-medium">{currentTemplate.tickets.length}</span> {templateId === 'wedding' ? 'kelompok undangan tamu (VIP, Keluarga, Reguler)' : templateId === 'corporate' ? 'kategori delegasi / tamu' : 'kategori tiket'}</li>
            <li>• <span className="text-slate-200 font-medium">{currentTemplate.vendors.length}</span> vendor & pengadaan siap pakai</li>
            <li>• <span className="text-slate-200 font-medium">{currentTemplate.tasks.length}</span> checklist rundown & operasional</li>
            <li>• <span className="text-slate-200 font-medium">{currentTemplate.risks.length}</span> mitigasi risiko khusus {currentTemplate.name}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-800 p-4 rounded-xl font-semibold hover:bg-slate-700 transition-colors">Batal</button>
          <button type="submit" className="flex-1 bg-emerald-500 text-slate-950 p-4 rounded-xl font-bold hover:bg-emerald-400 transition-colors">Buat Event</button>
        </div>
      </form>
    </div>
  );
};
