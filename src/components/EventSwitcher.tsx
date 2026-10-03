import React, { useState } from 'react';
import { ChevronDown, Plus, Calendar, Trash2, Check } from 'lucide-react';
import type { Event } from '../engine/types';
import type { Workspace } from '../data/schema';

export const EventSwitcher: React.FC<{
  workspace: Workspace;
  currentEvent: Event;
  onSelectEvent: (eventId: string) => void;
  onNewEvent: () => void;
  onDeleteEvent?: (eventId: string) => void;
}> = ({ workspace, currentEvent, onSelectEvent, onNewEvent, onDeleteEvent }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-2xl text-left transition-all"
      >
        <Calendar size={16} className="text-cyan-400 shrink-0" />
        <div className="max-w-[140px] sm:max-w-[200px] truncate">
          <div className="text-xs font-bold text-white truncate">{currentEvent.name}</div>
          <div className="text-[10px] text-slate-400 truncate">{currentEvent.date}</div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Daftar Event ({workspace.events.length})
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1">
              {workspace.events.map((ev) => {
                const isSelected = ev.id === currentEvent.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      onSelectEvent(ev.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className={`text-xs font-semibold truncate ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {ev.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{ev.date}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && <Check size={14} className="text-cyan-400" />}
                      {workspace.events.length > 1 && onDeleteEvent && !isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Hapus event "${ev.name}"?`)) {
                              onDeleteEvent(ev.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-1 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNewEvent();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors"
              >
                <Plus size={14} /> + Buat Event Baru
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
