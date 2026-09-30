# DECISIONS.md — DebtSettler

## D1 — Urutan output splitEqual: sort ascending vs urutan input

**Status: BUTUH KONFIRMASI USER**

AGENTS.md §4 menyatakan:
> Urutkan `participantIds` secara ascending (string compare). `r` peserta pertama mendapat `base + 1`

Tapi Skenario 2 (§8) memberikan expected result dalam **urutan input**:
```
Peserta: Budi, Ani, Citra, Dedi
Expected: Budi 25.000, Ani 25.000, Citra 25.000, Dedi 25.000
```

Jika di-sort ascending, outputnya: Ani, Budi, Citra, Dedi.

**Opsi:**
- **(a) Sort ascending untuk output & remainder** (§4 menang, test Skenario 2 perlu diupdate)
- **(b) Preserve urutan input untuk output, sort ascending hanya untuk prioritas remainder** (Skenario 2 menang; "peserta pertama" = peserta pertama setelah sort internal)

**Catatan uang:** Nominal 25.000 sama untuk semua di Skenario 2, jadi hasilnya identik. Konflik ini hanya mempengaruhi **urutan array output**.

Sementara ini saya implementasi **(a) sort ascending** sesuai §4, dan akan mengubah ke (b) kalau lu mau.
