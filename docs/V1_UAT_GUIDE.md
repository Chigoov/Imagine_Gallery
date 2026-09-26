# V1_UAT_GUIDE.md
# Panduan Pengujian Penerimaan Pengguna (User Acceptance Testing)
## Private Photo Fantasy Board — Versi 1.0 Release Candidate

Selamat datang di pengujian langsung **Private Photo Fantasy Board**!

Aplikasi ini dirancang khusus untuk kenyamanan, kebebasan, dan privasi penuh dalam menikmati koleksi foto pribadi Anda secara lokal di laptop maupun smartphone. Panduan ini ditulis dalam bahasa yang sederhana agar Anda dapat langsung menguji setiap alur penggunaan utama tanpa kebingungan teknis.

---

## A. PERSIAPAN SEBELUM MEMULAI

### 1. Perangkat yang Dibutuhkan
- **Laptop / PC:** Menggunakan browser modern (Google Chrome, Microsoft Edge, Brave, atau Safari).
- **Smartphone (Opsional namun sangat disarankan):** Browser HP (Chrome / Safari) untuk menguji kenyamanan sentuhan jari dan tata letak layar vertikal.

### 2. Menyiapkan Folder Foto Nyata
Siapkan satu atau beberapa folder foto di perangkat Anda. Anda dapat memilih salah satu ukuran berikut:
- **Koleksi Kecil:** 20 hingga 100 foto (contoh: folder foto liburan singkat).
- **Koleksi Sedang:** 500 hingga 2.000 foto (contoh: album foto tahunan).
- **Koleksi Besar (Jika ada):** 5.000+ foto (contoh: arsip kamera digital / backup HP).

> **Catatan file:** Jalur kode yang diperiksa hanya membaca file yang dipilih; tombol Keep menyimpan salinan di penyimpanan aplikasi. Reset dapat menghapus salinan aplikasi tersebut, tetapi tidak ditujukan untuk mengubah file sumber. Tetap uji dengan salinan foto yang aman dan pastikan tidak ada perubahan pada file sumber.

### 3. Menjalankan Aplikasi
Buka Terminal / PowerShell di folder proyek, lalu ketik perintah berikut:

```bash
# Menjalankan server aplikasi lokal
npm run dev
```

Browser akan menampilkan alamat lokal (biasanya `http://localhost:5173`). Buka alamat tersebut di browser Anda.

Jika ingin menguji dari smartphone di jaringan Wi-Fi yang sama:
```bash
npm run dev -- --host
```
Buka alamat IP Network yang muncul (misal: `http://192.168.1.xxx:5173`) di browser HP Anda.

---

## B. 15 SKENARIO PENGUJIAN LANGSUNG (UAT)

---

### Skenario 01 — Pertama Kali Menggunakan (First Use)
**Tujuan:** Memastikan penambahan foto dari komputer ke aplikasi mudah dipahami dan cepat.

**Langkah Pengujian:**
1. Buka aplikasi. Halaman awal (**Home**) akan menyambut Anda.
2. Klik tombol **"Add Photos"** di kanan atas atau buka tab **Library**.
3. Pilih **"Select Folder"** untuk memilih satu folder foto, atau **"Select Image Files"** untuk memilih beberapa file.
4. Perhatikan proses scanning.
5. Setelah selesai, buka tab **Library**.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah cara memilih folder foto terasa mudah dan tidak membingungkan?
- Apakah foto dan judul langsung muncul dengan cepat di galeri?
- Apakah ada pesan peringatan atau kebingungan saat memilih folder?

---

### Skenario 02 — Membuat & Mengatur Koleksi (Collections)
**Tujuan:** Mengelompokkan foto-foto favorit ke dalam tema tertentu.

**Langkah Pengujian:**
1. Masuk ke tab **Collections** melalui menu di sebelah kiri (atau bawah di HP).
2. Klik tombol **"+ New Collection"**, beri nama (misal: *"Pantai & Alam"*), lalu klik **Create**.
3. Buka tab **Library**, pilih sebuah foto, lalu klik ikon simpan (**Keep / Bookmark**).
4. Masukkan foto tersebut ke dalam koleksi yang baru Anda buat.
5. Buka kembali tab **Collections**, pilih koleksi tersebut, lalu coba ubah nama koleksi (**Rename**).
6. Klik tombol **"Start Session"** langsung dari dalam halaman koleksi tersebut.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah pembuatan koleksi terasa cepat dan intuitif?
- Apakah perbedaan antara *Collection*, *Liked*, *Favorite*, dan *Keep* terasa masuk akal bagi Anda?

---

### Skenario 03 — Menguji Player 1 hingga 5 Foto
**Tujuan:** Menemukan komposisi tampilan terbaik di layar laptop dan HP Anda.

**Langkah Pengujian:**
1. Di layar Player yang sedang aktif, perhatikan bagian tengah bilah kontrol di bawah.
2. Klik angka layout:
   - **Angka 1:** Tampilan 1 foto layar penuh (fokus maksimal).
   - **Angka 2:** Tampilan 2 foto (berdampingan di laptop, atas-bawah di HP).
   - **Angka 3:** Tampilan 3 foto (1 foto utama besar + 2 foto pendukung).
   - **Angka 4:** Tampilan 4 foto (grid 2x2 seimbang).
   - **Angka 5:** Tampilan 5 foto (1 foto utama besar + 4 foto compact).
3. Cobalah di layar laptop dan layar HP Anda.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah pemotongan gambar (*cropping*) terasa pas dan proporsional?
- Layout berapa foto yang terasa paling nyaman dan memuaskan bagi mata Anda?
- Apakah ada elemen tombol kontrol yang menutupi bagian penting foto?

---

### Skenario 04 — Mengunci Foto yang Disukai (Pin 📌)
**Tujuan:** Menjaga foto tertentu agar tidak berganti saat foto lain terus berjalan.

**Langkah Pengujian:**
1. Mulai sesi dengan 4 foto dalam mode **Auto**.
2. Arahkan kursor ke foto di pojok kiri atas (atau sentuh di HP), lalu klik ikon **Pin 📌**. Lencana emas **PIN** akan muncul.
3. Kunci juga foto di pojok kanan bawah dengan ikon **Pin 📌**.
4. Biarkan slideshow berganti otomatis beberapa kali (atau klik tanda panah **Next →**).
5. Perhatikan: Foto yang di-pin **sama sekali tidak boleh berganti**, sedangkan foto lainnya berganti dengan foto baru!
6. Klik lencana PIN untuk melepas kunci (**Unpin**).

**Pertanyaan Evaluasi untuk Anda:**
- Apakah Anda merasa yakin foto yang di-pin benar-benar aman tidak akan terlewat?
- Apakah lencana penanda PIN terlihat jelas namun tidak merusak keindahan foto?

---

### Skenario 05 — Mengganti Satu Foto Saja (Replace One ↻)
**Tujuan:** Mengganti foto yang kurang menarik di salah satu slot tanpa mengacaukan foto-foto lainnya.

**Langkah Pengujian:**
1. Saat 4 foto sedang tampil di layar, kunci (Pin) foto yang Anda sukai.
2. Pada foto lain yang kurang Anda sukai, klik ikon putar (**Replace ↻**).
3. Perhatikan: **Hanya slot foto tersebut yang berganti**, sementara slot-slot lainnya tetap stabil di tempatnya!
4. Coba lakukan klik **Replace ↻** beberapa kali pada slot yang berbeda.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah penggantian satu foto terasa instan dan mulus?
- Apakah transisi visual pergantian terasa halus dan tidak membuat layar berkedip?

---

### Skenario 06 — Like, Favorite, dan Keep
**Tujuan:** Memberikan apresiasi dan menyimpan momen foto terbaik.

**Langkah Pengujian:**
1. Pada foto yang tampil, klik ikon **Hati (Like)**.
2. Pada foto lainnya, klik ikon **Bintang (Favorite)**.
3. Klik ikon **Bookmark (Keep)** untuk menyimpannya ke dalam koleksi lokal.
4. Buka tab **Library**, lalu klik filter **Liked**, **Favorites**, dan **Kept**. Periksa apakah foto-foto tersebut terdaftar dengan benar.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah umpan balik visual (warna merah untuk Like, emas untuk Favorite, hijau untuk Keep) terasa memuaskan?

---

### Skenario 07 — Menyembunyikan Foto (Hide)
**Tujuan:** Menyaring foto yang tidak ingin ditampilkan saat slideshow tanpa menghapus file aslinya.

**Langkah Pengujian:**
1. Buka tab **Library** atau saat foto tampil di Player.
2. Klik ikon mata tertutup (**Hide**).
3. Perhatikan pesan pemberitahuan: *"Photo hidden (not deleted). View in Library > Hidden tab."*
4. Masuk ke tab **Library** $\rightarrow$ pilih filter **Hidden**.
5. Foto tersebut dapat Anda pulihkan kapan saja dengan mengeklik tombol **Restore ⟲**.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah Anda merasa tenang bahwa foto asli di harddisk komputer Anda tidak terhapus?
- Apakah lokasi pemulihan foto tersembunyi mudah ditemukan?

---

### Skenario 08 — Sesi Otomatis (Auto Slideshow)
**Tujuan:** Menikmati tayangan foto yang berganti secara otomatis dengan ritme yang menenangkan.

**Langkah Pengujian:**
1. Klik **Start New Session**, pilih mode **Auto**, dan atur interval (misal: 7 detik).
2. Duduk santai dan biarkan aplikasi berjalan selama 2 hingga 3 menit.
3. Perhatikan: Setelah 3 detik tanpa gerakan mouse, bilah kontrol akan memudar secara anggun agar pandangan Anda bebas dari gangguan.
4. Gerakkan mouse atau sentuh layar untuk memunculkan kembali kontrol.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah ritme pergantian foto terasa menenangkan atau terlalu cepat/lambat?
- Apakah fitur kontrol otomatis menghilang (*auto-hide*) terasa nyaman?

---

### Skenario 09 — Sesi Manual & Navigasi Riwayat (Previous)
**Tujuan:** Mengendalikan setiap pergantian foto sendiri menggunakan tangan atau keyboard.

**Langkah Pengujian:**
1. Mulai sesi dalam mode **Manual**.
2. Tekan tombol **Panah Kanan (→)** di keyboard atau klik tombol **Next**.
3. Jika Anda terlewat foto yang menarik, tekan tombol **Panah Kiri (←)** di keyboard atau klik tombol **Previous**.
4. Di HP, cobalah menggeser layar ke kiri (**Swipe Left**) untuk Next, dan ke kanan (**Swipe Right**) untuk Previous.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah fungsi tombol Previous (kembali ke tampilan sebelumnya) bekerja persis seperti yang Anda harapkan?

---

### Skenario 10 — Mode Fokus (Focus Mode & Zoom)
**Tujuan:** Melihat detail sebuah foto secara mendalam satu per satu.

**Langkah Pengujian:**
1. Saat beberapa foto sedang tampil di Player, klik langsung pada foto yang ingin Anda perbesar (atau klik ikon **Maximize**).
2. Layar akan beralih ke kanvas hitam berfokus penuh pada foto tersebut.
3. Klik pada gambar untuk memperbesar zoom (**1x $\rightarrow$ 1.6x $\rightarrow$ 2.2x $\rightarrow$ 1x**).
4. Klik tombol **"Return to Board"** di kiri atas.
5. Anda akan kembali ke tampilan susunan foto sebelumnya tanpa ada yang berubah!

**Pertanyaan Evaluasi untuk Anda:**
- Apakah Mode Fokus terasa nyaman untuk melihat detail foto secara seksama?

---

### Skenario 11 — Penghitung Waktu Sesi (Session Timer)
**Tujuan:** Memahami pencatatan durasi sesi (Fantasy Time) Anda secara jujur dan transparan.

**Langkah Pengujian:**
1. Mulai sesi. Perhatikan penghitung waktu durasi.
2. Tekan tombol **Spasi** atau klik tombol **Pause** pada slideshow.
3. Perhatikan: Meskipun foto berhenti berganti, **waktu sesi (Fantasy Time) tetap terus berjalan** karena Anda masih menikmati layar.
4. Klik tombol merah **Power (End Session)** di kanan bawah.
5. Jendela ringkasan sesi (**Session Summary**) akan muncul menampilkan total durasi, jumlah foto yang dilihat, dan jumlah foto yang Anda Like.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah ringkasan sesi di akhir membantu Anda mengetahui waktu yang telah dihabiskan?

---

### Skenario 12 — Kalender & Catatan Manual
**Tujuan:** Melihat riwayat aktivitas pribadi Anda secara rapi tanpa tekanan game / poin.

**Langkah Pengujian:**
1. Masuk ke tab **Calendar**.
2. Klik tanggal hari ini untuk melihat rincian sesi yang baru saja Anda selesaikan.
3. Klik tombol **"Add Manual Entry"**.
4. Coba centang kotak **"Unknown"** pada kolom durasi (jika Anda ingin mencatat aktivitas sesi tanpa mengingat durasi pastinya).
5. Klik **Save Entry**. Periksa bahwa jumlah sesi bertambah tanpa menambahkan durasi palsu ke statistik.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah tampilan kalender terasa rapi, bersih, dan bebas dari elemen kompetitif yang mengganggu?

---

### Skenario 13 — Reload & Ketahanan Data (Persistence)
**Tujuan:** Memastikan data Like, Koleksi, dan Pengaturan Anda tidak hilang saat browser ditutup.

**Langkah Pengujian:**
1. Berikan Like pada 2 foto baru, buat 1 koleksi baru, dan simpan 1 komposisi favorit.
2. Tekan tombol **Refresh / F5** pada browser Anda (atau tutup tab dan buka kembali).
3. Periksa tab **Liked**, **Collections**, dan **Calendar**.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah seluruh tanda Like, koleksi, dan catatan kalender Anda tetap utuh setelah browser dimuat ulang?

---

### Skenario 14 — Pengujian pada Layar Smartphone
**Tujuan:** Memastikan kenyamanan penggunaan satu tangan di HP.

**Langkah Pengujian:**
1. Buka aplikasi di HP Anda.
2. Uji kemudahan jangkauan jempol ke bilah navigasi bawah.
3. Buka Player 2 foto (tampilan vertikal atas-bawah).
4. Coba gunakan gerakan usap jari (**Swipe**) ke kiri dan kanan untuk mengganti foto.
5. Coba kunci PIN dengan mengetuk lencana di layar.

**Pertanyaan Evaluasi untuk Anda:**
- Apakah ukuran tombol cukup besar untuk disentuh jari tanpa salah tekan?
- Apakah gerakan geser jari terasa responsif?

---

### Skenario 15 — Pengujian Tombol Cepat Keyboard Laptop (Desktop)
**Tujuan:** Efisiensi maksimal bagi pengguna laptop/PC.

**Tombol Pintas yang Dapat Anda Coba:**
- **Spasi:** Putar / Hentikan tayangan otomatis (Play / Pause).
- **Panah Kanan (→):** Menampilkan foto berikutnya (Next).
- **Panah Kiri (←):** Kembali ke tampilan sebelumnya (Previous).
- **Angka 1, 2, 3, 4, 5:** Mengubah jumlah foto seketika tanpa membuka menu.
- **Huruf P:** Mengunci / melepas kunci (Pin) foto pertama.
- **Huruf F:** Layar penuh (Fullscreen).
- **Escape (Esc):** Keluar dari Fullscreen atau Mode Fokus.

---

## C. CARA MENYAMPAIKAN MASALAH / SARAN
Jika Anda menemukan kendala tampilan, kebingungan tombol, atau kejanggalan saat mencoba skenario di atas, catat temuan Anda di file **`V1_UAT_FEEDBACK.md`** dengan format ringkas yang telah disediakan.

Terima kasih atas partisipasi Anda dalam menyempurnakan Private Photo Fantasy Board!
