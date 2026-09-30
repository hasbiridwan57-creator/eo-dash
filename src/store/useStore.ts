import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Trip, Expense, Settlement, Person } from '../engine/types';
import { migrateV1toV2, type V2State } from './migrate';

interface Store extends V2State {
  setTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addExpense: (tripId: string, e: Expense) => void;
  updateExpense: (tripId: string, e: Expense) => void;
  removeExpense: (tripId: string, expenseId: string) => void;
  addSettlement: (tripId: string, s: Settlement) => void;
  removeSettlement: (tripId: string, settlementId: string) => void;
  addPerson: (tripId: string, p: Person) => void;
  removePerson: (tripId: string, personId: string) => void;
  setActiveTrip: (tripId: string | null) => void;
  importTrip: (trip: Trip) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      trips: {},
      activeTripId: null,
      setActiveTrip: (tripId) => set({ activeTripId: tripId }),
      setTrip: (trip) => set((s) => ({
        trips: { ...s.trips, [trip.id]: trip },
        activeTripId: trip.id,
      })),
      deleteTrip: (id) => set((s) => {
        const next = { ...s.trips };
        delete next[id];
        return { trips: next, activeTripId: s.activeTripId === id ? null : s.activeTripId };
      }),
      addExpense: (tid, e) => set((s) => {
        const t = s.trips[tid];
        if (!t) return s;
        return { trips: { ...s.trips, [tid]: { ...t, expenses: [...t.expenses, e] } } };
      }),
      updateExpense: (tid, e) => set((s) => {
        const t = s.trips[tid];
        if (!t) return s;
        const expenses = t.expenses.map((x) => (x.id === e.id ? e : x));
        return { trips: { ...s.trips, [tid]: { ...t, expenses } } };
      }),
      removeExpense: (tid, eid) => set((s) => {
        const t = s.trips[tid];
        if (!t) return s;
        return { trips: { ...s.trips, [tid]: { ...t, expenses: t.expenses.filter((x) => x.id !== eid) } } };
      }),
      addSettlement: (tid, st) => set((s) => {
        const t = s.trips[tid];
        if (!t) return s;
        return { trips: { ...s.trips, [tid]: { ...t, settlements: [...t.settlements, st] } } };
      }),
      removeSettlement: (tid, sid) => set((s) => {
        const t = s.trips[tid];
        if (!t) return s;
        return { trips: { ...s.trips, [tid]: { ...t, settlements: t.settlements.filter((x) => x.id !== sid) } } };
      }),
      addPerson: (tid, p) => set((s) => {
        const t = s.trips[tid];
        if (!t) return s;
        return { trips: { ...s.trips, [tid]: { ...t, people: [...t.people, p] } } };
      }),
      removePerson: (tid, pid) => set((state) => {
        const t = state.trips[tid];
        if (!t) return state;
        const used =
          t.expenses.some((e) => e.payers.some((p) => p.personId === pid)) ||
          t.expenses.some((e) =>
            e.split.type === 'equal'
              ? e.split.participantIds.includes(pid)
              : e.split.shares.some((sh) => sh.personId === pid),
          ) ||
          t.settlements.some((s) => s.from === pid || s.to === pid);
        if (used) return state;
        return { trips: { ...state.trips, [tid]: { ...t, people: t.people.filter((p) => p.id !== pid) } } };
      }),
      importTrip: (trip) => set((s) => ({
        trips: { ...s.trips, [trip.id]: trip },
        activeTripId: trip.id,
      })),
    }),
    {
      name: 'debtsettler',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        if (version === 0 || version === 1) return migrateV1toV2(persisted);
        return persisted as V2State;
      },
    }
  )
);
