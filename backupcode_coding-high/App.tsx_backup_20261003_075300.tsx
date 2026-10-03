import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DataPanel } from './components/DataPanel';
import { DataTab } from './components/DataTab';
import { useWorkspace } from './store/useWorkspace';
import { EventNewModal } from './components/EventNewModal';
import type { Event } from './engine/types';

export default function App() {
  const { workspace, currentEvent, updateEvent, replaceWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'finance' | 'ops' | 'data'>('finance');
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
          <h1 className="text-3xl font-bold mb-4">Selamat Datang di EO-Dash</h1>
          <p className="text-slate-400">Kelola keuangan, vendor, checklist, dan risiko event Anda dalam satu dashboard cinematic.</p>
          <button onClick={() => setShowNewEventModal(true)} className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            Buat Event Baru
          </button>
          <div className="pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500">Dukung oleh template untuk Konser, Wedding, Corporate Event, & Festival</p>
          </div>
        </div>
      </div>
    );
  }

  if (showNewEventModal) {
    return <EventNewModal onClose={() => setShowNewEventModal(false)} onCreate={handleCreateEvent} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20 selection:bg-emerald-500/30">
      <Dashboard event={currentEvent} onUpdateEvent={updateEvent} onNewEvent={() => setShowNewEventModal(true)} />

      <div className="px-6 mt-6">
        <div className="flex gap-3 mb-6 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all shrink-0 ${
              activeTab === 'finance'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            💰 Keuangan & Budget
          </button>
          <button
            onClick={() => setActiveTab('ops')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all shrink-0 ${
              activeTab === 'ops'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            📋 Checklist & Risk Matrix
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all shrink-0 ${
              activeTab === 'data'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            💾 Cadangan & Pemulihan
          </button>
        </div>

        {(activeTab === 'finance' || activeTab === 'ops') && <DataPanel event={currentEvent} onUpdateEvent={updateEvent} tab={activeTab} />}
        {activeTab === 'data' && <DataTab workspace={workspace} onReplaceWorkspace={replaceWorkspace} />}
      </div>
    </div>
  );
}
