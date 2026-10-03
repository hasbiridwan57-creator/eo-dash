# PRD — EO-Dash: Event Ops Command Center

> **Status:** V2 shipped (client-side PWA) · **Target:** produk digital terjual di Lynk.id

## 1. Problem Statement

Event Organizer (EO) di Indonesia — terutama yang skala menengah (konser, festival, corporate event) — menjalankan keuangan event di **WhatsApp, Excel terpisah-pisah, dan ingatan**. Akibatnya:

- **Cost overrun** tidak terdeteksi sampai event selesai (likuidasi telat).
- **Vendor payables** (DP, rider, pelunasan) tercecer di banyak chat; EO sering lupa sisa pembayaran talent/sound.
- **Perizinan & legal** adalah *critical path* (izin keramaian, koordinasi polisi) — telat = event batal, tapi tidak ada yang nge-track deadlinenya.
- **Tidak ada Plan B** saat krisis (genset mati, hujan, talent drop) karena risk management tidak terdokumentasi.
- **Likuidasi pasca-event** memakan waktu berhari-hari karena data inflow/outflow tercerai-berai.

EO butuh **satu command center** yang mencakup money flow, vendor, legal, dan risk — bukan spreadsheet generik.

## 2. Target User

| Profil | Detail |
|---|---|
| **Primary** | EO skala menengah (event 100–5.000 peserta), tim 3–15 orang |
| **Sekunder** | Freelancer production, divisi keuangan event konser |
| **Pain utama** | Gagal likuidasi, vendor overdue, perizinan telat |
| **Willingness to pay** | Rp 49.000–149.000 sebagai produk download (Lynk.id) |

## 3. Product Vision

> *"Satu layar untuk lihat sehat tidaknya event lo — sebelum event jadi bencana."*

Bukan spreadsheet. Bukan dashboard generik. Ini **command center** cinematic yang langsung menunjukkan: profit real-time, berapa tiket lagi untuk BEP, vendor mana yang belum dibayar, dan izin mana yang sudah lewat deadline.

## 4. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Likuidasi event lebih cepat | Setup data < 10 menit |
| Cegah cost overrun | Budget burn-rate terlihat real-time |
| Vendor tidak overdue | % vendor lunas tepat waktu |
| Perizinan tidak telat | 0 task perizinan overdue |

## 5. Fitur V2 (Saat Ini)

### 5.1 Financial Command Center
- **Inflow tracker:** ticket sales per kategori (VIP/Reguler) × channel (Loket/Website/IG).
- **Outflow tracker:** vendor fee, DP, sisa pembayaran, plus expense operasional.
- **Net Profit & Margin** — terhitung otomatis setiap interaksi.
- **BEP Forecaster:** "lo butuh jual X tiket lagi di harga rata-rata biar balik modal."
- **Budget Burn-Rate:** progress bar dengan glow warning saat over-budget.
- **Contingency Reserve:** auto-hitung dana darurat 15% (standar industri EO).

### 5.2 Vendor Payables
- List vendor & talent dengan status DP → Lunas.
- Kategori: Sound, Talent Fee, Venue, Perizinan, Marketing, Rider & Transport.
- Tombol satu klik untuk lunaskan vendor.

### 5.3 Milestone & Checklist Engine
- Task per kategori: Perizinan, Vendor, Talent, Marketing, Logistik, Hari-H.
- Deadline tracking dengan label H-30 / H-7 / Hari-H.
- Toggle selesai/belum dengan strikethrough visual.

### 5.4 Risk Matrix & Plan B
- Daftar risiko dengan tingkat dampak (Tinggi/Sedang/Rendah).
- **Setiap risiko WAJIB punya Plan B** (mandatory field — ini yang membedakan EO pro).
- Risk tinggi di-highlight merah.

### 5.5 Persistence & PWA
- **localStorage** — semua perubahan tersimpan otomatis, aman saat refresh.
- **PWA** — bisa di-install di HP layaknya app native (manifest + service worker).

## 6. Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animasi | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| Persistence | localStorage (`eo_dash_v2`) |
| PWA | vite-plugin-pwa |

**Aturan kunci:** engine keuangan **integer-only Rupiah** (`src/engine/money.ts`) — dilarang float di state maupun perhitungan.

## 7. Domain Model

```
Event
├── name, date, venue, budgetCap
├── tickets[]      → category, qty, price, channel
├── vendors[]      → name, category, fee, paid, rider
├── expenses[]     → title, category, amount, date
├── tasks[]        → title, category, deadline, done
└── risks[]        → risk, impact, planB
```

## 8. UI/UX Principles

1. **Cinematic dark theme** — `#020617` base, glassmorphism `backdrop-blur`, ambient grid texture.
2. **Data breathable** — bukan tabel padat, tapi card yang punya ruang.
3. **Motion meaningful** — Framer Motion entry animation, bukan dekorasi.
4. **Danger glow** — rose untuk over-budget/overdue, emerald untuk sehat.
5. **Mobile-first** — karena EO kerja di lapangan pakai HP.

## 9. Roadmap V3

| Prioritas | Fitur | Kenapa |
|---|---|---|
| P1 | **Export Likuidasi (PDF/Excel)** | EO wajib kirim laporan ke klien — ini killer feature |
| P1 | **Rundown Timeline** | H-60 sampai Hari-H, critical path marking |
| P2 | **Sponsor & Donation Inflow** | Sumber dana lain selain tiket |
| P2 | **Multi-event switcher** | EO handle beberapa event paralel |
| P3 | **Dark/Light toggle** | Nice-to-have |
| P3 | **Backup/Restore JSON** | Anti kehilangan data |

## 10. Dihindari Sengaja

- ❌ **Login/autentikasi** — produk download, client-side murni.
- ❌ **Backend/server** — zero server cost, buyer jalan sendiri di localhost.
- ❌ **API key pembayaran asli** — dilarang ada di kode maupun `.env` contoh.
- ❌ **Float di money** — integer Rupiah only.
