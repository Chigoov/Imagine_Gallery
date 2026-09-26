# 01_PRODUCT_REQUIREMENTS.md
# Product Requirements Document (PRD)
## Private Photo Fantasy Board

---

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan kebutuhan produk utama untuk aplikasi **Private Photo Fantasy Board**.

PRD ini menjadi acuan untuk:

- desain UI/UX,
- perancangan database,
- implementasi frontend,
- implementasi backend,
- sinkronisasi mobile dan web,
- pengujian fitur,
- serta pekerjaan AI coding agent.

Dokumen ini berfokus pada **apa yang harus dapat dilakukan aplikasi**, bukan detail implementasi kode.

---

# 2. Ringkasan Produk

Private Photo Fantasy Board adalah aplikasi private cross-platform untuk menampilkan 1–5 foto sekaligus dari koleksi pengguna secara dinamis.

Pengguna dapat:

- membaca foto dari folder lokal,
- menampilkan foto secara acak,
- mempertahankan foto tertentu menggunakan Pin,
- mengganti satu foto tanpa mengganti foto lain,
- memberi Like,
- memberi Favorite,
- menyimpan foto ke library internal,
- menyembunyikan foto dari shuffle,
- mengelompokkan foto ke dalam custom collection,
- menyimpan kombinasi tampilan,
- mencatat sesi penggunaan,
- melihat kalender frekuensi dan durasi sesi,
- menggunakan aplikasi melalui laptop maupun mobile.

Produk harus bersifat **privacy-first** dan **local-first**.

---

# 3. Masalah yang Diselesaikan

Pengguna memiliki banyak foto yang tersebar dalam folder dan membutuhkan cara yang lebih nyaman untuk:

1. melihat beberapa foto sekaligus,
2. mengacak foto tanpa pengulangan berlebihan,
3. mempertahankan gambar tertentu sementara gambar lain tetap berganti,
4. membangun collection pribadi dari foto yang disukai,
5. melanjutkan pengalaman yang sama melalui laptop dan mobile,
6. mengetahui frekuensi dan durasi sesi penggunaan,
7. menjaga data dan koleksi tetap privat.

---

# 4. Target Platform

## 4.1 Web Desktop

Target browser modern:

- Chrome
- Edge
- Firefox
- Safari

Fokus utama:

- folder scanning,
- bulk library management,
- player fullscreen,
- keyboard interaction,
- custom collections,
- session configuration.

## 4.2 Mobile Web / PWA

Target:

- Android browser
- iOS browser
- PWA installation

Fokus:

- player,
- gestures,
- like,
- favorite,
- keep,
- pin,
- replace,
- calendar,
- session tracking.

## 4.3 Native Wrapper

Tahap selanjutnya dapat menggunakan wrapper seperti Capacitor untuk Android/iOS.

---

# 5. Prinsip Produk

## 5.1 Photo First

Foto harus menjadi elemen utama.

Kontrol tidak boleh mengganggu pengalaman visual.

## 5.2 Private by Default

Default:

```text
Public Profile = OFF
Sharing = OFF
Search Indexing = OFF
Library = PRIVATE
Calendar = PRIVATE
```

## 5.3 Local First

Foto lokal tidak otomatis diunggah.

## 5.4 Non-Destructive

Aplikasi tidak boleh:

- menghapus file sumber tanpa tindakan eksplisit,
- mengganti nama file sumber secara otomatis,
- memindahkan file sumber secara otomatis.

## 5.5 Cross-Platform Consistency

Data inti harus menggunakan struktur yang sama di web dan mobile.

---

# 6. Persona Utama

## Personal User

Karakteristik:

- memiliki koleksi foto cukup besar,
- menggunakan laptop dan HP,
- membutuhkan tampilan privat,
- ingin mengatur koleksi berdasarkan preferensi sendiri,
- ingin melihat beberapa foto sekaligus,
- ingin melakukan tracking penggunaan.

---

# 7. User Journey Utama

```text
OPEN APP
    ↓
HOME
    ↓
SELECT SOURCE / COLLECTION
    ↓
CONFIGURE SESSION
    ↓
START SESSION
    ↓
PLAYER
    ↓
LIKE / FAVORITE / KEEP / PIN / REPLACE
    ↓
AUTO / MANUAL NEXT
    ↓
END SESSION
    ↓
SAVE SESSION
    ↓
CALENDAR UPDATED
```

---

# 8. Scope V1

V1 harus memiliki fitur berikut.

## 8.1 Source & Library

- memilih foto,
- memilih folder di platform yang mendukung,
- membaca metadata file,
- menyimpan referensi lokal,
- melihat seluruh foto,
- melihat Liked,
- melihat Favorites,
- melihat Kept,
- melihat Hidden.

## 8.2 Collections

- membuat collection,
- rename collection,
- hapus collection,
- menambahkan foto ke collection,
- menghapus foto dari collection,
- satu foto dapat berada di lebih dari satu collection.

## 8.3 Player

- display 1–5 foto,
- Auto Mode,
- Manual Mode,
- interval custom,
- Next,
- Previous,
- Play,
- Pause,
- fullscreen,
- responsive layout.

## 8.4 Core Photo Actions

- Like,
- Favorite,
- Keep,
- Hide,
- Pin,
- Unpin,
- Replace One Photo.

## 8.5 Shuffle

- No Repeat sebagai default,
- Pure Shuffle,
- Favorites Only,
- Unseen Only.

## 8.6 Session

- Start Session,
- End Session,
- Session Timer,
- History,
- Daily totals.

## 8.7 Calendar

- jumlah sesi per hari,
- total durasi per hari,
- detail sesi,
- manual entry,
- basic weekly/monthly stats.

## 8.8 Privacy

- private by default,
- app lock basic,
- local-only operation,
- clear sensitive previews when possible.

## 8.9 Backup

- export metadata,
- restore metadata.

---

# 9. Out of Scope V1

Tidak wajib di V1:

- AI recommendation,
- face detection,
- smart crop berbasis AI,
- similarity search canggih,
- cloud storage tanpa batas,
- public sharing,
- social features,
- multi-user collaboration,
- advanced analytics,
- multi-screen remote controller,
- advanced encrypted vault,
- image generation.

---

# 10. Functional Requirements

## FR-001 — Add Photo Source

User harus dapat memilih sumber foto.

### Acceptance Criteria

- user dapat memilih file,
- user dapat memilih folder jika browser/platform mendukung,
- aplikasi menampilkan jumlah foto yang ditemukan,
- file non-image diabaikan,
- proses gagal tidak boleh merusak library.

---

## FR-002 — Photo Library

Aplikasi harus menampilkan library foto.

### Acceptance Criteria

- thumbnail dapat dimuat,
- foto dapat difilter,
- status Like/Favorite/Hidden terlihat,
- pengguna dapat membuka detail foto.

---

## FR-003 — Create Collection

User harus dapat membuat custom collection.

### Acceptance Criteria

- collection memiliki nama,
- nama dapat diubah,
- collection dapat dihapus,
- menghapus collection tidak menghapus file asli.

---

## FR-004 — Multi-Collection Membership

Satu foto harus dapat berada di beberapa collection.

### Acceptance Criteria

- tidak membuat file fisik duplikat,
- remove dari satu collection tidak menghilangkan dari collection lain.

---

## FR-005 — 1–5 Photo Player

Player harus dapat menampilkan:

```text
1
2
3
4
5
```

foto sekaligus.

### Acceptance Criteria

- layout responsif,
- tidak ada slot kosong kecuali pool foto kurang dari jumlah slot,
- pergantian tidak menyebabkan flash putih/loading kosong.

---

## FR-006 — Pin

User harus dapat Pin foto tertentu.

### Acceptance Criteria

Foto Pin tidak berubah saat:

- Auto Next,
- Manual Next,
- Replace All.

Foto Pin berubah hanya jika:

- user Unpin lalu Next,
- user Replace foto tersebut secara eksplisit,
- user keluar sesi,
- user membuka composition berbeda.

---

## FR-007 — Replace One Photo

Setiap slot harus dapat diganti sendiri.

### Acceptance Criteria

- foto slot lain tidak berubah,
- pinned slot lain tetap,
- foto baru mematuhi filter dan shuffle pool.

---

## FR-008 — Like

User dapat memberi Like.

### Acceptance Criteria

- status tersimpan,
- foto muncul di Liked,
- Like dapat dibatalkan,
- tidak membuat file duplikat.

---

## FR-009 — Favorite

User dapat memberi Favorite.

### Acceptance Criteria

- foto tampil di Favorites,
- dapat dibatalkan,
- Favorite dapat digunakan sebagai shuffle source.

---

## FR-010 — Keep

User dapat menyimpan foto ke internal library.

### Acceptance Criteria

- foto dapat dipilih collection tujuan,
- nama file dapat mengikuti naming rule,
- file original tidak dimodifikasi.

---

## FR-011 — Hide

User dapat menyembunyikan foto.

### Acceptance Criteria

- foto keluar dari shuffle pool,
- foto tetap berada di Hidden,
- user dapat Restore.

---

## FR-012 — No Repeat Shuffle

Aplikasi harus mendukung shuffle tanpa pengulangan.

### Acceptance Criteria

- foto tidak diulang sampai queue habis,
- pinned photo tidak kembali ke queue aktif selama masih pinned,
- queue di-reshuffle setelah cycle selesai.

---

## FR-013 — Auto Mode

Player mengganti foto otomatis.

### Acceptance Criteria

- interval configurable,
- Play/Pause,
- Pin dihormati,
- timer dapat berhenti saat Focus Mode.

---

## FR-014 — Manual Mode

Foto hanya berganti saat pengguna menekan Next.

### Acceptance Criteria

- tidak ada timer aktif,
- Pin tetap dihormati,
- Previous dapat mengembalikan tampilan sebelumnya.

---

## FR-015 — Previous / Player History

Player menyimpan history.

### Acceptance Criteria

Minimal:

```text
20 display states
```

Ideal V1:

```text
50 display states
```

History mencakup:

- photo IDs,
- positions,
- pin state,
- layout.

---

## FR-016 — Session Timer

Timer mulai saat session dimulai.

### Acceptance Criteria

Timer berhenti ketika:

- End Session,
- session timeout akibat background,
- app/player ditutup sesuai rule.

Timer tidak menghitung saat:

- hanya membuka Settings,
- hanya membuka Library,
- hanya membuka Calendar.

---

## FR-017 — Background Rule

User dapat mengatur:

```text
Pause immediately
Stop after 2 min
Stop after 5 min
Keep counting
```

Default:

```text
Stop after 2 minutes
```

---

## FR-018 — Calendar

Aplikasi harus menampilkan session per tanggal.

### Acceptance Criteria

Setiap tanggal dapat menampilkan:

- session count,
- total duration.

Tap tanggal:

- daftar sesi,
- waktu mulai,
- waktu selesai,
- durasi.

---

## FR-019 — Manual Calendar Entry

User dapat menambahkan aktivitas secara manual.

### Acceptance Criteria

Field:

- date,
- time optional,
- duration optional,
- notes optional.

---

## FR-020 — Daily Dashboard

Home harus menampilkan ringkasan hari ini.

Contoh:

```text
TODAY

Sessions
2

Fantasy Time
31 min
```

---

## FR-021 — App Usage Tracking

Jika diaktifkan, aplikasi dapat membedakan:

```text
Fantasy Time
App Usage
```

Fantasy Time hanya saat player session aktif.

---

## FR-022 — File Naming

Kept photo dapat menggunakan:

```text
Original Filename
Collection + Number
Collection + Date + Number
Custom Template
```

Default:

```text
Original Filename
```

---

## FR-023 — Session Source Selection

User dapat memilih satu atau beberapa:

- collection,
- Favorites,
- Liked,
- All Photos.

---

## FR-024 — Focus Mode

Tap/click foto membuka Focus Mode.

### Acceptance Criteria

- fullscreen/large preview,
- Like,
- Favorite,
- Keep,
- Pin,
- zoom,
- back.

---

## FR-025 — Responsive UI

Semua fitur inti harus dapat digunakan pada:

- desktop,
- tablet,
- smartphone.

---

# 11. Non-Functional Requirements

## NFR-001 — Performance

Target awal:

- thumbnail terasa responsif,
- pergantian foto tanpa blank state yang terlihat,
- preload foto berikutnya,
- mampu menangani library besar secara bertahap.

Target library V1:

```text
5,000–20,000 references
```

tanpa harus memuat semua full-resolution image ke RAM sekaligus.

---

## NFR-002 — Privacy

Tidak ada upload otomatis tanpa izin user.

---

## NFR-003 — Reliability

Metadata harus tetap konsisten meskipun:

- aplikasi crash,
- browser ditutup,
- session berakhir tidak normal.

---

## NFR-004 — Data Integrity

Menghapus metadata tidak boleh menghapus original photo kecuali user secara eksplisit meminta.

---

## NFR-005 — Offline Capability

Core V1 harus tetap dapat bekerja secara lokal setelah resource aplikasi tersedia.

---

## NFR-006 — Accessibility

Minimal:

- keyboard navigation,
- readable controls,
- touch target cukup besar,
- label/icon tidak hanya bergantung pada warna.

---

# 12. Permissions

Aplikasi hanya meminta permission saat dibutuhkan.

Contoh:

```text
Photo access
Folder access
Notification
Biometric
Storage
```

Permission tidak boleh diminta semuanya saat onboarding.

---

# 13. Session State

Session aktif minimal menyimpan:

```text
session_id
source_pool
shuffle_order
current_index
current_slots
pin_state
mode
interval
layout
start_time
last_active_time
```

---

# 14. Error Handling

## Folder Tidak Tersedia

Jika source folder hilang:

```text
Source unavailable
```

Jangan langsung menghapus metadata.

## File Hilang

Tandai:

```text
Missing Source
```

## Kept File Rusak

Tandai error dan sediakan remove/re-import.

---

# 15. Privacy Requirements

## V1

- private by default,
- app lock,
- local storage,
- no public endpoints untuk foto user,
- session notes tidak muncul di notification preview.

## Later

- encrypted vault,
- encrypted backup,
- advanced biometric protection.

---

# 16. Home Screen Requirements

Home minimal memiliki:

```text
Today Summary
Start Session
Continue Session
Recent Collection
Library Shortcut
Calendar Shortcut
```

---

# 17. Player UI Requirements

Saat idle:

- kontrol minimal,
- foto dominan.

Saat hover/tap:

```text
Like
Favorite
Keep
Pin
Replace
More
```

Global controls:

```text
Previous
Play/Pause
Next
Photo Count
Timer
Exit
```

---

# 18. Mobile UI Requirements

Bottom navigation:

```text
Home
Player
Library
Calendar
```

Gesture dapat digunakan sebagai shortcut, tetapi semua aksi penting tetap harus punya tombol alternatif.

---

# 19. Desktop UI Requirements

Sidebar dapat berisi:

```text
Home
Library
Collections
Favorites
Liked
Saved
Calendar
Settings
```

Player fullscreen harus dapat menyembunyikan sidebar.

---

# 20. Calendar Requirements

Calendar tidak menggunakan leaderboard, streak reward, atau reward yang mendorong frekuensi.

Tujuannya:

- pencatatan,
- observasi pola,
- histori personal.

---

# 21. Statistics Requirements

Basic V1:

```text
Today Sessions
Today Duration
Week Sessions
Week Duration
Month Sessions
Month Duration
Active Days
Average Session
```

---

# 22. Backup Requirements

Backup metadata minimal mencakup:

```text
Collections
Tags
Likes
Favorites
Hidden
Session History
Calendar
Settings
Saved Compositions
```

Kept photo binary dapat dibuat opsi terpisah.

---

# 23. Success Criteria V1

V1 dianggap berhasil jika pengguna dapat:

1. menambahkan sumber foto,
2. membuat collection,
3. memulai session,
4. melihat 1–5 foto,
5. menggunakan Pin,
6. Replace satu slot,
7. Like/Favorite/Keep/Hide,
8. menjalankan shuffle tanpa repeat,
9. menyelesaikan session,
10. melihat session masuk ke Calendar,
11. melihat total session dan durasi harian,
12. menggunakan aplikasi dengan nyaman di laptop dan mobile.

---

# 24. Development Priority

## P0 — Must Have

```text
Library
Collections
Player 1–5
No Repeat
Pin
Replace
Like
Favorite
Keep
Hide
Session Timer
Calendar
Responsive UI
```

## P1 — Should Have

```text
Focus Mode
History
Session Preset
Saved Composition
Manual Calendar Entry
Backup
App Lock
```

## P2 — Nice to Have

```text
Weighted Shuffle
Heatmap
Advanced stats
Private Vault
Cloud Sync
Smart Crop
Duplicate Similarity
```

---

# 25. Definition of Done

Sebuah fitur dianggap selesai jika:

- UI tersedia,
- logic bekerja,
- state persist,
- error state ditangani,
- desktop diuji,
- mobile diuji,
- tidak merusak data,
- memiliki test dasar,
- acceptance criteria terpenuhi.

---

# 26. Status Dokumen

```text
Product Scope          DEFINED
V1 Requirements        DEFINED
Core Acceptance        DEFINED
Platform Targets       DEFINED

Detailed Feature Rules NEXT DOCUMENT
User Flow              NEXT
Database Finalization  NEXT
UI Wireframe           NEXT
```

