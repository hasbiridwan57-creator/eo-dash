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

export interface Event {
  id: string;
  name: string;
  date: string;
  budgetCap: Rupiah;
  /** Persentase dana darurat dari BudgetCap (default 15). Dapat diatur pengguna. */
  contingencyPct?: number;
  tickets: Ticket[];
  vendors: Vendor[];
  expenses: Expense[];
  tasks: Task[];
  risks: RiskItem[];
  sponsors: Sponsor[]; // Sponsor management
  createdAt: string;
}
