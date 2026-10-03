import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DataPanel } from './components/DataPanel';
import { RundownPanel } from './components/RundownPanel';
import { DataTab } from './components/DataTab';
import { useWorkspace } from './store/useWorkspace';
import { EventNewModal } from './components/EventNewModal';
import type { Event } from './engine/types';
import { Wallet, ListChecks, Clock, HardDrive } from 'lucide-react';

export default function App() {
  const { workspace, currentEvent, updateEvent, switchEvent, deleteEvent, replaceWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'finance' | 'ops' | 'rundown' | 'data'>('finance');
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  const handleCreateEvent = (newEvent: Event) => {
    if (currentEvent) {
      const updatedEvents = [...workspace.events.map(e => e.id === currentEvent.id ? currentEvent : e), newEvent];
      replaceWorkspace({ ...workspace, events: updatedEvents, currentEventId: newEvent.id });
    } else {
      replaceWorkspace({ schemaVersion: 3, currentEventId: newEvent.id, events: [newEvent] });
    }
    setShowNewEventModal(false);
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Selamat Datang di EO-Dash</h1>
          <p className="text-slate-400 text-sm leading-relaxed">Kelola keuangan, vendor, checklist, rundown hari H, dan risiko event Anda dalam satu dashboard production-grade.</p>
          <button onClick={() => setShowNewEventModal(true)} className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            Buat Event Baru
          </button>
          <div className="pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500">Tersedia preset untuk Konser Musik, Wedding Organizer, Corporate Gala, & Festival</p>
          </div>
        </div>
      </div>
    );
  }

  if (showNewEventModal) {
    return <EventNewModal onClose={() => setShowNewEventModal(false)} onCreate={handleCreateEvent} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20 selection:bg-emerald-500/30 font-sans">
      <Dashboard
        event={currentEvent}
        onUpdateEvent={updateEvent}
        onNewEvent={() => setShowNewEventModal(true)}
        workspace={workspace}
        onSelectEvent={switchEvent}
        onDeleteEvent={deleteEvent}
      />

      <div className="px-6 mt-6 max-w-7xl mx-auto">
        <div className="flex gap-2 sm:gap-3 mb-6 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 ${
              activeTab === 'finance'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Keuangan & Vendor</span>
          </button>

          <button
            onClick={() => setActiveTab('ops')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 ${
              activeTab === 'ops'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Checklist & Risiko</span>
          </button>

          <button
            onClick={() => setActiveTab('rundown')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 ${
              activeTab === 'rundown'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Rundown & Cue Sheet</span>
            {currentEvent.rundown && currentEvent.rundown.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === 'rundown' ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {currentEvent.rundown.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all shrink-0 ${
              activeTab === 'data'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Backup & Sync</span>
          </button>
        </div>

        {(activeTab === 'finance' || activeTab === 'ops') && (
          <DataPanel event={currentEvent} onUpdateEvent={updateEvent} tab={activeTab} />
        )}

        {activeTab === 'rundown' && (
          <RundownPanel event={currentEvent} onUpdateEvent={updateEvent} />
        )}

        {activeTab === 'data' && (
          <DataTab workspace={workspace} onReplaceWorkspace={replaceWorkspace} />
        )}
      </div>
    </div>
  );
}
