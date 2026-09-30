import { tripExportSchema } from '../schema/schema';
import type { Trip } from './types';

export async function encodeTrip(trip: Trip): Promise<string> {
  const data = JSON.stringify({ version: 2, ...trip });
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const buf = await new Response(stream).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export async function decodeTrip(base64: string): Promise<Trip> {
  const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const data = await new Response(stream).text();
  const raw = JSON.parse(data);
  const r = tripExportSchema.safeParse(raw);
  if (!r.success) throw new Error('Link rusak atau data tidak valid');
  const { version: _v, ...trip } = r.data;
  return trip;
}
