
export type Money = number;

export type Person = { id: string; name: string };

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: Money;
  payers: { personId: string; amount: Money }[];
  split:
    | { type: 'equal'; participantIds: string[] }
    | { type: 'percentage'; shares: { personId: string; bp: number }[] }
    | { type: 'custom'; shares: { personId: string; amount: Money }[] };
  createdAt: string;
  updatedAt?: string;
};

export type Settlement = { id: string; from: string; to: string; amount: Money; paidAt: string };

export type Trip = {
  id: string;
  name: string;
  people: Person[];
  expenses: Expense[];
  settlements: Settlement[];
};
