# ARCHITECTURE_PLAN.md
# Architecture Decision & Technical Design Document
## Private Photo Fantasy Board (Local-First / Privacy-First)

**Version:** 1.0  
**Target:** Desktop Web, Mobile Web, PWA, with Native Capacitor Path  
**Status:** Architecture Locked  

---

## 1. Executive Architecture Summary

Private Photo Fantasy Board dirancang dengan pola **Local-First, Offline-Ready, dan Privacy-Centric Architecture**. Aplikasi tidak memiliki ketergantungan wajib pada server cloud untuk seluruh alur kerja intinya (V1). Seluruh pemrosesan foto, penyimpanan metadata, pengacakan, logika pin, manajemen sesi, dan agregasi kalender berjalan langsung di perangkat pengguna (client-side).

```text
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│        React 19 / TypeScript / Tailwind CSS / Radix    │
│  (Desktop Sidebar, Mobile Bottom Nav, High-Fid Player) │
└───────────────────────────┬────────────────────────────┘
                            │ (Hooks & Reactive State)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   APPLICATION SERVICES                 │
│  (SessionService, LibraryService, CalendarService)     │
└───────────────────────────┬────────────────────────────┘
                            │ (Orchestration & Rules)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   DOMAIN CORE ENGINES                  │
│       (Zero-Dependency Pure TypeScript Modules)        │
│                                                        │
│  ├── ShuffleEngine       (No-Repeat Shuffled Queue)    │
│  ├── PinEngine           (Slot Position & Persistence) │
│  ├── PlayerStateEngine   (1–5 Slots, History Stack)    │
│  ├── SessionTimer        (Active Time, 120s Grace)     │
│  └── CalendarAggregator  (Daily Totals & Stat Crunch)  │
└───────────────────────────┬────────────────────────────┘
                            │ (Repository Interface)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                    │
│    (PhotoRepository, CollectionRepository, SessionRepo)│
└───────────────────────────┬────────────────────────────┘
                            │ (Data Access)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   STORAGE & PERSISTENCE                │
│    ├── Dexie.js / IndexedDB (Metadata & Relations)     │
│    ├── Blob Store / OPFS    (Binary & Thumbnails)      │
│    └── LocalStorage         (App Lock PIN Hash & Prefs)│
└────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Selection

### 2.1 Frontend Framework & Build Tool
- **Language:** TypeScript 5.x (Strict mode, no `any`, exhaustive type checking).
- **Core Framework:** React 18/19.
- **Build Tool:** Vite.
  - *Alasan Pemilihan:* Memberikan kecepatan Hot Module Replacement (HMR) sub-100ms, output build SPA murni yang mudah di-bundle sebagai PWA offline, serta portabilitas langsung ke wrapper mobile Capacitor tanpa server runtime Node.js yang rumit.
- **Styling & Tokens:** Tailwind CSS dengan variabel CSS Semantic Design Tokens (`--bg-player`, `--bg-app`, `--bg-surface`, `--text-primary`, `--accent`, dsb.) sesuai spesifikasi `11_DESIGN_SYSTEM.md`.
- **Icons:** Lucide React (konsisten, ringan, dan lengkap untuk seluruh ikon media dan player).
- **Transitions / Motion:** Tailwind CSS transitions + Framer Motion / CSS Keyframes terkontrol (durasi 180–220ms sesuai `13_INTERACTION_ANIMATION_SPEC.md`).

### 2.2 Local Storage Strategy
- **Metadata Database:** **Dexie.js** (IndexedDB).
  - Skema tabel terindeks untuk query cepat: `photos`, `collections`, `photo_collections`, `sessions`, `session_display_states`, `session_slots`, `calendar_entries`, `saved_compositions`, `settings`.
- **Photo Data & Thumbnail Storage:**
  - **IndexedDB Blobs:** Menyimpan thumbnail resolusi rendah/menengah (320px) yang dibuat secara instan di sisi klien via Canvas API untuk memastikan scrolling library hingga 20.000 referensi tetap mulus.
  - **Local File References / Object URLs:** Untuk foto sumber lokal yang dipilih via File System Access API (`FileSystemFileHandle`) atau File Input, URL objek sementara (`URL.createObjectURL`) digunakan untuk rendering tanpa menduplikasi file asli berukuran gigabyte.
  - **Kept Photos Storage:** Foto yang secara eksplisit di-Keep disalin ke IndexedDB Blob Store internal di bawah ID UUID unik.
- **Security & Preferences:**
  - `localStorage` terisolasi untuk PIN hash (SHA-256) dan preferensi sesi cepat.

### 2.3 Mobile & PWA Strategy
- **Tahap 1 (Sekarang):** Responsive Web + PWA (Web App Manifest, Service Worker untuk caching asset statis dan offline shell).
- **Tahap 2:** Integrasi Capacitor untuk akses native file system, biometric unlock (FaceID/Fingerprint), dan background lifecycle hooks.

### 2.4 Backend Strategy
- **V1 (Sekarang):** **Murni Local-First (No Server Required)**.
- **Future Sync (V2):** Kontrak interface service disiapkan kompatibel dengan REST API / WebSocket sync engine yang didefinisikan pada `06_API_SPECIFICATION.md`.

---

## 3. Module & Directory Architecture

Struktur folder terorganisasi secara modular untuk memisahkan domain logic dari presentation:

```text
src/
├── app/                        # Main Application Root & Shell
│   ├── App.tsx                 # Root Component with Provider composition
│   ├── main.tsx                # React DOM Mount
│   └── routes.tsx              # View router (Home, Player, Library, Calendar, Settings)
│
├── components/                 # Shared UI Design System Components
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Toast.tsx
│   │   ├── Badge.tsx
│   │   ├── SegmentedControl.tsx
│   │   └── Card.tsx
│   ├── layout/
│   │   ├── AppShell.tsx        # Shell responsive (Desktop Sidebar + Mobile Bottom Nav)
│   │   ├── DesktopSidebar.tsx
│   │   ├── MobileBottomNav.tsx
│   │   └── TopHeader.tsx
│   └── feedback/
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       └── LockScreen.tsx
│
├── domain/                     # Pure Business Logic (Zero React Dependencies)
│   ├── shuffle/
│   │   ├── ShuffleEngine.ts    # No-repeat queue & active exclusions
│   │   └── types.ts
│   ├── player/
│   │   ├── PlayerStateEngine.ts# 1-5 slot layout logic & history
│   │   ├── PinEngine.ts        # Pin retention & replace mechanics
│   │   └── types.ts
│   ├── session/
│   │   ├── SessionTimer.ts     # Active countdown & 120s background grace
│   │   └── types.ts
│   └── calendar/
│       ├── CalendarAggregator.ts# Daily/Weekly/Monthly metrics calculation
│       └── types.ts
│
├── features/                   # Feature Views & UI Controllers
│   ├── home/
│   │   ├── HomeScreen.tsx
│   │   └── components/
│   ├── player/
│   │   ├── PlayerScreen.tsx
│   │   ├── components/
│   │   │   ├── PhotoSlot.tsx
│   │   │   ├── PlayerControlBar.tsx
│   │   │   ├── FocusModeModal.tsx
│   │   │   ├── SaveCompositionModal.tsx
│   │   │   └── SessionSummaryModal.tsx
│   │   └── layouts/            # 1, 2, 3, 4, 5 photo layout components
│   ├── library/
│   │   ├── LibraryScreen.tsx
│   │   ├── components/PhotoCard.tsx
│   │   └── components/AddSourceModal.tsx
│   ├── collections/
│   │   ├── CollectionsScreen.tsx
│   │   ├── CollectionDetailScreen.tsx
│   │   └── components/KeepPhotoSheet.tsx
│   ├── calendar/
│   │   ├── CalendarScreen.tsx
│   │   ├── components/MonthGrid.tsx
│   │   ├── components/DayDetailSheet.tsx
│   │   └── components/ManualEntryModal.tsx
│   ├── settings/
│   │   └── SettingsScreen.tsx
│   └── lock/
│       └── AppLockModal.tsx
│
├── repositories/               # Data Access & Database Abstraction
│   ├── db.ts                   # Dexie database declaration & migrations
│   ├── PhotoRepository.ts      # Photo CRUD, search, filter
│   ├── CollectionRepository.ts # Collection membership management
│   ├── SessionRepository.ts    # Session & history persistence
│   └── CalendarRepository.ts   # Calendar entries & aggregations
│
├── services/                   # Application Orchestration Services
│   ├── LibraryService.ts
│   ├── SessionService.ts
│   ├── BackupService.ts
│   └── AppLockService.ts
│
├── hooks/                      # Custom React Hooks
│   ├── usePlayer.ts
│   ├── useSessionTimer.ts
│   ├── useLibrary.ts
│   ├── useCalendar.ts
│   └── useAppLock.ts
│
├── types/                      # Common Domain Entities & Interfaces
│   ├── photo.ts
│   ├── collection.ts
│   ├── session.ts
│   ├── calendar.ts
│   └── settings.ts
│
└── utils/                      # Helper Functions
    ├── formatters.ts
    ├── thumbnail.ts
    └── platform.ts
```

---

## 4. Core Domain Engines Specification

### 4.1 ShuffleEngine (`domain/shuffle/ShuffleEngine.ts`)
- **Tanggung Jawab:** Mengelola pool kandidat foto, mengacak antrean (Fisher-Yates shuffle), dan memastikan **No Repeat** sampai siklus habis.
- **Aturan Ketat:**
  1. `No Repeat`: Semua foto dalam pool diacak ke dalam antrean. Foto yang ditarik dikeluarkan dari antrean hingga antrean habis, baru kemudian di-reshuffle.
  2. `Exclusion`: Foto yang sedang tampil di layar (`activeSlotPhotoIds`) dan foto yang sedang di-pin **TIDAK PERNAH** boleh dipilih sebagai kandidat untuk slot lain dalam display yang sama.
  3. `End-of-Cycle Cooldown`: Foto terakhir dari siklus sebelumnya dihindari agar tidak langsung muncul di batch pertama siklus baru jika ukuran pool mencukupi (> jumlah slot).

```typescript
export interface IShuffleEngine {
  setPool(photoIds: string[]): void;
  getNextCandidates(count: number, excludeIds: Set<string>): string[];
  replaceOne(currentSlotPhotoId: string, excludeIds: Set<string>): string | null;
  resetQueue(): void;
  getQueueRemaining(): number;
}
```

### 4.2 PinEngine (`domain/player/PinEngine.ts`)
- **Tanggung Jawab:** Menjaga kekekalan foto pada slot yang ditandai pinned.
- **Aturan Wajib:**
  1. Slot bertanda `pinned: true` tidak berubah saat:
     - Auto Next
     - Manual Next
     - Global Refresh / Shuffle
  2. Ketika pengguna menekan **Replace** pada slot bertanda pinned:
     - Foto di slot tersebut diganti dengan kandidat baru.
     - Slot **TETAP BERSTATUS PINNED** (`pinned = true`).
  3. Mengubah jumlah slot (misal 5 -> 3): slot yang pinned diprioritaskan untuk dipertahankan.
  4. End Session membersihkan status pin sementara.

### 4.3 PlayerStateEngine (`domain/player/PlayerStateEngine.ts`)
- **Tanggung Jawab:** Mengatur state display 1–5 foto, transisi layout, dan tumpukan histori (Previous navigation hingga 50 state).
- **Aturan Wajib:**
  1. Mendukung slot 1, 2, 3, 4, dan 5 foto dengan tata letak adaptif desktop & mobile.
  2. `Previous`: Mengembalikan display state, posisi slot, dan pin state persis seperti sebelumnya.
  3. `Replace One`: Mengganti tepat 1 slot, menciptakan snapshot histori baru, tanpa memicu transisi visual pada slot lain.

### 4.4 SessionTimer (`domain/session/SessionTimer.ts`)
- **Tanggung Jawab:** Menghitung waktu aktif sesi visual (*Fantasy Time*).
- **Aturan Wajib:**
  1. Dimulai saat `Start Session` ditekan dan tampilan pertama siap.
  2. Pause pada slideshow (berhenti berganti foto otomatis) **TIDAK** menghentikan hitungan durasi sesi.
  3. Saat aplikasi masuk background:
     - Masuk status `BACKGROUND_GRACE` (toleransi 120 detik).
     - Jika kembali dalam 120 detik: kembali ke `ACTIVE` dan durasi terus bertambah.
     - Jika melebihi 120 detik: sesi dihentikan otomatis (`ENDED`) dengan durasi = waktu background + toleransi.
  4. Focus Mode menjeda countdown pergantian foto berikutnya, namun tidak menjeda akumulasi durasi sesi.

### 4.5 CalendarAggregator (`domain/calendar/CalendarAggregator.ts`)
- **Tanggung Jawab:** Menghitung agregasi harian, mingguan, dan bulanan.
- **Aturan Wajib:**
  1. `Daily Sessions = Sesi Otomatis + Jumlah Input Manual`.
  2. `Daily Duration = Total Durasi Sesi Otomatis + Durasi Input Manual (jika diisi)`.
  3. Input manual tanpa durasi hanya menambah jumlah sesi tanpa mendistorsi total menit.
  4. Rata-rata durasi hanya dihitung dari sesi yang memiliki nilai durasi valid.

---

## 5. UI Layout Strategy (1–5 Photos)

Player membagi ruang layar (85–95% area pandang) dengan background `#090A0B`:

| Jumlah Foto | Desktop Layout | Mobile Portrait Layout |
| :---: | :--- | :--- |
| **1 Foto** | 1 Slot Fullscreen Centered (Contain/Cover) | 1 Slot Fullscreen Centered |
| **2 Foto** | Horizontal Split (50% kiri / 50% kanan) | Vertical Split (50% atas / 50% bawah) |
| **3 Foto** | 1 Hero Besar Kiri (60%), 2 Stacked Kanan (40%) | 1 Hero Besar Atas (60%), 2 Split Bawah (40%) |
| **4 Foto** | 2 × 2 Balanced Grid | 2 × 2 Balanced Grid |
| **5 Foto** | Asymmetric Mosaic (1 Hero + 4 Compact Grid) | 1 Hero Atas + 4 Grid di Bawah |

Setiap slot memiliki kontrol mengambang dengan latar *soft glass* (`rgba(23, 24, 28, 0.75)` + `backdrop-blur-md`):
- Pinned badge di sudut kanan atas.
- Bar aksi muncul saat hover (desktop) atau tap (mobile): `♡ (Like)`, `★ (Favorite)`, `↓ (Keep)`, `📌 (Pin)`, `↻ (Replace)`.

---

## 6. Privacy & Security Architecture

1. **Local-First Default:**
   - Tidak ada panggilan jaringan eksternal untuk pengunggahan gambar.
   - PWA Service Worker hanya melayani cache aplikasi statis.
2. **App Lock:**
   - Opsi PIN 4–6 digit.
   - Disimpan menggunakan hash SHA-256 di storage lokal.
   - Terkunci otomatis setelah interval inaktivitas yang ditentukan (misal 5 menit).
3. **Data Safety Non-Destructive:**
   - Operasi hapus foto dari library hanya menghapus relasi metadata di Dexie. File asli pada disk sistem tidak pernah disentuh.
4. **Metadata Backup:**
   - Fasilitas ekspor ke file JSON tunggal berversi (`schema_version: 1`), memungkinkan pengguna mem-backup atau memindahkan metadata ke perangkat lain secara privat.

---

## 7. Verifikasi dan Rencana Kerja

Rencana ini siap dieksekusi melalui urutan kerja:
1. **Scaffold Project Foundation:** Vite + React + TypeScript + Tailwind CSS dengan token desain `11_DESIGN_SYSTEM.md`.
2. **Visual Prototype 12 Layar:** Membangun seluruh tampilan dan interaksi UI inti dengan data mock/dummy.
3. **Domain Engines Implementation:** Membangun module murni TypeScript untuk Shuffle, Pin, PlayerState, SessionTimer, dan CalendarAggregator.
4. **Local Database & Repositories:** Mengintegrasikan Dexie.js untuk persistensi IndexedDB.
5. **Integration & Testing:** Pengujian menyeluruh terhadap acceptance criteria dan testing checklist `10_TESTING_CHECKLIST.md`.
