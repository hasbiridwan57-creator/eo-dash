import { describe, it, expect } from 'vitest';
import { parseHash, toHash } from './routes';

describe('routes (R2)', () => {
  it('home: #/ dan #', () => {
    expect(parseHash('#/')).toEqual({ name: 'home' });
    expect(parseHash('#')).toEqual({ name: 'home' });
    expect(parseHash('')).toEqual({ name: 'home' });
    expect(toHash({ name: 'home' })).toBe('#/');
  });

  it('trip: #/t/abc -> expenses (default)', () => {
    expect(parseHash('#/t/abc')).toEqual({ name: 'trip', tripId: 'abc', tab: 'expenses' });
    expect(toHash({ name: 'trip', tripId: 'abc', tab: 'expenses' })).toBe('#/t/abc');
  });

  it('trip + tab: #/t/abc?tab=settle', () => {
    expect(parseHash('#/t/abc?tab=settle')).toEqual({ name: 'trip', tripId: 'abc', tab: 'settle' });
    expect(toHash({ name: 'trip', tripId: 'abc', tab: 'settle' })).toBe('#/t/abc?tab=settle');
  });

  it('tab tak dikenal -> expenses', () => {
    expect(parseHash('#/t/abc?tab=ngasal')).toEqual({ name: 'trip', tripId: 'abc', tab: 'expenses' });
    expect(parseHash('#/t/abc?tab=')).toEqual({ name: 'trip', tripId: 'abc', tab: 'expenses' });
  });

  it('trailing slash ditoleransi', () => {
    expect(parseHash('#/t/abc/')).toEqual({ name: 'trip', tripId: 'abc', tab: 'expenses' });
    expect(parseHash('#/')).toEqual({ name: 'home' });
  });

  it('share: #/s/<base64url>', () => {
    const data = 'eJwrVUotLs0tKShKLS7JzE1V0lFQSlcKihLz8otTi1KLM0tS03JzSvJLErOyzfRNM4tSizJzEsHAFw2BgA';
    expect(parseHash(`#/s/${data}`)).toEqual({ name: 'share', data });
    expect(toHash({ name: 'share', data })).toBe(`#/s/${data}`);
  });

  it('share: base64url dengan - dan _ diterima', () => {
    const data = 'VHlwZV9iYXNlNjR1cmwtYW5kLWRhc2g';
    expect(parseHash(`#/s/${data}`).name).toBe('share');
  });

  it('hash rusak -> home', () => {
    expect(parseHash('#/x/y/z')).toEqual({ name: 'home' });
    expect(parseHash('#/t')).toEqual({ name: 'home' });
    expect(parseHash('#/s')).toEqual({ name: 'home' });
    expect(parseHash('#/t/')).toEqual({ name: 'home' });
  });

  it('round-trip parseHash(toHash(r)) === r', () => {
    const cases = [
      { name: 'home' },
      { name: 'trip' as const, tripId: 'trip-123', tab: 'balance' as const },
      { name: 'trip' as const, tripId: 'trip-123', tab: 'settle' as const },
    ];
    for (const r of cases) {
      expect(parseHash(toHash(r))).toEqual(r);
    }
  });
});
