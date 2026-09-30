export type TabName = 'expenses' | 'balance' | 'settle' | 'history' | 'charts' | 'data';

export type Route =
  | { name: 'home' }
  | { name: 'trip'; tripId: string; tab: TabName }
  | { name: 'share'; data: string };

const TABS: readonly TabName[] = ['expenses', 'balance', 'settle', 'history', 'charts', 'data'];

export function parseHash(hash: string): Route {
  // Hapus leading '#'. Toleransi trailing slash.
  const clean = hash.replace(/^#/, '').replace(/\/$/, '');
  if (!clean) return { name: 'home' };

  // Pisahkan path dan query string (?tab=...) sebelum split '/'
  const [pathPart, query = ''] = clean.split('?');
  const parts = pathPart.split('/');
  // parts[0] === '' (karena path mulai dengan '/')
  if (parts[0] !== '') return { name: 'home' };
  const kind = parts[1];

  if (kind === 't') {
    const tripId = parts[2];
    if (!tripId) return { name: 'home' };

    let tab: TabName | null = null;
    if (query.startsWith('tab=')) {
      const raw = query.slice(4);
      tab = TABS.some(t => t === raw) ? (raw as TabName) : null;
    }
    // fallback: segment setelah tripId tanpa query
    if (!tab && parts[3]) {
      const raw = parts[3];
      tab = TABS.some(t => t === raw) ? (raw as TabName) : null;
    }
    return { name: 'trip', tripId, tab: tab ?? 'expenses' };
  }

  if (kind === 's') {
    const data = parts.slice(2).join('/');
    if (!data) return { name: 'home' };
    // base64url: A-Za-z0-9-_=
    if (!/^[A-Za-z0-9_\-=]+$/.test(data)) return { name: 'home' };
    return { name: 'share', data };
  }

  return { name: 'home' };
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'trip': {
      const tab = route.tab === 'expenses' ? '' : `?tab=${route.tab}`;
      return `#/t/${encodeURIComponent(route.tripId)}${tab}`;
    }
    case 'share':
      return `#/s/${route.data}`;
  }
}

export { TABS as VALID_TABS };
