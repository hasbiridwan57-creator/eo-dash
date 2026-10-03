/**
 * store/useWorkspace.ts — State management EO-Dash V3.
 * Persistence otomatis ke localStorage (schemaVersion 3).
 * Migrasi otomatis dari eo_dash_v2 saat pertama kali load.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Event } from '../engine/types';
import { loadWorkspace, saveWorkspace } from '../data/storage';
import { emptyWorkspace, type Workspace } from '../data/schema';
import { createSampleEvent } from '../data/sampleData';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(() => {
    try {
      const ws = loadWorkspace();
      // Hanya load sample jika benar-benar kosong (bukan karena user mau custom)
      if (ws.events.length === 0 && !localStorage.getItem('eo_dash_first_visit_done')) {
        localStorage.setItem('eo_dash_first_visit_done', 'true');
        return emptyWorkspace();
      }
      if (ws.events.length === 0) {
        const sample = createSampleEvent();
        return {
          schemaVersion: 3,
          currentEventId: sample.id,
          events: [sample],
        };
      }
      return ws;
    } catch {
      return emptyWorkspace();
    }
  });

  useEffect(() => {
    try {
      saveWorkspace(workspace);
    } catch (e) {
      console.error('Gagal menyimpan workspace', e);
    }
  }, [workspace]);

  const currentEvent: Event | null =
    workspace.events.find(e => e.id === workspace.currentEventId) ?? workspace.events[0] ?? null;

  const updateEvent = useCallback((ev: Event) => {
    setWorkspace(prev => {
      const idx = prev.events.findIndex(e => e.id === ev.id);
      const events = idx >= 0
        ? prev.events.map(e => (e.id === ev.id ? ev : e))
        : [...prev.events, ev];
      return {
        ...prev,
        events,
        currentEventId: prev.currentEventId || ev.id,
      };
    });
  }, []);

  const replaceWorkspace = useCallback((ws: Workspace) => {
    setWorkspace(ws);
  }, []);

  const loadSampleData = useCallback((sample: Event) => {
    setWorkspace({
      schemaVersion: 3,
      currentEventId: sample.id,
      events: [sample],
    });
  }, []);

  return { workspace, currentEvent, updateEvent, replaceWorkspace, loadSampleData };
}
