import { describe, it, expect } from 'vitest';
import { encodeTrip, decodeTrip } from './share';
import { sampleTrip } from '../sample';

describe('share (S13)', () => {
  it('round-trip encode -> decode identik', async () => {
    const trip = sampleTrip();
    const encoded = await encodeTrip(trip);
    const decoded = await decodeTrip(encoded);
    expect(decoded).toEqual(trip);
  });

  it('string acak ditolak', async () => {
    await expect(decodeTrip('invalid-base64')).rejects.toThrow();
  });
});
