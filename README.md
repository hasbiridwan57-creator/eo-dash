# DebtSettler

Aplikasi web client-side untuk pembagian pengeluaran grup & settlement optimizer dengan presisi integer mutlak (Rupiah).

## Fitur Utama
- **Precision Integer Math**: Tanpa floating-point error, semua perhitungan menggunakan sen / Rupiah bulat.
- **Settlement Optimizer**: Algoritma greedy dan optimal (bitmask DP) untuk meminimalkan jumlah transfer.
- **Hash Routing (`#/`)**: Navigasi berbasis hash murni, mendesentralisasi state URL (trip, tab, share).
- **Share Link (Snapshot)**: Berbagi trip via URL base64url dengan pratinjau read-only dan tombol "Simpan sebagai trip saya".
- **PWA Ready**: Dapat diinstal dan digunakan offline berkat `vite-plugin-pwa` dan Workbox.
- **Property Testing**: 200 runs per properti (total 1200 skenario) menggunakan `fast-check`.

## Teknologi
- Vite + React 18 + TypeScript (Strict)
- Tailwind CSS v4
- Zustand (localStorage persist & migration)
- Recharts (Visualisasi kategori & pengeluaran)
- Vitest + Fast-Check

## Cara Menjalankan
```bash
npm install
npm run dev      # Mode development
npm run build    # Build produksi
npm run test     # Menjalankan seluruh test suite
```
