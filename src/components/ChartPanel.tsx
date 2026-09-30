import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Trip } from '../engine/types';
import { totalsByCategory, computePerPerson } from '../engine/balance';
import { formatIDR } from '../engine/money';

const COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export default function ChartPanel({ trip }: { trip: Trip }) {
  const byCategory = useMemo(() => totalsByCategory(trip.expenses), [trip.expenses]);
  const perPerson = useMemo(() => computePerPerson(trip.people, trip.expenses, trip.settlements), [trip.people, trip.expenses, trip.settlements]);

  const pieData = byCategory.map(c => ({ name: c.category, value: c.total }));
  const barData = perPerson.map(p => ({
    name: trip.people.find(x => x.id === p.personId)?.name ?? p.personId,
    Dibayar: p.paid,
    Porsi: p.share,
  }));

  if (trip.expenses.length === 0) {
    return <p className="text-neutral-500 text-sm">Belum ada pengeluaran untuk ditampilkan.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="font-semibold mb-3">Pengeluaran per Kategori</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => `${d.name}`}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatIDR(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="font-semibold mb-3">Dibayar vs Porsi per Orang</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}rb`} />
            <Tooltip formatter={(v: number) => formatIDR(v)} />
            <Legend />
            <Bar dataKey="Dibayar" fill="#7c3aed" />
            <Bar dataKey="Porsi" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
