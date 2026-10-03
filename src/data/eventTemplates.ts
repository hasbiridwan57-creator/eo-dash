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
  rundown?: any[];
  committee?: any[];
}

export const EVENT_TEMPLATES: Record<EventType, EventTemplate> = {
  konser: {
    id: 'konser',
    name: 'Konser Musik / Live Show',
    badge: 'Entertainment',
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
    rundown: [
      { id: 'rd-k1', timeStart: '13:00', timeEnd: '15:30', activity: 'Soundcheck & Technical Rehearsal', pic: 'Stage Manager', location: 'Main Stage', cue: 'Check audio 32ch, monitor in-ear, lighting preset', status: 'Done' },
      { id: 'rd-k2', timeStart: '16:00', timeEnd: '18:30', activity: 'Gate Open & Crowd Inflow', pic: 'Ticketing & Security Lead', location: 'Gate Entrance', cue: 'Turnstile active, scanner barcode live', status: 'Standby' },
      { id: 'rd-k3', timeStart: '19:00', timeEnd: '19:45', activity: 'Opening Act Performance', pic: 'Show Director', location: 'Main Stage', cue: 'Warm lights, audio scene A', status: 'Upcoming' },
      { id: 'rd-k4', timeStart: '20:15', timeEnd: '22:30', activity: 'Headliner Live Show Concert', pic: 'Show Director', location: 'Main Stage', cue: 'Blackout -> Pyro & CO2 -> Video mapping intro', status: 'Upcoming' },
      { id: 'rd-k5', timeStart: '22:30', timeEnd: '23:45', activity: 'Crowd Dispersal & Rigging Load-out', pic: 'Production Head', location: 'All Area', cue: 'House light full on, safety siren standby', status: 'Upcoming' },
    ],
    committee: [
      { id: 'com-k1', role: 'Project Director', name: 'Hasbi Ridwan', division: 'Finance & Ticketing', phone: '0812-9988-7711' },
      { id: 'com-k2', role: 'Stage Manager', name: 'Rangga Dirgantara', division: 'Event / Show', phone: '0813-8822-4411' },
      { id: 'com-k3', role: 'Head of Sound & Rigging', name: 'Fajar Kurnia', division: 'Production & Sound', phone: '0811-3344-5566' },
      { id: 'com-k4', role: 'Chief Security Officer', name: 'Mayor Budi Utomo', division: 'Security & Perizinan', phone: '0819-7766-5544' },
    ],
  },

  wedding: {
    id: 'wedding',
    name: 'Pernikahan / Wedding Reception',
    badge: 'Wedding Ops',
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
    rundown: [
      { id: 'rd-w1', timeStart: '07:30', timeEnd: '08:30', activity: 'Persiapan Rias & Fitting Busana Pengantin', pic: 'MUA & Wardrobe Lead', location: 'Bridal Suite Room', cue: 'Keluarga inti standby, fotografer shoot candid', status: 'Done' },
      { id: 'rd-w2', timeStart: '08:30', timeEnd: '09:00', activity: 'Penyambutan Keluarga Pria & Kalungan Melati', pic: 'Koordinator Acara', location: 'Foyer Gedung', cue: 'Gending jawa pelan, pembawa baki siap', status: 'Upcoming' },
      { id: 'rd-w3', timeStart: '09:00', timeEnd: '10:00', activity: 'Akad Nikah & Ijab Qabul', pic: 'Penghulu & MC Akad', location: 'Meja Akad Nikah', cue: 'Mic meja on, saksi lengkap, dokumen nikah', status: 'Upcoming' },
      { id: 'rd-w4', timeStart: '10:00', timeEnd: '10:30', activity: 'Sungkeman Orang Tua & Foto Keluarga Inti', pic: 'Stage / Panggung Lead', location: 'Pelaminan', cue: 'Musik syahdu, tissue standby di samping kursi', status: 'Upcoming' },
      { id: 'rd-w5', timeStart: '11:00', timeEnd: '13:00', activity: 'Resepsi Ramah Tamah & Prasmanan', pic: 'Katering Lead & MC Resepsi', location: 'Ballroom', cue: 'Live acoustic band, gubukan makanan dibuka', status: 'Upcoming' },
    ],
    committee: [
      { id: 'com-w1', role: 'Wedding Organizer Lead', name: 'Nadia Safitri', division: 'Event / Show', phone: '0812-3344-9988' },
      { id: 'com-w2', role: 'Koordinator Katering & F&B', name: 'Dewi Anggraini', division: 'F&B & Hospitality', phone: '0813-7766-2211' },
      { id: 'com-w3', role: 'Koordinator Tamu VIP & Meja', name: 'Arief Wicaksono', division: 'Finance & Ticketing', phone: '0811-9900-1122' },
      { id: 'com-w4', role: 'Liaison Officer Keluarga Pengantin', name: 'Rina Kusuma', division: 'Event / Show', phone: '0818-4455-6677' },
    ],
  },

  corporate: {
    id: 'corporate',
    name: 'Corporate Event / Conference',
    badge: 'Corporate / B2B',
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
    rundown: [
      { id: 'rd-c1', timeStart: '08:00', timeEnd: '09:00', activity: 'Registrasi Peserta & Morning Coffee', pic: 'Registration Desk Lead', location: 'Grand Foyer', cue: 'Kiosk QR scan aktif, ID card cetak instan', status: 'Done' },
      { id: 'rd-c2', timeStart: '09:00', timeEnd: '09:30', activity: 'Opening Speech & Welcome Address', pic: 'Stage Manager & Host', location: 'Main Plenary Hall', cue: 'Video bumper intro, lighting spotlight center', status: 'Upcoming' },
      { id: 'rd-c3', timeStart: '09:30', timeEnd: '10:45', activity: 'Keynote Session: Future of AI in Enterprise', pic: 'Speaker LO & AV Lead', location: 'Main Plenary Hall', cue: 'Clicker slide siap, mic lavalier speaker ON', status: 'Upcoming' },
      { id: 'rd-c4', timeStart: '10:45', timeEnd: '12:00', activity: 'Panel Discussion & Live Q&A Slido', pic: 'Moderator Lead', location: 'Main Plenary Hall', cue: 'Tampilkan polling Slido di layar LED panggung', status: 'Upcoming' },
      { id: 'rd-c5', timeStart: '12:00', timeEnd: '13:30', activity: 'Networking Lunch & Expo Booth Tour', pic: 'F&B & Liaison Officer', location: 'Dining Hall & Expo Area', cue: 'Buffet line dibuka, musik ambient lembut', status: 'Upcoming' },
    ],
    committee: [
      { id: 'com-c1', role: 'Project Director', name: 'Ir. Hendra Gunawan', division: 'Event / Show', phone: '0811-2233-4455' },
      { id: 'com-c2', role: 'Technical Lead & AV Director', name: 'Bagus Prakoso', division: 'Production & Sound', phone: '0812-9988-7766' },
      { id: 'com-c3', role: 'Guest & Speaker Liaison Officer', name: 'Maya Paramitha', division: 'Event / Show', phone: '0817-6655-4433' },
      { id: 'com-c4', role: 'Security & Protocol Head', name: 'Mayor (Purn) Sudirman', division: 'Security & Perizinan', phone: '0813-1122-3344' },
    ],
  },

  festival: {
    id: 'festival',
    name: 'Festival / Bazar / Pameran UMKM',
    badge: 'Festival & Expo',
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
    rundown: [
      { id: 'rd-f1', timeStart: '09:00', timeEnd: '10:00', activity: 'Open Gate & Tenant Briefing Siap Jual', pic: 'Tenant Relations Lead', location: 'Expo Ground', cue: 'Gate dibuka pengunjung umum, genset tenant full-on', status: 'Done' },
      { id: 'rd-f2', timeStart: '10:00', timeEnd: '12:00', activity: 'Demo Masak & Workshop Kopi Lokal', pic: 'Stage Coordinator', location: 'Community Stage', cue: 'Mic chef siap, sound system area panggung kecil', status: 'Upcoming' },
      { id: 'rd-f3', timeStart: '15:00', timeEnd: '17:30', activity: 'Acoustic Sunset Performance', pic: 'Stage Manager', location: 'Main Open Stage', cue: 'Line check band akustik, ambient lighting sore', status: 'Upcoming' },
      { id: 'rd-f4', timeStart: '19:00', timeEnd: '21:30', activity: 'Puncak Konser Musik Indie & Pengundian Doorprize', pic: 'Show Director', location: 'Main Open Stage', cue: 'Lighting show dynamic, kembang api/cold pyro penutup', status: 'Upcoming' },
    ],
    committee: [
      { id: 'com-f1', role: 'Head of Festival Operation', name: 'Danang Wicaksono', division: 'Event / Show', phone: '0812-7788-9900' },
      { id: 'com-f2', role: 'Tenant & Bazaar Lead', name: 'Siti Rahmawati', division: 'Operations', phone: '0819-3322-1100' },
      { id: 'com-f3', role: 'Traffic & Crowd Controller', name: 'Ipda Riko Santoso', division: 'Security & Perizinan', phone: '0813-8877-6655' },
      { id: 'com-f4', role: 'Waste Management Supervisor', name: 'Ahmad Fauzi', division: 'Operations', phone: '0856-4433-2211' },
    ],
  },
};

export function getTemplate(templateId: EventType): EventTemplate {
  return EVENT_TEMPLATES[templateId];
}
