import { ticketRevenue, totalTickets, totalVendorFees, totalExpenses } from './domain';
import { mulDivFloor, mulDivCeil, sum } from './money';
import type { Event, Rupiah, Bp } from './types';

export function totalInflow(ev: Event): Rupiah {
  const ticketRev = ticketRevenue(ev.tickets);
  const sponsorRev = sum((ev.sponsors || []).filter(s => s.status === 'Terbayar').map(s => s.amount));
  return ticketRev + sponsorRev;
}

export function totalOutflow(ev: Event): Rupiah {
  const vFee = totalVendorFees(ev.vendors);
  const exp = totalExpenses(ev.expenses);
  return sum([vFee, exp]);
}

export function netProfit(ev: Event): Rupiah {
  return totalInflow(ev) - totalOutflow(ev);
}

export function marginBp(ev: Event): Bp | null {
  const inflow = totalInflow(ev);
  if (inflow === 0) return null;
  return mulDivFloor(netProfit(ev), 10000, inflow);
}

export function averageTicketPrice(ev: Event): Rupiah | null {
  const qty = totalTickets(ev.tickets);
  if (qty === 0) return null;
  return mulDivFloor(ticketRevenue(ev.tickets), 1, qty);
}

export function ticketsToBreakEven(ev: Event): number | null {
  const price = averageTicketPrice(ev);
  if (price === null || price <= 0) return null;
  const target = Math.max(0, totalOutflow(ev) - totalInflow(ev));
  if (target === 0) return 0;
  return mulDivCeil(target, 1, price);
}

export function contingencyReserve(ev: Event, bp = 1500): Rupiah {
  return mulDivFloor(ev.budgetCap, bp, 10000);
}

export interface BudgetStatus {
  used: Rupiah;
  cap: Rupiah;
  burnBp: Bp | null;
  pct: number | null;
  over: boolean;
}

export function budgetStatus(ev: Event): BudgetStatus {
  const used = totalOutflow(ev);
  if (ev.budgetCap === 0) {
    return { used, cap: 0, burnBp: null, pct: null, over: false };
  }
  const burnBp = mulDivFloor(used, 10000, ev.budgetCap);
  return {
    used,
    cap: ev.budgetCap,
    burnBp,
    pct: mulDivFloor(used, 100, ev.budgetCap),
    over: used > ev.budgetCap,
  };
}
