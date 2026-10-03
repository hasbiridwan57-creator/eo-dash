// Barrel export — pintu tunggal engine EO-Dash.
// Aturan keras: semua aritmetika uang lewat money.ts.

export type { Rupiah, Bp } from './money';
export type {
  Event,
  Ticket,
  Vendor,
  Expense,
  Task,
  RiskItem,
} from './types';

export {
  assertRp,
  isRp,
  sum,
  mulDivFloor,
  mulDivCeil,
  formatRp,
  parseRp,
  percentToBp,
  formatBp,
  MAX_MONEY,
} from './money';

export {
  ticketRevenue,
  totalTickets,
  totalVendorFees,
  totalVendorPaid,
  totalExpenses,
} from './domain';

export {
  totalInflow,
  totalOutflow,
  netProfit,
  marginBp,
  averageTicketPrice,
  ticketsToBreakEven,
  contingencyReserve,
  budgetStatus,
} from './calc';
