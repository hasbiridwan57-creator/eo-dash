import { z } from 'zod';

const moneySchema = z.number().int().positive();

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(30),
});

const splitSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('equal'), participantIds: z.array(z.string().min(1)).min(1) }),
  z.object({
    type: z.literal('percentage'),
    shares: z.array(z.object({ personId: z.string().min(1), bp: z.number().int().min(0).max(10000) })).min(1),
  }),
  z.object({
    type: z.literal('custom'),
    shares: z.array(z.object({ personId: z.string().min(1), amount: moneySchema })).min(1),
  }),
]);

const expenseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(80),
  category: z.string().min(1),
  amount: moneySchema,
  payers: z.array(z.object({ personId: z.string().min(1), amount: moneySchema })).min(1),
  split: splitSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1).optional(),
});

const settlementSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  amount: moneySchema,
  paidAt: z.string().min(1),
});

/** Invariant lintas-field (AGENTS.md §3): dijalankan untuk trip tunggal maupun file export. */
function refineTrip(
  t: { people: { id: string; name: string }[]; expenses: z.infer<typeof expenseSchema>[]; settlements: z.infer<typeof settlementSchema>[] },
  ctx: z.RefinementCtx,
) {
  const ids = new Set(t.people.map(p => p.id));
  if (ids.size !== t.people.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ID peserta duplikat' });
  }
  const lows = new Set(t.people.map(p => p.name.toLowerCase()));
  if (lows.size !== t.people.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nama peserta duplikat' });
  }
  for (const e of t.expenses) {
    const paid = e.payers.reduce((a, p) => a + p.amount, 0);
    if (paid !== e.amount) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Total pembayar ${paid} harus sama dengan jumlah ${e.amount}` });
    }
    if (e.split.type === 'percentage') {
      const total = e.split.shares.reduce((a, s) => a + s.bp, 0);
      if (total !== 10000) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Total persentase harus 10000 bp (sekarang ${total})` });
      }
    }
    if (e.split.type === 'custom') {
      const total = e.split.shares.reduce((a, s) => a + s.amount, 0);
      if (total !== e.amount) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Total custom ${total} harus sama dengan jumlah ${e.amount}` });
      }
    }
    for (const p of e.payers) {
      if (!ids.has(p.personId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `personId ${p.personId} tidak terdaftar di people` });
      }
    }
    const sids = e.split.type === 'equal' ? e.split.participantIds : e.split.shares.map(s => s.personId);
    for (const sid of sids) {
      if (!ids.has(sid)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `personId ${sid} tidak terdaftar di people` });
      }
    }
  }
  for (const s of t.settlements) {
    if (!ids.has(s.from) || !ids.has(s.to)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'personId settlement tidak terdaftar di people' });
    }
  }
}

const tripBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  people: z.array(personSchema).min(2),
  expenses: z.array(expenseSchema),
  settlements: z.array(settlementSchema),
});

export const tripSchema = tripBaseSchema.superRefine(refineTrip);

export const tripExportSchema = z
  .object({
    version: z.literal(2),
    id: z.string().min(1),
    name: z.string().min(1).max(80),
    people: z.array(personSchema).min(2),
    expenses: z.array(expenseSchema),
    settlements: z.array(settlementSchema),
  })
  .superRefine(refineTrip);

export type TripExport = z.infer<typeof tripExportSchema>;
export const EXPORT_VERSION = 2;
