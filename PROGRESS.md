# PROGRESS.md — DebtSettler

Diperbarui: 2026-09-30

## R0 — Git init (2026-09-30)

- `git init` + `.gitignore` (node_modules, dist, .DS_Store, *.local, .env)
- Commit baseline `696732c` "baseline: S0-S10, engine S12/S13" (39 file, node_modules/dist tidak ikut)
- `Math.random` di `property.test.ts` diganti counter deterministik
- Grep engine: `BERSIH: engine/` (0 toFixed/parseFloat/Math.random/react/zustand)

## R1 — UpdatedAt & Form Logic (2026-09-30)

- `updatedAt?: string` ditambahkan ke `Expense` di `types.ts` dan schema Zod (`schema.ts` strict)
- `ExpenseForm.tsx`: submit edit mengisi `updatedAt` (ISO), `createdAt` dipertahankan
- `draftToExpense` di-refactor menjadi pure function (id/createdAt/updatedAt sebagai argumen)
- Test: `ExpenseForm.test.ts` (validasi `canSave`, skenario 3, 4, round-trip edit)
- Test: `updatedAt.test.ts` (edit mengisi updatedAt; fixture lama tanpa updatedAt tetap lolos import)

## R2 — Hash Routing (2026-09-30)

- `src/routes.ts`: `parseHash` / `toHash` (pure). Route: home, trip+tab, share
- Format: `#/`, `#/t/<id>?tab=...`, `#/s/<data>`. Tab tak dikenal/kosong → `expenses`. Hash rusak → home. Trailing slash ditoleransi. data base64url (`-` dan `_`)
- `App.tsx`: hashchange listener + parse saat load. Hash = sumber kebenaran; activeTripId diturunkan dari route. tripId tak ada → redirect `#/` + toast. Tab click → hash. Back browser berfungsi. Route tidak di-persist. Load tanpa hash + activeTripId → ganti ke `#/t/<id>`
- Test: `routes.test.ts` (format, hash rusak, tab tak dikenal, trailing slash, base64url, round-trip)

## R3 — Toggle Optimal (2026-09-30)

- `chooseTransfers(balances, optimize)` di `settle.ts` → `{transfers, greedyCount, optimalCount, canOptimize}`
- `canOptimize` = jumlah saldo bukan-nol <= `OPTIMAL_MAX_PEOPLE` (12)
- Tab Settle: toggle "Cari jumlah transfer lebih sedikit"; default aktif jika canOptimize, jika tidak nonaktif + penjelasan ">12 orang, memakai metode ringkas"
- Tampilkan "Ringkas: N -> Diperkecil: M" hanya jika M < N. Tandai lunas + Salin WA pakai daftar yang sedang tampil

## R4 — Share Link UI (2026-09-30)

- Tombol "Bagikan trip": `encodeTrip` → URL `<origin>/#/s/<data>` → clipboard
- URL > 8000 chars → pesan "gunakan Export JSON", tidak disalin. QR dilewati (keputusan di DECISIONS.md)
- Route share: state loading → decode + validasi Zod + validateTrip. Gagal → pesan ramah + tombol "Kembali" (tidak crash). Berhasil → pratinjau READ-ONLY (nama trip, peserta, jumlah pengeluaran, total, net balance)
- Pratinjau TIDAK menulis ke store. "Simpan" → `importTrips` dengan trip id BARU → `history.replaceState` ke `#/t/<idBaru>`. "Batal" → `#/`
- Teks pengingat: link adalah snapshot, perubahan tidak tersinkron
- Test: pratinjau tidak mengubah store; simpan membuat trip baru; link rusak tidak melempar

## R5 — PWA (2026-09-30)

- `vite-plugin-pwa` v1.3.0 + `@vite-pwa/assets-generator` v1.0.4 dipasang (devDependency)
- `registerType: 'autoUpdate'`, `devOptions.enabled: false` (SW hanya di build produksi)
- Manifest: name "DebtSettler", theme/background `#0F172A`, display standalone, start_url `./`
- Ikon: `pwa-192x192.png`, `pwa-512x512.png` (biasa + maskable), `apple-touch-icon-180x180.png`, `favicon.ico` — dihasilkan dari `public/icon.svg`
- Build produksi menghasilkan `dist/sw.js` + `dist/workbox-9c191d2f.js` + `dist/manifest.webmanifest` + `registerSW.js`

## Property tests (fast-check) — 200 runs per properti

| Properti | Invariant | Runs |
|---|---|---|
| 1 | Jumlah share per expense == amount | 200 |
| 2 | Jumlah semua net balance == 0 | 200 |
| 3 | Setelah semua transfer settle() diterapkan, semua saldo 0 | 200 |
| 4 | Jumlah transfer <= activeCount - 1 | 200 |
| 5 | Semua transfer > 0 dan from !== to | 200 |
| 6 | settle() deterministik: input sama → output identik | 200 |

Generator: peserta 2-8, tipe equal/percentage/custom, multi-payer (1-3 payer, total == amount), nominal acak 100-10.000.000 (memicu sisa pembulatan). `numRuns: 200` per properti (total 1200 skenario). fast-check mencetak seed di output saat gagal.

## Gate (output asli, R0-R5)

- `npx tsc --noEmit` -> OK, 0 error.
- `npm run build` -> OK.
- `npx vitest run` -> **Test Files 15 passed (15), Tests 94 passed (94)**, 0 failed.

## Status checklist QA manual (playbook §6)

|| # | Item | Status | Bukti |
||---|---|---|---|
|| 1 | Sample trip, Net Balance = Ani −128.334, Budi −108.333, Citra +61.667, Dedi +175.000, total Rp0 | PASS (otomatis) | `src/sample.test.ts` 7/7 |
|| 2 | Settle 3 transfer + format WhatsApp | PASS (otomatis) | `sample.test.ts`; `text.test.ts` 2/2 |
|| 3 | Tandai lunas / batalkan | PASS (otomatis) | `settle.test.ts` Skenario 6 |
|| 4 | Simpan nonaktif saat total 99% | PASS (otomatis) | `validate.test.ts` 12/12 |
|| 5 | Custom total kurang -> sisa Rp, Simpan nonaktif | PASS (otomatis) | `validate.test.ts` |
|| 6 | Edit expense, saldo berubah, riwayat "diedit" | PASS (otomatis) | `settle.test.ts` edit-derived; `updatedAt.test.ts` |
|| 7 | Refresh, data tetap | BELUM DIUJI MANUAL | butuh browser |
|| 8 | Export -> hapus -> Import, saldo sama | round-trip encode/decode PASS (otomatis); alur UI BELUM | `share.test.ts` 2/2 |
|| 9 | Saldo A +10 B +9 C −6 D −4 E −9, toggle optimal 4 -> 3 | engine PASS; toggle UI terpasang, belum diuji manual | `settle.test.ts` (4 test) |
|| 10 | Buka share link, simpan sebagai trip | UI pratinjau + route share terpasang, belum diuji manual | engine + `routes.test.ts` |
|| 11 | Build produksi offline | SW + manifest terbentuk di build; belum diuji manual | `dist/sw.js` |

## Langkah yang selesai (dengan test)

S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11 (R2), S12 (R3), S13 (R4), S14/R5 (PWA).

## Yang belum

- R6: QA manual di browser (refresh/persist, export/import, offline PWA, share link, toggle optimal, back browser)
- R6: `README.md` final
- R6: Empty state per tab, error boundary
- S15 mata uang asing (opsional, belum mulai)
