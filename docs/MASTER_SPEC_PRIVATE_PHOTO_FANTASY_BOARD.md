# MASTER SPECIFICATION — PRIVATE PHOTO FANTASY BOARD

## 1. Gambaran Umum

Aplikasi ini adalah aplikasi **private cross-platform** untuk menampilkan, mengacak, mengelola, dan menyimpan koleksi foto pribadi dalam bentuk tampilan dinamis 1–5 foto sekaligus.

Aplikasi ditujukan untuk penggunaan melalui:

- Web di laptop/desktop
- Mobile browser
- PWA
- Aplikasi mobile berbasis satu codebase yang sama
- Penggunaan lokal maupun sinkronisasi antar-perangkat

Fokus utama aplikasi:

1. Menampilkan 1–5 foto secara dinamis.
2. Mengacak foto dari folder atau library tertentu.
3. Menahan foto tertentu dengan fitur Pin agar tidak ikut berganti.
4. Menyukai, menyimpan, menyembunyikan, dan mengelompokkan foto.
5. Menyimpan komposisi beberapa foto.
6. Mencatat sesi penggunaan melalui timer dan kalender.
7. Menjaga privasi pengguna.
8. Mendukung penggunaan dari laptop dan mobile.

---

# 2. Prinsip Produk

## 2.1 Private by Default

Semua library pengguna bersifat privat.

Default:

- Public profile: OFF
- Public sharing: OFF
- Search indexing: OFF
- Session history: Private
- Calendar: Private
- Library: Private

Pengguna dapat memilih mode:

- Local Only
- Sync Mode

---

## 2.2 Local First

Foto dari folder laptop tidak langsung di-upload ke server.

Aplikasi hanya membaca foto dari folder yang dipilih pengguna.

Yang dapat disinkronkan:

- Metadata
- Likes
- Favorites
- Collections
- Tags
- Session history
- Calendar
- Settings
- Saved / Kept photos
- Saved compositions

---

# 3. Platform

## 3.1 Laptop / Desktop

Aplikasi berjalan melalui web browser.

Fokus penggunaan:

- Membaca folder foto
- Bulk import
- Mengelola banyak foto
- Fullscreen player
- Keyboard shortcut
- Membuat collection
- Mengatur session preset
- Mengelola kalender dan statistik

---

## 3.2 Mobile

Aplikasi dapat berjalan sebagai:

- Responsive Web App
- PWA
- Aplikasi Android/iOS

Fokus penggunaan:

- Melihat foto
- Like
- Favorite
- Keep
- Pin
- Replace
- Swipe
- Focus Mode
- Calendar
- Session tracking
- App Lock / Biometric Lock

---

# 4. Struktur Navigasi Utama

```text
HOME
│
├── PLAYER
│   ├── 1–5 Photo Display
│   ├── Auto Mode
│   ├── Manual Mode
│   ├── Pin / Unpin
│   ├── Replace One Photo
│   ├── Like
│   ├── Favorite
│   ├── Keep
│   ├── Hide
│   ├── Focus Mode
│   ├── Previous / History
│   └── Save Composition
│
├── LIBRARY
│   ├── Source Photos
│   ├── Liked
│   ├── Favorites
│   ├── Kept / Saved
│   ├── Hidden
│   ├── Collections
│   ├── Tags
│   └── Saved Compositions
│
├── CALENDAR
│   ├── Daily Sessions
│   ├── Manual Entry
│   ├── Session Duration
│   ├── Daily Total
│   ├── Weekly Statistics
│   ├── Monthly Statistics
│   └── Heatmap
│
└── SETTINGS
    ├── Display
    ├── Shuffle
    ├── File Naming
    ├── Sync
    ├── Privacy
    ├── Session Timer
    └── Backup
```

---

# 5. Photo Source System

## 5.1 Folder Source

Pengguna dapat memilih folder dari laptop.

Contoh:

```text
D:\Photos\Collection
```

Aplikasi melakukan scan terhadap:

- JPG
- JPEG
- PNG
- WEBP
- format foto lain yang didukung

Informasi yang dicatat:

- File ID
- Filename
- Path
- Width
- Height
- Orientation
- Date Added
- Last Viewed
- View Count
- Like Status
- Favorite Status
- Hidden Status
- Collection Membership

---

## 5.2 Mobile Photo Source

Di mobile pengguna dapat memilih:

- Gallery
- Files
- App Library

---

## 5.3 Source Photo vs Kept Photo

### Source Photo

Foto tetap berada pada folder/perangkat asli.

Aplikasi hanya membaca foto tersebut.

### Kept Photo

Foto disalin ke library internal aplikasi.

Tujuan:

- Tersedia di perangkat lain
- Tetap tersedia walaupun folder sumber dipindahkan
- Bisa dimasukkan ke koleksi internal

---

# 6. Photo Actions

Setiap foto memiliki aksi:

```text
♡ Like
★ Favorite
↓ Keep
📌 Pin
↻ Replace
✕ Hide
⋯ More
```

---

## 6.1 Like

Like hanya menyimpan metadata.

Tidak membuat duplikat file.

Foto otomatis masuk:

```text
Liked
```

---

## 6.2 Favorite

Favorite menandai foto sebagai prioritas tinggi.

Foto otomatis masuk:

```text
Favorites
```

---

## 6.3 Keep

Keep menyimpan salinan foto ke library internal aplikasi.

Pengguna dapat menentukan collection tujuan.

---

## 6.4 Hide

Foto tidak dihapus dari perangkat.

Foto hanya dikeluarkan dari shuffle pool.

Dapat dikembalikan melalui:

```text
Hidden
```

---

# 7. Custom Collections / Folder System

Pengguna dapat membuat folder/koleksi sendiri.

Contoh:

```text
MY COLLECTIONS

📁 Collection A
📁 Collection B
📁 Portrait
📁 Favorites Mix
📁 Random
```

Satu foto dapat berada dalam beberapa collection sekaligus.

Contoh:

```text
Photo_8291.jpg
│
├── Collection A
├── Portrait
└── Favorite
```

Tidak dibuat duplikat file untuk setiap collection.

---

# 8. File Naming System

Saat foto disimpan melalui Keep, pengguna dapat memilih aturan nama file.

## 8.1 Keep Original Filename

```text
IMG_8291.jpg
```

## 8.2 Collection + Number

Template:

```text
{collection}_{number}
```

Output:

```text
Collection-A_001.jpg
Collection-A_002.jpg
Collection-A_003.jpg
```

## 8.3 Collection + Date + Number

Template:

```text
{collection}_{date}_{number}
```

Output:

```text
Collection-A_2026-09-23_001.jpg
```

## 8.4 Custom Naming

Contoh:

```text
{collection}_{year}_{number}
```

Default:

```text
Keep original filename
```

Aplikasi dapat menggunakan nama tampilan internal tanpa mengubah nama file asli.

---

# 9. Dynamic Photo Display

Pengguna dapat memilih jumlah foto:

```text
[1] [2] [3] [4] [5]
```

---

## 9.1 Display 1 Photo

```text
┌──────────────────────────┐
│                          │
│          PHOTO           │
│                          │
└──────────────────────────┘
```

---

## 9.2 Display 2 Photos

```text
┌─────────────┬─────────────┐
│   PHOTO 1   │   PHOTO 2   │
└─────────────┴─────────────┘
```

---

## 9.3 Display 3 Photos

Desktop:

```text
┌─────────────────┬─────────┐
│                 │ PHOTO 2 │
│     PHOTO 1     ├─────────┤
│                 │ PHOTO 3 │
└─────────────────┴─────────┘
```

Mobile:

```text
┌──────────────────┐
│     PHOTO 1      │
├─────────┬────────┤
│ PHOTO 2 │ PHOTO 3│
└─────────┴────────┘
```

---

## 9.4 Display 4 Photos

```text
┌────────────┬────────────┐
│  PHOTO 1   │  PHOTO 2   │
├────────────┼────────────┤
│  PHOTO 3   │  PHOTO 4   │
└────────────┴────────────┘
```

---

## 9.5 Display 5 Photos

Menggunakan dynamic mosaic layout.

---

# 10. Layout Modes

Pengguna dapat memilih:

```text
Fixed
Dynamic
Random
Sequential
```

## Fixed

Layout tidak berubah.

## Dynamic

Aplikasi memilih layout terbaik berdasarkan jumlah foto dan orientasi.

## Random

Layout berubah secara acak.

## Sequential

Layout berpindah berdasarkan urutan preset.

---

# 11. Pin System

Pin merupakan fitur utama.

Foto yang di-pin tidak ikut berganti.

Contoh:

```text
A 📌     B
C        D 📌
```

Setelah shuffle:

```text
A 📌     E
F        D 📌
```

Foto A dan D tetap.

Foto B dan C diganti.

---

## 11.1 Pin Rules

Pin berlaku pada:

- Auto Shuffle
- Manual Next
- Replace All
- Timer transition

Pin tidak berlaku pada:

- Remove Photo
- Unpin
- End Session
- Load Different Saved Composition

---

## 11.2 Unpin All

Tersedia tombol:

```text
Unpin All
```

---

## 11.3 Temporary Pin

Default.

Pin hanya berlaku selama sesi aktif.

---

## 11.4 Permanent / Saved Pin

Jika komposisi disimpan, posisi foto dan status pin dapat ikut disimpan.

---

# 12. Replace One Photo

Setiap slot foto memiliki tombol:

```text
↻
```

Fungsi:

Mengganti satu foto saja tanpa mengubah foto lain.

Contoh:

```text
A   B
C   D
```

Tekan Replace pada C:

```text
A   B
E   D
```

Sangat berguna ketika beberapa foto sudah cocok.

---

# 13. Saved Composition

Pengguna dapat menyimpan kombinasi foto dan layout.

Yang disimpan:

- Foto
- Posisi
- Layout
- Pin Status
- Background
- Display Mode

Contoh:

```text
Saved Composition 01
```

---

# 14. Shuffle System

## 14.1 No Repeat

Default.

Foto tidak muncul kembali sampai seluruh pool selesai.

---

## 14.2 Pure Shuffle

Semua foto memiliki peluang sama.

---

## 14.3 Discovery

Lebih sering menampilkan foto:

- Belum pernah dilihat
- Jarang dilihat

---

## 14.4 Liked Mix

Prioritas lebih besar untuk foto yang pernah diberi Like.

---

## 14.5 Favorites Only

Hanya menampilkan Favorites.

---

## 14.6 Unseen Only

Hanya foto yang belum pernah tampil.

---

# 15. Weighted Shuffle

Fitur lanjutan.

Contoh bobot:

```text
Normal Photo       1.0x
Liked Photo        1.5x
Favorite           2.0x
Recently Viewed    0.3x
```

---

# 16. Recent Cooldown

Foto yang baru muncul tidak boleh langsung muncul lagi.

Contoh:

```text
Recent Cooldown = 50 photos
```

---

# 17. Session Source Filter

Sebelum mulai sesi:

```text
SOURCE

☑ Collection A
☑ Favorites
☐ Collection B
☐ All Photos
```

Pool dapat berasal dari beberapa collection sekaligus.

---

# 18. Session Preset

Pengguna dapat menyimpan konfigurasi sesi.

Contoh:

```text
Preset: Night Session

Photos: 3
Interval: 8 seconds
Layout: Dynamic
Shuffle: No Repeat
Background: Black
```

---

# 19. Player Modes

## 19.1 Auto Mode

Foto berganti otomatis.

```text
Photo Set
↓
5 seconds
↓
Next Photo Set
```

---

## 19.2 Manual Mode

Foto hanya berganti saat pengguna menekan:

```text
Next
```

---

# 20. Timer / Interval

Pengguna dapat menentukan waktu pergantian.

Contoh:

```text
3 sec
5 sec
7 sec
10 sec
15 sec
30 sec
```

Dapat menggunakan custom interval.

---

# 21. Auto Pause on Interaction

Saat pengguna:

- Tap foto
- Hover
- Membuka menu
- Masuk Focus Mode
- Menekan Like
- Menekan Save

Timer dapat otomatis pause.

Setelah idle beberapa detik, timer dapat berjalan kembali.

---

# 22. Focus Mode

Tap foto untuk membuka fullscreen.

Fitur:

- Like
- Favorite
- Keep
- Pin
- Zoom
- Pan
- Back to Layout

Session di belakang dapat otomatis pause.

---

# 23. Zoom & Pan

Desktop:

- Mouse wheel
- Click + drag

Mobile:

- Pinch zoom
- Drag

---

# 24. Player History

Aplikasi menyimpan tampilan sebelumnya.

Contoh:

```text
History depth: 50 screens
```

Pengguna dapat menekan:

```text
Previous
```

beberapa kali.

History menyimpan:

- Photo Set
- Layout
- Pinned Photos
- Timestamp

---

# 25. Session Queue

Pengguna dapat menambahkan foto tertentu ke antrean.

```text
Add to Queue
```

Foto akan muncul pada beberapa tampilan berikutnya.

---

# 26. Session Bookmark

Pengguna dapat menyimpan sesi aktif.

Data yang disimpan:

- Shuffle order
- Current position
- Pin status
- Layout
- Timer
- Selected collections
- Current photos

Kemudian:

```text
Continue Session
```

---

# 27. Session Timer

Session Timer hanya menghitung waktu ketika sesi fantasy aktif.

Contoh:

```text
START SESSION
10:12

CLOSE PLAYER
10:37

Session Duration = 25 min
```

---

# 28. App Usage vs Fantasy Time

Keduanya dibedakan.

Contoh:

```text
TODAY

Fantasy Sessions    3
Fantasy Time        1h 14m
App Usage           1h 42m
```

## Fantasy Time

Hanya dihitung ketika Player Session aktif.

## App Usage

Menghitung waktu aplikasi sedang digunakan secara umum.

---

# 29. Background Session Rules

Jika aplikasi masuk background:

```text
Pause immediately
Stop after 2 minutes
Stop after 5 minutes
Keep counting
```

Default:

```text
Stop after 2 minutes
```

Tujuan:

Mencegah sesi tercatat berjam-jam karena aplikasi terlupa ditutup.

---

# 30. Calendar

Kalender mencatat:

- Jumlah session per hari
- Total durasi
- Waktu session
- Manual entries
- Optional notes

Contoh:

```text
23 September

Sessions: 3
Total Time: 1h 14m
```

---

# 31. Daily Session Detail

Saat tanggal ditekan:

```text
23 SEPTEMBER

Session 1
10:12 – 10:37
25 min

Session 2
16:20 – 16:38
18 min

Session 3
23:05 – 23:36
31 min
```

---

# 32. Manual Calendar Entry

Pengguna dapat menambahkan session manual.

Form:

```text
Date
Time
Duration
Count
Notes
```

Semua kecuali tanggal dapat dibuat opsional.

---

# 33. Calendar Heatmap

Visual aktivitas bulanan.

Contoh:

```text
░ ░ █ ░ ██ ░
█ ░ ░ ███ ░
```

Semakin tinggi aktivitas, semakin kuat indikator.

Tidak menggunakan sistem reward.

---

# 34. Statistics

## Daily

- Sessions
- Total Duration
- Average Session

## Weekly

- Total Sessions
- Total Duration
- Active Days

## Monthly

- Total Sessions
- Total Duration
- Active Days
- Average Session
- Average per Active Day
- Most Used Layout

---

# 35. Dashboard Home

Contoh:

```text
TODAY
23 September

Fantasy Sessions
      2

Fantasy Time
    31 min

[ + Add Session ]

[ START PLAYER ]
```

---

# 36. Library Structure

```text
LIBRARY

All Photos
Liked
Favorites
Kept
Hidden

COLLECTIONS
├── Collection A
├── Collection B
├── Portrait
└── Custom Folder

SAVED
├── Saved Compositions
└── Session Presets
```

---

# 37. Search

Pengguna dapat mencari berdasarkan:

- Filename
- Collection
- Tag
- Favorite
- Liked
- Date
- Orientation

---

# 38. Tags

Satu foto dapat memiliki banyak tag.

Contoh:

```text
Portrait
Favorite
Collection A
Landscape
Custom Tag
```

---

# 39. Smart Filter

Session dapat menggunakan filter:

```text
Include:
Collection A
Favorites

Exclude:
Hidden

Orientation:
Any

Only Unseen:
OFF
```

---

# 40. Image Fit

Pilihan:

```text
Cover
Contain
Smart Crop
```

Smart Crop menjadi fitur lanjutan.

---

# 41. Orientation Detection

Aplikasi mendeteksi:

- Portrait
- Landscape
- Square

Dynamic Layout dapat menyesuaikan berdasarkan orientasi.

---

# 42. Transition

Pilihan:

```text
Crossfade
Fade
Slide
Zoom
None
Random
```

Default:

```text
Crossfade
```

---

# 43. Preloading

Aplikasi selalu menyiapkan foto berikutnya.

Contoh:

```text
Current:
Photo 1–5

Background preload:
Photo 6–10
```

Tujuan:

- Menghindari loading kosong
- Membuat pergantian lebih halus

---

# 44. Background & Ambience

Pengguna dapat memilih:

```text
Black
Dark Gray
Blurred Photo
Neutral
Custom
```

Pengaturan:

- Gap
- Border Radius
- Shadow
- Blur
- Background opacity

---

# 45. Keyboard Controls

Laptop:

```text
Space = Play / Pause
→ = Next
← = Previous
1–5 = Number of Photos
L = Like
S = Save / Keep
H = Hide
P = Pin
F = Fullscreen
Esc = Exit
```

---

# 46. Mobile Gestures

Contoh:

```text
Swipe Left = Next
Swipe Right = Previous
Double Tap = Like
Tap = Focus
Hold = More Options
```

---

# 47. Fullscreen Display

Dalam fullscreen:

- Navbar disembunyikan
- Cursor dapat auto-hide
- Control overlay hanya muncul saat interaksi
- Foto menjadi fokus utama

---

# 48. Multi-Device Sync

Mode Sync:

```text
Laptop
   ↕
Private Backend
   ↕
Mobile
```

Yang disinkronkan:

- Likes
- Favorites
- Tags
- Collections
- Kept Photos
- Calendar
- Session History
- Settings
- Saved Compositions

---

# 49. Local Only Mode

Tidak ada foto atau metadata yang dikirim ke server.

Laptop dan mobile memiliki library terpisah.

---

# 50. Private Vault

Fitur lanjutan.

Untuk foto Keep tertentu.

Kemampuan:

- Encrypted storage
- App Lock
- Biometric unlock

---

# 51. App Lock

Pilihan:

- PIN
- Password
- Biometrics
- Face ID / Fingerprint

---

# 52. Privacy Screen

Ketika aplikasi berada di background:

- Preview recent apps dibuat blur
- Atau blank screen

---

# 53. Discreet Mode

Fitur opsional.

Kemampuan:

- Nama tampilan aplikasi netral
- Icon netral
- Notification text netral
- Home screen netral

---

# 54. Panic Exit

Shortcut untuk:

```text
Stop Session
Hide Photos
Return to Neutral Screen
```

---

# 55. Metadata Privacy

Saat Keep:

Aplikasi dapat menawarkan:

```text
Remove EXIF metadata
Remove GPS metadata
```

---

# 56. Notification Privacy

Notifikasi tidak perlu menampilkan isi pribadi.

Contoh:

```text
Personal tracker updated
```

Bukan deskripsi sesi secara detail.

---

# 57. Duplicate Detection

Aplikasi dapat mendeteksi:

- Filename duplicate
- File hash duplicate
- Similar image

Tindakan:

```text
Ignore
Merge Metadata
Keep Both
```

---

# 58. Backup

Backup dapat mencakup:

- Likes
- Favorites
- Collections
- Tags
- Calendar
- Settings
- Session History
- Saved Compositions

Format backup dapat dibuat terenkripsi.

---

# 59. Restore

Pengguna dapat memulihkan backup ke perangkat baru.

---

# 60. Offline Mode

Aplikasi tetap dapat digunakan tanpa internet untuk:

- Local library
- Player
- Session timer
- Calendar
- Local settings

Sync dilanjutkan saat internet tersedia.

---

# 61. Device Specific Settings

Contoh:

Desktop:

```text
Default Photos = 5
Fullscreen = ON
```

Mobile:

```text
Default Photos = 2
Portrait Layout = ON
```

Library dan akun tetap sama.

---

# 62. Session Flow

```text
OPEN APP
   ↓
HOME
   ↓
SELECT COLLECTION / SOURCE
   ↓
SELECT SESSION PRESET
   ↓
SET PHOTOS 1–5
   ↓
SET AUTO / MANUAL
   ↓
START SESSION
   ↓
SESSION TIMER START
   ↓
PHOTO PLAYER
   ↓
LIKE / FAVORITE / KEEP / PIN / REPLACE / HIDE
   ↓
NEXT / AUTO CHANGE
   ↓
END / CLOSE / BACKGROUND TIMEOUT
   ↓
SESSION TIMER STOP
   ↓
SAVE SESSION HISTORY
   ↓
UPDATE CALENDAR
```

---

# 63. Photo Player Logic

Contoh 4 foto:

```text
A   B
C   D
```

User:

```text
Pin A
Pin D
Like B
Replace C
```

Result:

```text
A 📌    B ♡
E       D 📌
```

Saat timer berikutnya:

```text
A 📌    F
G       D 📌
```

---

# 64. Data Model Awal

## User

```text
id
email
settings
privacy_mode
created_at
```

## Photo

```text
id
source_type
original_path
internal_path
filename
display_name
width
height
orientation
hash
created_at
last_viewed
view_count
liked
favorite
hidden
kept
```

## Collection

```text
id
name
description
created_at
```

## PhotoCollection

```text
photo_id
collection_id
```

## Tag

```text
id
name
```

## PhotoTag

```text
photo_id
tag_id
```

## Session

```text
id
start_time
end_time
duration
display_count
photo_count
device
mode
```

## SessionPhoto

```text
session_id
photo_id
viewed_at
liked_during_session
pinned
```

## CalendarEntry

```text
id
date
session_id
manual
duration
notes
```

## SavedComposition

```text
id
name
layout
photo_slots
pin_state
settings
```

## SessionPreset

```text
id
name
photo_count
interval
layout
shuffle_mode
background
```

---

# 65. Suggested Technical Architecture

## Frontend

```text
Next.js
React
TypeScript
```

## Responsive UI

```text
Desktop
Mobile
Tablet
```

## Mobile Packaging

Possible:

```text
PWA
Capacitor
```

## Database

Local:

```text
SQLite / IndexedDB
```

Cloud:

```text
PostgreSQL
```

## Storage

Local:

```text
Local Files
App Storage
```

Cloud:

```text
Private Object Storage
```

---

# 66. MVP / V1

Fitur prioritas:

- Folder Scan
- Photo Library
- 1–5 Photo Display
- Auto Mode
- Manual Mode
- No Repeat Shuffle
- Pin
- Unpin
- Replace One Photo
- Like
- Favorite
- Keep
- Hide
- Collections
- File naming option
- Focus Mode
- Previous
- Session Timer
- Daily Calendar
- Manual Session Entry
- Daily Duration
- Session History
- App Lock
- Responsive Laptop + Mobile UI
- Basic Backup

---

# 67. V1.5

Tambahan:

- Dynamic Layout
- Multiple Transitions
- Saved Compositions
- Session Presets
- Tags
- Search
- Smart Filters
- Calendar Heatmap
- Weekly Statistics
- Monthly Statistics
- Privacy Screen
- Offline Mode
- Multi-source session

---

# 68. V2

Tambahan:

- Weighted Shuffle
- Discovery Mode
- Recent Cooldown
- Private Vault
- Encrypted Backup
- Cross-device Sync
- Duplicate Detection
- Smart Crop
- Orientation-aware Layout
- Metadata Privacy
- Panic Exit
- Discreet Mode

---

# 69. V3

Tambahan:

- Multi-device controller
- Advanced sync
- Multiple display targets
- Smart recommendation based on user-defined preferences
- Advanced statistics
- Optional AI-assisted organization
- Advanced image similarity detection

---

# 70. Core Feature Priorities

Fitur yang menjadi identitas utama aplikasi:

```text
1. Dynamic 1–5 Photo Display
2. Pin / Lock Photo
3. Replace One Photo
4. Like / Favorite / Keep
5. Custom Collections
6. No Repeat Shuffle
7. Session Timer
8. Calendar
9. Private Library
10. Cross-platform Access
```

---

# 71. Product Identity

Aplikasi bukan sekadar slideshow.

Aplikasi dirancang sebagai:

> Private cross-platform visual session application dengan dynamic 1–5 photo display, pin system, custom collections, smart shuffle, session tracking, calendar, dan privacy-first library.

---

# 72. Design Principles

UI harus:

- Minimal
- Dark-friendly
- Tidak mengganggu tampilan foto
- Cepat
- Responsive
- Private
- Mudah digunakan dengan satu tangan di mobile
- Mudah digunakan dengan keyboard di laptop

Prioritas:

```text
Photo First
Controls Second
Settings Third
```

---

# 73. Hal yang Belum Dikunci

Beberapa hal masih perlu dimatangkan sebelum development:

- Nama aplikasi
- Branding
- Warna utama
- Default layout
- Default interval
- Apakah sync menjadi fitur default atau opsional
- Struktur storage cloud
- Sistem login
- Sistem enkripsi
- Implementasi PWA vs native mobile wrapper
- Batas ukuran Keep Library
- Apakah statistik dapat dinonaktifkan sepenuhnya
- Apakah SessionPhoto history perlu menyimpan semua foto atau hanya metadata minimum
- Apakah rename file berlaku ke file fisik atau hanya display name

---

# 74. Next Development Documents

Dokumen lanjutan yang sebaiknya dibuat setelah file ini:

```text
01_PRODUCT_REQUIREMENTS.md
02_FEATURE_SPECIFICATION.md
03_USER_FLOW.md
04_DATABASE_SCHEMA.md
05_UI_UX_STRUCTURE.md
06_API_SPECIFICATION.md
07_PRIVACY_SECURITY.md
08_DEVELOPMENT_ROADMAP.md
09_AGENT_IMPLEMENTATION_PROMPT.md
10_TESTING_CHECKLIST.md
```

---

# 75. Status

Status saat ini:

```text
Concept Definition     DONE
Core Feature List      DONE
App Structure          DONE
Session Logic          DONE
Calendar Concept       DONE
Collection Concept     DONE
Pin System             DONE
Cross-platform Concept DONE

UI/UX Detailed Design  NEXT
Database Finalization  NEXT
Technical Architecture NEXT
Implementation         LATER
```

---

Dokumen ini merupakan **master concept specification awal** dan dapat terus diperbarui selama proses perancangan aplikasi.
