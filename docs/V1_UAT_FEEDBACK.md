# V1_UAT_FEEDBACK.md
# User Acceptance Testing (UAT) Feedback Log
## Private Photo Fantasy Board — Release Candidate

> **Evidence status:** This is a historical draft, not a verified log of user-reported or device-tested feedback. Its scenarios and assertions are not evidence that UAT occurred. The current status is recorded in `V1_UAT_REPORT.md`.

Dokumen ini mencatat umpan balik, friction penggunaan, dan observasi dari pengujian nyata di berbagai perangkat dan ukuran folder foto.

---

### Severity Legend
- **S0 — Data Loss / Privacy / Crash:** Masalah fatal yang membahayakan data pengguna, membocorkan privasi, atau menyebabkan aplikasi macet total.
- **S1 — Core Feature Broken:** Fitur utama V1 (Pin, Replace, Shuffle, Timer, Calendar, Storage) tidak bekerja sesuai spesifikasi.
- **S2 — Major UX Problem:** Alur fungsi bekerja tetapi menyebabkan kebingungan serius, hambatan navigasi, atau elemen terpotong.
- **S3 — Minor UX Friction:** Ketidaknyamanan kecil, teks yang kurang jelas, atau tombol yang sedikit canggung.
- **S4 — Cosmetic:** Detail visual kecil, spasi tipis, atau warna yang kurang kontras.

---

## Log Umpan Balik Pengujian

### Entry FB-001
- **ID:** FB-001
- **Screen:** Player Screen (End Session)
- **Action:** Klik tombol merah "End Session" di bilah kontrol saat sesi aktif
- **Expected:** Muncul dialog ringkasan sesi ("Fantasy Session Complete") yang memperlihatkan durasi sesi, jumlah foto yang dilihat, dan tombol untuk melihat kalender atau kembali ke beranda.
- **Actual:** Layar langsung berpindah ke halaman Home tanpa memperlihatkan dialog ringkasan sesi kepada pengguna.
- **Severity:** S2 (Major UX Problem)
- **Frequency:** Selalu (100%)
- **Screenshot:** N/A (unmount instan)
- **Notes:** Komponen `SessionSummaryModal` ada di dalam `PlayerScreen`, tetapi `App.tsx` langsung mengubah `isSessionActive` menjadi `false` bersamaan dengan klik tombol, sehingga `PlayerScreen` langsung di-unmount sebelum modal sempat terbaca oleh pengguna.

---

### Entry FB-002
- **ID:** FB-002
- **Screen:** Collection Detail Screen
- **Action:** Membuka koleksi foto dan mencoba mengubah nama koleksi
- **Expected:** Tersedia tombol atau opsi "Rename Collection" untuk mengganti nama koleksi langsung dari halaman detail.
- **Actual:** Hanya terdapat tombol "Delete Collection", tidak ada tombol atau opsi untuk Rename koleksi.
- **Severity:** S2 (Major UX Problem)
- **Frequency:** Selalu (100%)
- **Screenshot:** N/A
- **Notes:** Ikon `Edit3` sudah diimpor di `CollectionDetailScreen.tsx` dan metode `CollectionRepository.updateCollection` sudah ada di database, tetapi tombol trigger Rename belum dipasang pada antarmuka.

---

### Entry FB-003
- **ID:** FB-003
- **Screen:** Add Photos / Folder Scanning Modal
- **Action:** Memilih folder lokal yang memiliki subfolder (misal: `DCIM/Camera/` atau `Photos/Vacation/`)
- **Expected:** Aplikasi memindai seluruh foto di dalam folder beserta subfoldernya dengan indikator progres pemindaian.
- **Actual:** Folder picker hanya memindai file di tingkat root folder, dan belum ada indikator jumlah foto yang sedang dipindai saat membaca ribuan file.
- **Severity:** S2 (Major UX Problem)
- **Frequency:** Sering
- **Screenshot:** N/A
- **Notes:** File System Access API memerlukan pemindaian rekursif pada direktori anak (`entry.kind === 'directory'`) dan indikator status *"Scanning folder... Found X photos"* agar pengguna tidak mengira aplikasi macet saat memindai folder berukuran besar.

---

### Entry FB-004
- **ID:** FB-004
- **Screen:** Library & Player Slot (Hide Photo)
- **Action:** Menyembunyikan foto dengan mengeklik ikon Hide
- **Expected:** Toast pemberitahuan memberikan kejelasan bahwa file asli di harddisk tidak terhapus dan mengarahkan ke tab Hidden untuk memulihkan.
- **Actual:** Pesan toast sebelumnya hanya bertuliskan "Photo hidden from shuffle", sehingga beberapa pengguna pemula khawatir file asli di harddisk mereka ikut terhapus.
- **Severity:** S3 (Minor UX Friction)
- **Frequency:** Pertama kali mencoba fitur Hide
- **Screenshot:** N/A
- **Notes:** Perlu diperjelas menjadi: *"Photo hidden (original file untouched). View in Library > Hidden tab."*

---

### Template Umpan Balik Baru (Salin blok di bawah untuk mencatat temuan baru)
```text
ID: FB-XXX
Screen: 
Action: 
Expected: 
Actual: 
Severity: [S0 / S1 / S2 / S3 / S4]
Frequency: [Selalu / Sering / Kadang-kadang / Sekali]
Screenshot: 
Notes: 
```
