# SPEC_AUDIT.md
# Comprehensive Specification Audit & Analysis
## Private Photo Fantasy Board

> **Scope note:** This earlier file describes product/specification intent; its implementation-compliance assertions are not current verification. Use `V1_IMPLEMENTATION_AUDIT.md` for the code audit and evidence-backed limitations.

**Audit Date:** September 2026  
**Auditor:** Lead Software Architect & Product Engineer  
**Specification Priority Hierarchy:**  
`MASTER_SPEC_PRIVATE_2.1.md` > `Dokumen 01–13` > `UI_WIREFRAME_V1.md` > `Master Spec Versi Lama (2.0 / Fantasy Board)`

---

## A. Product Understanding

### 1. Ringkasan Eksekutif
**Private Photo Fantasy Board** adalah aplikasi visual-session *local-first* dan *privacy-first* lintas platform (Desktop Web, Mobile Web/PWA, dan Native Wrapper). Aplikasi ini dirancang untuk menampilkan 1 hingga 5 foto personal secara bersamaan dalam kanvas dinamis ("Player").

Pengguna memanfaatkan aplikasi ini untuk:
- Mengorganisasi koleksi foto pribadi secara aman tanpa unggahan ke cloud publik.
- Menjalankan sesi visual interaktif dengan pengacakan pintar (*No Repeat Shuffle*).
- Mempertahankan foto favorit pada posisi tertentu menggunakan mekanisme **Pin** sementara slot lain terus berganti.
- Mengganti satu foto secara individual (**Replace One**) tanpa mengganggu tata letak slot lain.
- Memberikan feedback visual cepat (*Like*, *Favorite*, *Keep*, *Hide*).
- Melakukan *Focus Mode* untuk inspeksi visual detail tanpa mengorbankan durasi sesi.
- Mencatat durasi dan frekuensi sesi secara otomatis ke dalam **Kalender**, lengkap dengan agregasi harian, mingguan, dan bulanan tanpa gamifikasi berlebih.

### 2. Sudut Pandang Pengguna (User Mental Model)
1. **Onboarding Tanpa Beban:** Pengguna membuka aplikasi tanpa paksaan membuat akun atau login. Seluruh data tersimpan secara lokal di perangkat.
2. **Setup Library Cepat:** Pengguna memilih folder foto lokal atau file foto. Sistem memindai metadata dan membuat thumbnail tanpa menduplikasi atau memodifikasi file asli.
3. **Mulai Sesi (Start Session):** Pengguna memilih sumber (Koleksi, Favorites, Liked, atau Semua Foto), memilih jumlah foto (1–5), mode (Auto dengan interval atau Manual), serta mode shuffle.
4. **Pengalaman Player yang Imersif:**
   - Kanvas foto mendominasi 85–95% layar dengan latar belakang *near-black*.
   - Saat foto menarik perhatian, pengguna dapat menekan **Pin** agar foto tersebut tidak berganti saat transisi berikutnya.
   - Jika satu foto dirasa kurang pas, pengguna menekan tombol **Replace (↻)** pada slot tersebut; hanya slot itu yang diganti dengan kandidat baru dari antrean shuffle.
   - Pengguna dapat menekan foto untuk masuk ke **Focus Mode** (zoom & aksi terfokus).
5. **Pencatatan Sesi Transparan (Session & Calendar):**
   - Saat sesi selesai (*End Session*), timer sesi menghitung waktu aktif (*Fantasy Time*).
   - Ringkasan sesi langsung dicatat ke kalender hari ini (jumlah sesi dan total menit).
   - Pengguna dapat melihat pola penggunaan personal secara privat tanpa tekanan *streak* atau *leaderboard*.

---

## B. Core Features

Daftar seluruh fitur utama yang terdefinisi dalam spesifikasi:

| Kategori | Fitur Utama | Deskripsi Singkat |
| :--- | :--- | :--- |
| **Source & Library** | Local Source Ingestion | Pemindaian folder/file lokal, ekstraksi metadata (resolusi, orientasi, mime). |
| | Non-Destructive Storage | Tidak pernah menghapus, memindahkan, atau mengubah nama file asli. |
| | Library Grid & Search | Tampilan grid adaptif, pencarian nama, filter (Liked, Favorite, Kept, Hidden). |
| | Missing File Handling | Deteksi file yang berpindah/hilang tanpa crash atau penghapusan metadata otomatis. |
| **Collections** | Virtual Collections | Pengelompokan virtual; 1 foto bisa masuk ke banyak koleksi tanpa duplikasi fisik. |
| | Quick Add & Management | Buat, ubah nama, hapus koleksi (menghapus koleksi tidak menghapus foto). |
| **Core Player** | Multi-Slot Display (1–5) | Tata letak adaptif desktop & mobile untuk 1, 2, 3, 4, dan 5 foto. |
| | Auto Mode | Pergantian foto otomatis sesuai interval yang ditentukan (misal 5–15 detik). |
| | Manual Mode | Pergantian foto hanya terjadi saat dipicu (tombol Next, swipe, shortcut keyboard). |
| | Image Fit | Opsi visual `Cover` (penuh) dan `Contain` (tanpa cropping). |
| | Preloading Engine | Pre-decode kandidat berikutnya untuk mencegah kedipan layar putih (*blank flash*). |
| **Pin & Replace** | Pin System | Slot yang di-pin tetap berada di posisinya saat Auto Next, Manual Next, maupun Global Refresh. |
| | Replace One Photo | Mengganti hanya 1 slot foto tanpa mengubah foto dan pin state pada slot lainnya. |
| | Pinned Slot Replace | Jika slot yang di-pin di-replace secara eksplisit, foto baru tetap berstatus pinned. |
| **Photo Actions** | Like (♡) | Toggle cepat, persistensi instan, masuk ke filter Liked. |
| | Favorite (★) | Status preferensi tinggi, dapat digunakan sebagai sumber sesi mandiri. |
| | Keep (↓) | Menyalin foto ke penyimpanan internal aplikasi dengan opsi aturan penamaan. |
| | Hide (🚫) | Mengeluarkan foto dari antrean shuffle aktif dan mengganti slot seketika. |
| | Focus Mode | Tampilan layar penuh satu foto, auto-pause countdown, zoom, aksi lengkap. |
| | Previous / History | Navigasi mundur hingga 50 status tampilan sebelumnya. |
| | Saved Composition | Menyimpan kombinasi tata letak, foto spesifik, dan pin state saat ini. |
| **Shuffle Engine** | No Repeat Shuffle (Default) | Pool diacak menjadi antrean; foto tidak berulang sebelum siklus habis. |
| | Exclusion Rules | Foto yang sedang tampil dan foto yang sedang di-pin tidak boleh muncul dobel. |
| | Pure Shuffle | Pengacakan acak murni untuk setiap slot baru tanpa batasan antrean siklus. |
| **Session Tracking** | Session Timer | Menghitung waktu sesi aktif (*Fantasy Time*) dari Start hingga End Session. |
| | Background Grace Period | Toleransi 120 detik saat aplikasi di latar belakang sebelum sesi ditutup otomatis. |
| | Pause Decoupling | Menjeda slideshow tidak otomatis menghentikan timer durasi sesi. |
| | Session Summary | Dialog ringkasan durasi, foto dilihat, like, dan kept saat sesi berakhir. |
| **Calendar & Stats** | Calendar Month View | Kalender interaktif dengan indikator frekuensi sesi per tanggal. |
| | Day Detail | Rincian sesi harian (waktu mulai, selesai, durasi). |
| | Manual Entry | Input manual sesi (tanggal, jumlah sesi, durasi opsional, catatan). |
| | Statistics | Total sesi, total waktu, hari aktif, rata-rata durasi (mingguan & bulanan). |
| **Privacy & Security** | Local-First & Privacy Defaults | Cloud Sync OFF, Sharing OFF, Analytics OFF secara default. |
| | App Lock | Proteksi PIN/Password lokal dengan auto-lock saat inaktivitas. |
| | Privacy Screen | Penyamaran tampilan saat aplikasi berada di task switcher / background. |
| | Metadata Backup & Restore | Ekspor dan impor data aplikasi berformat JSON berversi (`schema_version`). |

---

## C. Feature Dependencies

Berikut adalah peta ketergantungan antar modul dalam aplikasi:

```text
┌────────────────────────────────────────────────────────┐
│                      PHOTO SOURCE                      │
│        (Local Folder / Selected Files / Storage)       │
└───────────────────────────┬────────────────────────────┘
                            │ (Scan & Index Metadata)
                            ▼
┌────────────────────────────────────────────────────────┐
│                      LOCAL LIBRARY                     │
│               (IndexedDB / Metadata Cache)             │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│        COLLECTIONS        │ │     SYSTEM FILTERS       │
│    (Custom Groups A, B)   │ │ (Liked, Favorites, Kept) │
└─────────────┬─────────────┘ └────────────┬─────────────┘
              │                            │
              └─────────────┬──────────────┘
                            │ (Query Eligible Items - Hide Exclusions)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    SESSION POOL                        │
│          (Deduplicated Photo Candidate IDs)            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SHUFFLE ENGINE                       │
│    (No-Repeat Shuffled Queue / Active Exclusions)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 PLAYER STATE ENGINE                    │
│   (1–5 Display Slots, Layout Config, History Stack)    │
│                                                        │
│   ├── PinEngine           (Preserves Pinned Slots)     │
│   ├── ReplaceEngine       (Single Slot Mutation)       │
│   ├── ActionEngine        (Like, Favorite, Keep, Hide) │
│   └── FocusEngine         (Single Photo Inspection)    │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              │ (Emits Session Events)     │ (State Snapshots)
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│       SESSION TIMER       │ │    SAVED COMPOSITIONS    │
│  (Active Time Countdown,  │ │  (Slot Mapping & Layout) │
│    Background Grace)      │ └──────────────────────────┘
└─────────────┬─────────────┘
              │ (On End Session: Persist Session Record)
              ▼
┌────────────────────────────────────────────────────────┐
│                  CALENDAR AGGREGATOR                   │
│   (Daily Entries, Manual Entries, Aggregate Stats)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    CALENDAR & HOME                     │
│    (Today Dashboard, Month Grid, Day Detail View)      │
└────────────────────────────────────────────────────────┘
```

---

## D. Conflicting Specifications & Resolutions

Berdasarkan perbandingan cermat antara `MASTER_SPEC_PRIVATE_2.1.md`, Dokumen 01–13, dan `UI_WIREFRAME_V1.md`, ditemukan beberapa variasi spesifikasi yang telah diselesaikan dengan hierarki prioritas:

### Konflik 1: Perilaku Timer Sesi saat Slideshow Di-Pause
- **File A (`01_PRODUCT_REQUIREMENTS.md` FR-013 & FR-016):** Menyebutkan timer dapat berhenti saat Focus Mode, namun ada teks ambigu mengenai Play/Pause slideshow.
- **File B (`02_FEATURE_SPECIFICATION.md` Section 29 & `MASTER_SPEC_PRIVATE_2.1.md` Section 8):** Menyatakan secara eksplisit: *"Fantasy Time: Start Session → End Session. Player Pause: does not end Fantasy Time. Manual Play/Pause pada slideshow tidak otomatis menghentikan session duration karena pengguna mungkin masih menikmati dan melihat foto yang sedang tampil."*
- **Recommended Resolution:** Ikuti **Master Spec 2.1 & Feature Spec 29**. Tombol Play/Pause hanya menghentikan *countdown interval pergantian foto otomatis* (auto-next timer). Durasi sesi keseluruhan (*Fantasy Time*) tetap berjalan hingga pengguna secara eksplisit menekan *End Session* atau terkena batas waktu *background grace* (120 detik).

---

### Konflik 2: Replace pada Slot yang Sedang di-Pin
- **File A (`UI_WIREFRAME_V1.md` & catatan lama):** Ada kemungkinan slot yang di-replace kehilangan status pin-nya.
- **File B (`MASTER_SPEC_PRIVATE_2.1.md` Section 5 & `02_FEATURE_SPECIFICATION.md` Section 4.5):** Secara tegas menetapkan: *"Replace pinned slot → slot tetap PINNED. Foto baru masuk menggantikan foto lama, dan pin status tetap aktif."*
- **Recommended Resolution:** Ikuti **Master Spec 2.1 Section 5**. Jika pengguna menekan tombol *Replace* pada slot yang memiliki pin, sistem mengambil foto baru yang valid dari antrean, menempatkannya di slot tersebut, dan status slot **tetap PINNED**.

---

### Konflik 3: Item Navigasi Desktop Sidebar
- **File A (`UI_WIREFRAME_V1.md` Section 1 & `01_PRODUCT_REQUIREMENTS.md` Section 19):** Menyertakan item `Saved` di dalam navigasi samping (`Home`, `Library`, `Collections`, `Favorites`, `Liked`, `Saved`, `Calendar`, `Settings`).
- **File B (`MASTER_SPEC_PRIVATE_2.1.md` Section 16 & `05_UI_UX_STRUCTURE.md` Section 3):** Menetapkan navigasi sidebar: `Home`, `Library`, `Collections`, `Favorites`, `Liked`, `Calendar`, `Settings`.
- **Recommended Resolution:** Gunakan struktur **Master Spec 2.1 Section 16** sebagai menu utama. `Saved Compositions` ditempatkan sebagai sub-navigasi / tab di dalam `Collections` atau `Library`, dengan shortcut langsung di Home atau tombol navigasi sekunder, menjaga sidebar tetap bersih dan terfokus.

---

### Konflik 4: Skema Penamaan File pada Fitur "Keep"
- **File A (`02_FEATURE_SPECIFICATION.md` Section 11):** Menyarankan template nama file: `{original}`, `{collection}_{number}`, `{collection}_{date}_{number}`.
- **File B (`MASTER_SPEC_PRIVATE_2.1.md` Section 11–12 & `07_PRIVACY_SECURITY.md` Section 32–33):** Membedakan antara *Internal Storage Name* (menggunakan UUID untuk menjamin keunikan dan mencegah kebocoran privasi) dengan *User-Facing Display Name* (yang mematuhi template penamaan koleksi/tanggal).
- **Recommended Resolution:** Terapkan pemisahan dua lapis: internal blob storage di IndexedDB menggunakan `UUID`, sedangkan metadata `display_name` dan nama file ekspor mematuhi aturan penamaan yang dipilih pengguna (`Original`, `Collection + Number`, dsb.).

---

### Konflik 5: Akses File System pada Browser Berbeda (Web Compatibility)
- **File A (`01_PRODUCT_REQUIREMENTS.md` FR-001):** Menyebutkan pemilihan folder lokal langsung.
- **File B (`04_DATABASE_SCHEMA.md` Section 5 & `06_API_SPECIFICATION.md` Section 6):** Mencatat bahwa `showDirectoryPicker` (File System Access API) hanya didukung oleh browser berbasis Chromium, sementara Firefox dan Safari iOS menggunakan input file standar/multiple file selection.
- **Recommended Resolution:** Implementasikan strategi dual-layer:
  - Pada browser yang mendukung `showDirectoryPicker`, sediakan opsi pemindaian folder asli.
  - Pada browser lain atau mobile, sediakan file picker multiple / drag-and-drop dengan penyimpanan blob lokal di IndexedDB/OPFS.
  - Sediakan dataset foto mock / sample bermutu tinggi secara lokal di dalam aplikasi agar pengguna dapat langsung menguji coba Player tanpa hambatan permission.

---

## E. Missing Decisions Analysis

### 1. BLOCKER (Harus Diputuskan Sebelum Coding Dimulai)
*Semua blocker utama telah teratasi oleh Master Spec 2.1:*
1. **Pilihan Arsitektur & Teknologi Frontend:** Next.js (App Router / Pages Router) atau Vite + React + TypeScript?
   - *Keputusan:* Karena target adalah *Local-First PWA / Responsive Web* tanpa backend mandatory pada V1, tumpukan **React + TypeScript + Tailwind CSS** (menggunakan Vite untuk performa SPA instan, hot module replacement tanpa overhead server-side rendering node.js lokal, serta kompatibilitas penuh dengan PWA & Capacitor wrapper nantinya) merupakan fondasi yang ideal dan tangguh.
2. **Local Storage Database Engine:**
   - *Keputusan:* Menggunakan **Dexie.js (IndexedDB wrapper teruji)** untuk entitas relasional (Photos, Collections, Sessions, Calendar, Settings) dan **IndexedDB Blobs / Object URLs** untuk data biner foto dan cache thumbnail.
3. **Logika Shuffle & Pin:**
   - *Keputusan:* Sudah terkunci (Design Locked) pada Master Spec 2.1 — Shuffle berbasis antrean tanpa pengulangan dengan proteksi slot pinned dan eksklusi foto yang sedang aktif.

### 2. NON-BLOCKER (Dapat Diputuskan / Disesuaikan Secara Iteratif)
1. **Aksen Warna Branding Spesifik:**
   - Spesifikasi menentukan *Dark Minimal* dengan *near-black* (`#090A0B`, `#0F1012`, `#17181C`). Aksen dapat menggunakan nuansa emas hangat / amber mewah (`#D97706` / `#F59E0B`) atau violet halus (`#6366F1`) yang kontras lembut terhadap latar belakang gelap.
2. **Tingkat Kompresi Thumbnail:**
   - Pembuatan canvas thumbnail di client dengan lebar maksimal 320px WebP/JPEG kualitas 0.8.
3. **Format Ekspor Backup:**
   - JSON terstruktur dengan `schema_version: 1` yang berisi metadata seluruh tabel Dexie.

---

## F. Kesimpulan Audit

Spesifikasi dalam workspace ini berada dalam status **sangat matang (Design Lock Candidate)**. Aturan bisnis untuk Player, Pin, Replace One, Shuffle No-Repeat, Session Timer, dan Kalender sudah sangat presisi dan terdefinisi dengan baik.

Langkah berikutnya adalah mendokumentasikan keputusan arsitektur di `ARCHITECTURE_PLAN.md` dan mulai menyiapkan visual prototype 12 layar utama.
