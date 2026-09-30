/* Sample trip tetap (S9) — id konstan supaya bisa dites eksak. */

import type { Trip } from './engine/types';

export const SAMPLE_TRIP_ID = 't-malang-2026';

export function sampleTrip(): Trip {
  return {
    id: SAMPLE_TRIP_ID,
    name: 'Liburan Malang 2026',
    people: [
      { id: 'p-ani', name: 'Ani' },
      { id: 'p-budi', name: 'Budi' },
      { id: 'p-citra', name: 'Citra' },
      { id: 'p-dedi', name: 'Dedi' },
    ],
    expenses: [
      {
        id: 'e-1',
        title: 'Tiket masuk',
        category: 'Tiket',
        amount: 100000,
        payers: [{ personId: 'p-budi', amount: 100000 }],
        split: { type: 'equal', participantIds: ['p-ani', 'p-budi', 'p-citra', 'p-dedi'] },
        createdAt: '2026-09-30T08:00:00.000Z',
      },
      {
        id: 'e-2',
        title: 'Bensin',
        category: 'Transport',
        amount: 100000,
        payers: [{ personId: 'p-ani', amount: 100000 }],
        split: { type: 'equal', participantIds: ['p-ani', 'p-budi', 'p-citra'] },
        createdAt: '2026-09-30T09:00:00.000Z',
      },
      {
        id: 'e-3',
        title: 'Penginapan',
        category: 'Penginapan',
        amount: 400000,
        payers: [
          { personId: 'p-citra', amount: 250000 },
          { personId: 'p-dedi', amount: 150000 },
        ],
        split: {
          type: 'percentage',
          shares: [
            { personId: 'p-ani', bp: 4000 },
            { personId: 'p-budi', bp: 3000 },
            { personId: 'p-citra', bp: 2000 },
            { personId: 'p-dedi', bp: 1000 },
          ],
        },
        createdAt: '2026-09-30T10:00:00.000Z',
      },
      {
        id: 'e-4',
        title: 'Oleh-oleh',
        category: 'Belanja',
        amount: 90000,
        payers: [{ personId: 'p-dedi', amount: 90000 }],
        split: {
          type: 'custom',
          shares: [
            { personId: 'p-ani', amount: 10000 },
            { personId: 'p-budi', amount: 30000 },
            { personId: 'p-citra', amount: 50000 },
          ],
        },
        createdAt: '2026-09-30T11:00:00.000Z',
      },
    ],
    settlements: [],
  };
}
