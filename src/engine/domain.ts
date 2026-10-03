import type { Event, Ticket, Vendor, Expense, Task, RiskItem } from './types';
import { sum } from './money';

export function ticketRevenue(tickets: readonly Ticket[]): number {
  return sum(tickets.map(t => t.qty * t.price));
}

export function totalVendorFees(vendors: readonly Vendor[]): number {
  return sum(vendors.map(v => v.fee));
}

export function totalVendorPaid(vendors: readonly Vendor[]): number {
  return sum(vendors.map(v => v.paid));
}

export function totalExpenses(expenses: readonly Expense[]): number {
  return sum(expenses.map(e => e.amount));
}

export function totalTickets(tickets: readonly Ticket[]): number {
  return tickets.reduce((a, t) => a + t.qty, 0);
}

export function revenueByCategory(tickets: readonly Ticket[]) {
  const map = new Map<string, { qty: number; revenue: number }>();
  for (const t of tickets) {
    const cur = map.get(t.category) ?? { qty: 0, revenue: 0 };
    cur.qty += t.qty;
    cur.revenue += t.qty * t.price;
    map.set(t.category, cur);
  }
  return [...map.entries()]
    .map(([category, v]) => ({ category, qty: v.qty, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function revenueByChannel(tickets: readonly Ticket[]) {
  const map = new Map<string, { qty: number; revenue: number }>();
  for (const t of tickets) {
    const cur = map.get(t.channel) ?? { qty: 0, revenue: 0 };
    cur.qty += t.qty;
    cur.revenue += t.qty * t.price;
    map.set(t.channel, cur);
  }
  return [...map.entries()]
    .map(([channel, v]) => ({ channel, qty: v.qty, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Vendor belum lunas. */
export function unpaidVendors(vendors: readonly Vendor[]) {
  return vendors.filter(v => v.fee - v.paid > 0);
}

export function vendorOutstanding(vendors: readonly Vendor[]) {
  return vendors.map(v => {
    const outstanding = Math.max(0, v.fee - v.paid);
    const pctPaid = v.fee > 0 ? Math.round((v.paid / v.fee) * 100) : 100;
    return { name: v.name, outstanding, pctPaid };
  });
}

export function totalSponsors(sponsors: readonly any[]): number {
  return sum(sponsors.map(s => s.amount));
}
