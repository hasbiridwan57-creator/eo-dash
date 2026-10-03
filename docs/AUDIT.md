# Audit Repo V2 — M0 (Lampiran C)

Tanggal: 2026-10-02
Audiens: PRD EO-Dash V3 (Lampiran A–F)
Repo: `/Users/hasbi/eo-dash`

## 1. Sudah sesuai PRD (dipertahankan)

| Bagian | Bukti |
|---|---|
| Stack identik PRD | Vite + React 19 + TS + Tailwind v4 + Framer Motion + Recharts + lucide-react + vite-plugin-pwa (cek `package.json`) |
| Client-side murni, tanpa backend/login | Tidak ada import fetch/http bersifat server; state di `localStorage` key `eo_dash_v2` (`src/App.tsx`) |
| Integer Rupiah di engine | `src/engine/money.ts` punya `assertIntegerMoney`; engine lain operasi bilangan bulat murni |
| F1 Financial Command Center | `event.ts`: `totalInflow`, `totalOutflow`, `netProfit`, `profitMargin`, `ticketsToBreakEven`, `budgetStatus`. Dashboard render 4 stat + burn-rate bar |
| F2 Vendor Payables | `vendors.ts`: status DP/Lunas/Belum, `markVendorPaid` satu klik. UI punya tombol `Lunaskan` |
| F4 Checklist | `checklist.ts` + tab ops UI, toggle done |
| F5 Risk Matrix wajib Plan B | `risk.ts` `validateRisk` menolak `planB` kosong; UI modal required |
| Token desain | Dasar `#020617`, glassmorphism, rose untuk danger, emerald sehat, mobile-first |
| PWA | `vite.config.ts` punya vite-plugin-pwa; build menghasilkan `sw.js` + manifest |

## 2. Ada, tapi menyimpang dari PRD

**Divergensi kalkulasi (terverifikasi numerik vs Lampiran D):**

| # | Rumus | PRD (bagian 9 / Lampiran D) | V2 saat ini | Bukti |
|---|---|---|---|---|
| D1 | Dana darurat | `BudgetCap × 1500 / 10000` → **37.500.000** (Case 1) | `totalOutflow × 15%` → 34.500.000 | `event.ts: contingencyReserve` |
| D2 | Harga rata-rata | **floor** → 323.275 (Case 1) | `Math.round` → 323.276 | `tickets.ts: averageTicketPrice` & `event.ts: averagePrice` |
| D3 | Margin | basis point **floor** → 1822 bp (18,22%) | persen `Math.round` → 18 | `event.ts: profitMargin` |
| D4 | Floor negatif | floor ke minus tak hingga → **-3334 bp** | `Math.round(-1/3)` → **-33%** (salah arah) | `event.ts: profitMargin` |
| D5 | Inflow nol | margin **"tidak tersedia"** | mengembalikan **0** | `event.ts: profitMargin` |
| D6 | Tiket nol | BEP **"tidak tersedia"** | mengembalikan **0** | `event.ts: ticketsToBreakEven` |

Catatan: D1 adalah pertanyaan terbuka PRD bagian 15 ("Dana darurat 15% sesuai praktik EO target?"). Lampiran D menetapkan `BudgetCap × 15%`. PRD bagian 9 kontradiktif: "Dana darurat 15% dihitung dari total anggaran (konfirmasi dengan implementasi V2)". Urutan otoritas: Lampiran A → D → bagian 8 → lainnya. **Lampiran D menang → contingency = BudgetCap × 15%.**

**Divergensi lain:**

| # | Item | Detail |
|---|---|---|
| D7 | `money.ts` tidak lengkap | PRD butuh `assertRp`, `sum(list)`, `mulDivFloor`, `mulDivCeil`, `formatRp`, `parseRp`, `formatBp`. Yang ada hanya `assertIntegerMoney`, `formatIDR`, `parseRupiah` |
| D8 | Duplikat `totalOutflow` | Ada di `event.ts` DAN `vendors.ts` — sumber kebingungan |
| D9 | `averageTicketPrice` & `averagePrice` duplikat | Logika sama di 2 file |
| D10 | Nama package masih `debtsettler` | `package.json` name `debtsettler@1.0.0` |
| D11 | Tidak ada `npm test` | `package.json` tidak punya script test, tidak ada vitest terpasang |

## 3. Belum ada (gap V3.0 P0)

| ID | Fitur | Status |
|---|---|---|
| F6 | Backup/Restore JSON | **tidak ada** — tidak ada export/import file sama sekali |
| F7 | Export Likuidasi PDF/Excel | **tidak ada** |
| F14 | Mode demo (`VITE_APP_MODE`) | **tidak ada** — `mode.ts` belum dibuat |
| — | Struktur folder PRD | `src/engine` ada; `src/data`, `src/export`, `src/features` belum ada |
| — | Workspace multi-event v3 | state masih single `Event`, bukan `Workspace { schemaVersion: 3, events: EventData[] }` |
| — | Migrasi dari `eo_dash_v2` | tidak ada |
| — | Onboarding checklist & empty state | UI langsung render sample data, tidak ada layar "Mulai event baru / Muat data contoh" |
| — | Undo pelunasan vendor | F2 butuh undo; `markVendorPaid` tidak ada undo |
| — | base: './' | belum dicek di `vite.config.ts` |
| — | `docs/DECISIONS.md`, panduan deploy, lisensi | belum ada |

## 4. Risiko teknis

1. **Angka dashboard vs export bisa beda** — divergensi D1–D6 wajib diperbaiki di M1 karena M4 (Export Likuidasi) wajib pakai `calc.ts` yang sama. Kalau tidak, angka laporan ≠ angka dashboard = gagal rilis (Lampiran A).
2. **Aritmetika uang di luar engine** — UI langsung pakai `Number(vFee)`, `v.paid.toLocaleString()` tanpa lewat `money.ts`. Pelanggaran aturan keras. M1 harus menyalurkan semua lewat engine.
3. **Tidak ada satu pun uji otomatis** — Lampiran D butuh suite uji wajib sebelum rilis.
4. **Migrasi state** — user V2 (data `eo_dash_v2`) akan kehilangan data tanpa migrasi ke Workspace v3.
5. **Divergensi D1 belum tervalidasi pasar** — PRD bagian 15 menandai asumsi. Ikuti Lampiran D, catat di DECISIONS.md.

## 5. Langkah berikutnya

M1: Mesin uang — tulis `src/engine/money.ts` (API PRD) + `calc.ts` + uji otomatis semua kasus Lampiran D. Perbaiki D1–D6.
