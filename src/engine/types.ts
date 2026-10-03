import type { Rupiah } from './money';
export type { Rupiah, Bp } from './money';

export type Ticket = {
  id: string;
  category: string;
  qty: number;
  price: Rupiah;
  channel: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  fee: Rupiah;
  paid: Rupiah;
  rider?: string;
  contact?: string;
  bankName?: string;
  accountNumber?: string;
  riderNotes?: string;
};

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: Rupiah;
  date: string;
};

export type Task = {
  id: string;
  title: string;
  category: 'Perizinan' | 'Vendor' | 'Talent' | 'Marketing' | 'Logistik' | 'Hari-H';
  deadline: string;
  done: boolean;
};

export type RiskItem = {
  id: string;
  risk: string;
  impact: 'Tinggi' | 'Sedang' | 'Rendah';
  planB: string;
};

export type Sponsor = {
  id: string;
  name: string;
  amount: Rupiah;
  status: 'Komitmen' | 'Aktif' | 'Terbayar';
  deliverable?: string; // Logo exposure, booth activity, stage mention
};

export type RundownItem = {
  id: string;
  timeStart: string; // e.g. "18:00"
  timeEnd: string;   // e.g. "19:00"
  activity: string;
  location: string; // e.g. "Main Stage", "Gate 1", "Backstage"
  pic: string;      // e.g. "Hasbi (Stage Mgr)"
  cue?: string;     // e.g. "Blackout, Audio intro tape, Smoke machine"
  status: 'Upcoming' | 'Standby' | 'Live' | 'Done';
};

export type CommitteeMember = {
  id: string;
  name: string;
  role: string;
  division: 'Event / Show' | 'Finance & Ticketing' | 'Production & Sound' | 'Security & Perizinan' | 'F&B & Hospitality' | 'Marketing';
  phone: string;
};

export interface Event {
  id: string;
  name: string;
  date: string;
  venue?: string; // Venue name and location
  budgetCap: Rupiah;
  contingencyPct?: number;
  tickets: Ticket[];
  vendors: Vendor[];
  expenses: Expense[];
  tasks: Task[];
  risks: RiskItem[];
  sponsors: Sponsor[];
  createdAt: string;
  rundown?: RundownItem[];
  committee?: CommitteeMember[];
}
