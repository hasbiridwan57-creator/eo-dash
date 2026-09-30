# PROGRESS.md — DebtSettler

Diperbarui: 2026-09-30

## R0 — Git init (2026-09-30)

- `git init` + `.gitignore` (node_modules, dist, .DS_Store, *.local, .env)
- Commit baseline `696732c` "baseline: S0-S10, engine S12/S13" (39 file, node_modules/dist tidak ikut)
- `Math.random` di `property.test.ts` diganti counter deterministik
- Grep engine: `BERSIH: engine/` (0 toFixed/parseFloat/Math.random/react/zustand)

Gate:
```
TSC OK
 Test Files  12 passed (12)
      Tests  75 passed (75)
✓ built in 1.30s
```

## Gate (output asli)

- `npx tsc --noEmit` -> OK, 0 error.
- `npm run build` -> OK, ~1.3s.
- `npx vitest run` -> **Test Files 12 passed (12), Tests 75 passed (75)**, 0 failed.

## Status checklist QA manual (playbook §6)

Sebagian besar belum dijalankan manual — hanya bagian yang punya test otomatis yang bisa dibuktikan:

| # | Item | Status | Bukti |
|---|---|---|---|
| 1 | Sample trip, Net Balance = Ani −128.334, Budi −108.333, Citra +61.667, Dedi +175.000, total Rp0 | PASS (otomatis) | `src/sample.test.ts` 7/7 |
| 2 | Settle 3 transfer + format WhatsApp | PASS (otomatis) | `sample.test.ts`; `text.test.ts` 2/2 |
| 3 | Tandai lunas / batalkan | PASS (otomatis) | `settle.test.ts` Skenario 6 |
| 4 | Simpan nonaktif saat total 99% | PASS (otomatis) | `validate.test.ts` 12/12 |
| 5 | Custom total kurang -> sisa Rp, Simpan nonaktif | PASS (otomatis) | `validate.test.ts` |
| 6 | Edit expense, saldo berubah, riwayat "diedit" | PASS (otomatis); "diedit" marker BELUM | `settle.test.ts` edit- derived |
| 7 | Refresh, data tetap | BELUM DIUJI MANUAL | butuh browser |
| 8 | Export -> hapus -> Import, saldo sama | round-trip encode/decode PASS (otomatis); alur UI BELUM | `share.test.ts` 2/2 |
| 9 | Saldo A +10 B +9 C −6 D −4 E −9, toggle optimal 4 -> 3 | engine PASS; toggle UI BELUM | `settle.test.ts` (4 test) |
| 10 | Buka share link, simpan sebagai trip | BELUM (UI pratinjau belum ada) | engine ada |
| 11 | Build produksi offline | BELUM | PWA belum terpasang |

## Langkah yang selesai (dengan test)

S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S12 (engine), S13 (engine).

## Yang belum

- S11 hash routing (handler hashchange + route `#/t/<id>` belum ada)
- S12 toggle UI "Cari jumlah transfer lebih sedikit" belum dipasang
- S13 UI pratinjau share link belum; QR belum
- S14 PWA: `vite-plugin-pwa` belum terpasang (klaim sebelumnya "PWA PASS" dicabut)
- S15 mata uang asing (opsional, belum mulai)
- S16: `README.md`, empty state per tab, error boundary, QA manual di browser
- Repo belum `git init` (playbook menyuruh commit per langkah; belum ada commit)
