import type { Transfer } from './settle';
import { formatIDR } from './money';

export function settlementText(
  tripName: string,
  transfers: Transfer[],
  nameOf: (id: string) => string
): string {
  if (transfers.length === 0) {
    return `*Settlement: ${tripName}*\nSemua sudah lunas.\n\nDihitung dengan DebtSettler`;
  }
  const lines = transfers.map(
    t => `${nameOf(t.from)} → ${nameOf(t.to)}: ${formatIDR(t.amount)}`
  );
  return `*Settlement: ${tripName}*\n${lines.join('\n')}\n\nDihitung dengan DebtSettler`;
}
