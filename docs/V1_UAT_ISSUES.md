# V1_UAT_ISSUES.md
# User Acceptance Testing (UAT) Issue Tracker
## Private Photo Fantasy Board — Release Candidate

> **Evidence status:** Historical issue descriptions and FIXED labels came from earlier project notes; they are not proof of user-reported findings or visual/device verification. Treat the current code audit and regression run as the available evidence, and recheck each flow during UAT.

Tabel pelacak masalah, status investigasi, perbaikan, dan pengujian regresi.

---

## Issue Tracking Table

| ID | Issue Description | Severity | Status | Root Cause | Fix Applied | Regression Test |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **ISSUE-01** | `SessionSummaryModal` ter-unmount seketika saat klik End Session sehingga pengguna tidak dapat melihat ringkasan sesi. | **S2** | **FIXED** | `onEndSession()` langsung mengatur `isSessionActive = false` di `App.tsx` bersamaan dengan `handleEndSessionClick`, meng-unmount `PlayerScreen` sebelum modal terlihat. | Ubah alur di `PlayerScreen.tsx`: tombol End Session membuka `isSummaryModalOpen(true)` dan menjeda slideshow. Saat pengguna memilih "View Calendar", "Return to Home", atau "Start Another Session", barulah `onEndSession()` difinalisasi. | Verifikasi interaksi modal ringkasan sesi dan navigasi pasca sesi. |
| **ISSUE-02** | Tidak ada tombol untuk mengubah nama koleksi (*Rename Collection*) di halaman detail koleksi. | **S2** | **FIXED** | Tombol trigger belum dipasang di antarmuka `CollectionDetailScreen.tsx`, meskipun repositori database `updateCollection` sudah mendukungnya. | Tambahkan tombol Edit/Rename di sebelah judul koleksi dengan dialog input nama baru, panggil `CollectionRepository.updateCollection`. | Unit test & verifikasi navigasi perubahan nama koleksi. |
| **ISSUE-03** | Pemilihan folder foto tidak memindai subfolder secara rekursif dan tidak menampilkan indikator proses scanning pada folder besar. | **S2** | **FIXED** | Pemindaian `showDirectoryPicker` di `AddSourceModal.tsx` hanya memeriksa file tingkat root dan tidak memiliki state `isScanning`. | Tambahkan rekursi hingga kedalaman 3 tingkat untuk `entry.kind === 'directory'`, serta tampilkan indikator progress counter *"Scanning... Found X photos"* dan spinner. | Verifikasi pemilihan folder bertingkat dan pembacaan ekstensi gambar. |
| **ISSUE-04** | Pesan konfirmasi Hide foto kurang menjelaskan bahwa file fisik asli aman dan tidak terhapus. | **S3** | **FIXED** | String toast di `App.tsx` terlalu singkat ("Photo hidden from shuffle"). | Perjelas teks toast menjadi: `"Photo hidden (original file untouched). View in Library > Hidden tab."` | Verifikasi teks toast pada aksi Hide di Library dan Player. |

---

## Status Definitions
- **OPEN:** Masalah baru dilaporkan dan belum dianalisis.
- **INVESTIGATING:** Sedang ditelusuri akar masalahnya dalam kode.
- **FIXED:** Solusi kode telah diterapkan.
- **VERIFIED:** Telah diuji dan lolos automated test & verifikasi visual.
- **DEFERRED:** Ditunda karena berada di luar cakupan V1 (misal fitur V2).
