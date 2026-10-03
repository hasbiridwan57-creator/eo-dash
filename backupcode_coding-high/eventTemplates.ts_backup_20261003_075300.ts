/**
 * data/eventTemplates.ts — Templates spesifik & presisi per jenis Event Organizer.
 * Disusun berdasarkan riset workflow EO riil:
 * - Konser: Tiket komersial, Talent Rider, Sound/Stage, Sponsor
 * - Wedding: Anggaran Pribadi/Keluarga, Katering per porsi, Dekorasi, MUA, RSVP Tamu
 * - Corporate: Alokasi Budget Kantor, Speaker/Keynote, AV/Multimedia, Venue Hotel
 * - Festival: Tiket Masuk, Sewa Booth UMKM/Tenant, Sponsor, Zonasi Area
 */

export type EventType = 'konser' | 'wedding' | 'corporate' | 'festival';

export interface EventTemplate {
  id: EventType;
  name: string;
  badge: string;
  description: string;
  defaultBudgetCap: number;
  tickets: any[];
  vendors: any[];
  tasks: any[];
  risks: any[];
  sponsors?: any[];
}

export const EVENT_TEMPLATES: Record<EventType, EventTemplate> = {
  konser: {
    id: 'konser',
    name: 'Konser Musik / Live Show',
    badge: '🎵 Entertainment',
    description: 'Event komersial berbasis tiket berbayar, talent booking, dan panggung pertunjukan.',
    defaultBudgetCap: 500_000_000,
    tickets: [
      { id: 't1', category: 'VIP (Front Row)', qty: 100, price: 1_500_000, channel: 'Website Resmi' },
      { id: 't2', category: 'Festival Standing', qty: 1500, price: 350_000, channel: 'Platform Tiket' },
      { id: 't3', category: 'Early Bird Regular', qty: 500, price: 250_000, channel: 'Platform Tiket' },
    ],
    vendors: [
      { id: 'v1', name: 'Talent / Headliner Band', category: 'Talent Fee', fee: 200_000_000, paid: 100_000_000 },
      { id: 'v2', name: 'Sound System 100K Watt', category: 'Production', fee: 120_000_000, paid: 60_000_000 },
      { id: 'v3', name: 'Lighting & Rigging Stage', category: 'Production', fee: 65_000_000, paid: 0 },
      { id: 'v4', name: 'Crowd Control & Security Barricade', category: 'Operations', fee: 25_000_000, paid: 12_500_000 },
    ],
    tasks: [
      { id: 'ts-1', title: 'Izin Keramaian Polda & Mabes', category: 'Perizinan', deadline: '2026-11-15', done: true },
      { id: 'ts-2', title: 'Technical Rider Artis Disetujui', category: 'Talent', deadline: '2026-11-25', done: false },
      { id: 'ts-3', title: 'Soundcheck & Lighting Rehearsal H-1', category: 'Hari-H', deadline: '2026-12-14', done: false },
      { id: 'ts-4', title: 'Standby Tenaga Medis & Ambulance', category: 'Logistik', deadline: '2026-12-15', done: false },
    ],
    risks: [
      { id: 'r-1', risk: 'Artis batal hadir/sakit mendadak', impact: 'Tinggi', planB: 'Klausul penggantian jadwal & asuransi non-performance' },
      { id: 'r-2', risk: 'Genset utama trip saat show', impact: 'Tinggi', planB: 'Sediakan genset cadangan auto-sync standby' },
      { id: 'r-3', risk: 'Penonton membludak di gate utama', impact: 'Sedang', planB: 'Tambah 4 antrean barcode scanner darurat' },
    ],
    sponsors: [
      { id: 'sp-1', name: 'Minuman Isotonik Brand', amount: 50_000_000, status: 'Terbayar', deliverable: 'Logo backdrop & exclusive beverage booth' },
    ],
  },

  wedding: {
    id: 'wedding',
    name: 'Pernikahan / Wedding Reception',
    badge: '💍 Wedding Ops',
    description: 'Acara keluarga/sakral berbasis undangan RSVP, katering per porsi, dekorasi adat, dan tata busana.',
    defaultBudgetCap: 250_000_000,
    // Wedding TIDAK jual tiket per orang, tapi target tamu/rsvp utk katering
    tickets: [
      { id: 't1', category: 'Keluarga Inti & VIP (Meja Khusus)', qty: 50, price: 0, channel: 'Undangan Khusus' },
      { id: 't2', category: 'Tamu Reguler Sesi 1 (Akad & Siang)', qty: 400, price: 0, channel: 'Undangan Digital' },
      { id: 't3', category: 'Tamu Reguler Sesi 2 (Malam)', qty: 350, price: 0, channel: 'Undangan Digital' },
    ],
    vendors: [
      { id: 'v1', name: 'Gedung / Ballroom Hotel', category: 'Venue', fee: 75_000_000, paid: 37_500_000 },
      { id: 'v2', name: 'Katering 800 Porsi + 5 Gubukan', category: 'F&B', fee: 85_000_000, paid: 40_000_000 },
      { id: 'v3', name: 'Dekorasi Pelaminan & Ruang Adat', category: 'Decoration', fee: 35_000_000, paid: 15_000_000 },
      { id: 'v4', name: 'MUA, Busana Pengantin & Orang Tua', category: 'Wardrobe', fee: 20_000_000, paid: 10_000_000 },
      { id: 'v5', name: 'Foto, Video Cinematic & Live Streaming', category: 'Documentation', fee: 18_000_000, paid: 9_000_000 },
      { id: 'v6', name: 'MC Adat & Acoustic Band', category: 'Entertainment', fee: 12_000_000, paid: 0 },
    ],
    tasks: [
      { id: 'ts-1', title: 'Pendaftaran KUA & Legalisasi Surat Nikah', category: 'Perizinan', deadline: '2026-10-15', done: true },
      { id: 'ts-2', title: 'Food Tasting Katering (Keluarga Besar)', category: 'Vendor', deadline: '2026-11-01', done: true },
      { id: 'ts-3', title: 'Fitting Busana Terakhir Pengantin', category: 'Vendor', deadline: '2026-11-20', done: false },
      { id: 'ts-4', title: 'Gladi Resik Kirab & Rundown Acara', category: 'Hari-H', deadline: '2026-12-05', done: false },
    ],
    risks: [
      { id: 'r-1', risk: 'Makanan katering habis sebelum waktu resepsi selesai', impact: 'Tinggi', planB: 'Buffer porsi katering 15% + kontrak gubukan cepat saji tambahan' },
      { id: 'r-2', risk: 'Penghulu KUA terlambat hadir saat akad', impact: 'Tinggi', planB: 'Penjemputan khusus tim panitia 1 jam sebelum jadwal' },
      { id: 'r-3', risk: 'Hujan deras (area outdoor/semi-outdoor)', impact: 'Sedang', planB: 'Pasang tenda roder transparan & penambahan blower ac' },
    ],
    sponsors: [],
  },

  corporate: {
    id: 'corporate',
    name: 'Corporate Event / Conference',
    badge: '🏢 Corporate / B2B',
    description: 'Seminar, product launch, atau rapat umum pemegang saham dengan anggaran perusahaan.',
    defaultBudgetCap: 350_000_000,
    tickets: [
      { id: 't1', category: 'C-Level / VIP Speakers', qty: 30, price: 0, channel: 'Direct Invitation' },
      { id: 't2', category: 'Delegates Perusahaan (Registered)', qty: 250, price: 0, channel: 'Internal Registration' },
      { id: 't3', category: 'Media & Press Conference', qty: 40, price: 0, channel: 'PR Agency' },
    ],
    vendors: [
      { id: 'v1', name: 'Grand Ballroom Convention Center', category: 'Venue', fee: 120_000_000, paid: 60_000_000 },
      { id: 'v2', name: 'LED Video Wall & Live Production AV', category: 'Production', fee: 85_000_000, paid: 42_500_000 },
      { id: 'v3', name: 'Executive Lunch Buffet & Coffee Break', category: 'F&B', fee: 55_000_000, paid: 0 },
      { id: 'v4', name: 'Keynote Speaker Honorarium', category: 'Talent Fee', fee: 40_000_000, paid: 20_000_000 },
      { id: 'v5', name: 'Seminar Kit, ID Badge & Lanyard', category: 'Merchandise', fee: 15_000_000, paid: 15_000_000 },
    ],
    tasks: [
      { id: 'ts-1', title: 'Persetujuan Budget Direksi & Legal', category: 'Perizinan', deadline: '2026-10-01', done: true },
      { id: 'ts-2', title: 'Konfirmasi Jadwal Keynote Speaker Utama', category: 'Talent', deadline: '2026-10-20', done: true },
      { id: 'ts-3', title: 'Uji Koneksi Internet Dedicated 1Gbps untuk Stream', category: 'Logistik', deadline: '2026-11-10', done: false },
      { id: 'ts-4', title: 'Dry Run Presentasi & Rehearsal MC', category: 'Hari-H', deadline: '2026-11-20', done: false },
    ],
    risks: [
      { id: 'r-1', risk: 'Jaringan internet down saat live stream', impact: 'Tinggi', planB: 'Sediakan modem backup multi-operator (failover bonding)' },
      { id: 'r-2', risk: 'Speaker utama berhalangan hadir', impact: 'Tinggi', planB: 'Siapkan sesi virtual via zoom pro studio atau pembicara pengganti' },
      { id: 'r-3', risk: 'Antrean registrasi ID Badge menumpuk', impact: 'Rendah', planB: 'Gunakan 6 terminal self-checkin QR Code' },
    ],
    sponsors: [
      { id: 'sp-1', name: 'Tech Partner (Cloud Provider)', amount: 75_000_000, status: 'Terbayar', deliverable: 'Keynote slot 15 menit & Booth di lobby' },
    ],
  },

  festival: {
    id: 'festival',
    name: 'Festival / Bazar / Pameran UMKM',
    badge: '🎪 Festival & Expo',
    description: 'Acara multi-tenant berbasis tiket masuk, sewa booth makanan/kerajinan, dan sponsor komersial.',
    defaultBudgetCap: 600_000_000,
    tickets: [
      { id: 't1', category: 'Tiket Masuk Early Bird (3 Hari)', qty: 2000, price: 75_000, channel: 'Online Pre-sale' },
      { id: 't2', category: 'Tiket Harian On The Spot', qty: 8000, price: 35_000, channel: 'Loket OTS' },
      { id: 't3', category: 'Sewa Booth Kuliner (Ukuran 3x3m)', qty: 40, price: 4_500_000, channel: 'Registrasi Tenant' },
    ],
    vendors: [
      { id: 'v1', name: 'Sewa Lapangan Parkir & Area Terbuka', category: 'Venue', fee: 150_000_000, paid: 75_000_000 },
      { id: 'v2', name: 'Instalasi Tenda Sarnafil 50 Unit + Listrik', category: 'Production', fee: 110_000_000, paid: 55_000_000 },
      { id: 'v3', name: 'Pengelolaan Sampah & Tim Kebersihan 24 Jam', category: 'Operations', fee: 35_000_000, paid: 0 },
      { id: 'v4', name: 'Pengamanan, Dishub & Manajemen Parkir', category: 'Operations', fee: 40_000_000, paid: 20_000_000 },
      { id: 'v5', name: 'Mini Stage Hiburan Akustik & Sound', category: 'Entertainment', fee: 30_000_000, paid: 0 },
    ],
    tasks: [
      { id: 'ts-1', title: 'Izin Lokasi Dishub & Rekayasa Lalu Lintas', category: 'Perizinan', deadline: '2026-10-10', done: true },
      { id: 'ts-2', title: 'Kurasi & Kontrak Tenant Kuliner UMKM', category: 'Vendor', deadline: '2026-11-05', done: true },
      { id: 'ts-3', title: 'Layouting Penomoran Booth & Titik Hydrant', category: 'Logistik', deadline: '2026-11-25', done: false },
      { id: 'ts-4', title: 'Pemasangan Tenda & Instalasi Daya Listrik', category: 'Hari-H', deadline: '2026-12-01', done: false },
    ],
    risks: [
      { id: 'r-1', risk: 'Macet parah mengular ke jalan protokol', impact: 'Tinggi', planB: 'Buka kantong parkir tambahan di mall sekitar + jemputan shuttle bus' },
      { id: 'r-2', risk: 'Instalasi listrik tenant meledak/overload', impact: 'Tinggi', planB: 'Sediakan panel circuit breaker mandiri tiap 5 booth + APAR di tiap gang' },
      { id: 'r-3', risk: 'Sampah menumpuk berbau di area kuliner', impact: 'Sedang', planB: 'Patroli truk sampah keliling tiap 3 jam sekali' },
    ],
    sponsors: [
      { id: 'sp-1', name: 'Aplikasi Pembayaran QRIS', amount: 80_000_000, status: 'Terbayar', deliverable: 'Exclusive cashless payment partner di semua booth' },
    ],
  },
};

export function getTemplate(templateId: EventType): EventTemplate {
  return EVENT_TEMPLATES[templateId];
}
