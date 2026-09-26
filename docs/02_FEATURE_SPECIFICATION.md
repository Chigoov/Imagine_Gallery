# 02_FEATURE_SPECIFICATION.md
# Detailed Feature Specification
## Private Photo Fantasy Board

---

# 1. Tujuan

Dokumen ini menjelaskan perilaku setiap fitur secara lebih detail.

Tujuannya adalah mengurangi ambiguitas ketika:

- UI dirancang,
- database dibuat,
- frontend diimplementasikan,
- backend dibuat,
- AI coding agent mulai bekerja,
- test case disusun.

---

# 2. Terminologi

## Source Photo

Foto yang masih berada di folder/perangkat asli.

## Kept Photo

Foto yang telah disalin ke storage internal aplikasi.

## Slot

Posisi visual tempat satu foto ditampilkan dalam Player.

## Display State

Kombinasi seluruh slot pada satu waktu.

## Session

Periode sejak user menekan Start Session sampai sesi berakhir.

## Collection

Kelompok virtual foto yang dibuat user.

## Pool

Sekumpulan foto yang memenuhi source/filter session.

## Queue

Urutan foto hasil shuffle yang akan ditampilkan.

---

# 3. PLAYER

## 3.1 Photo Count

Nilai:

```text
1
2
3
4
5
```

Perubahan photo count saat session aktif harus didukung.

### Jika jumlah diperbesar

Contoh:

```text
2 → 4
```

Dua slot baru diisi dari queue.

Pinned photos lama tidak berubah.

### Jika jumlah diperkecil

Contoh:

```text
5 → 3
```

Prioritas mempertahankan:

1. pinned photos,
2. selected/focused photo,
3. slot paling awal.

Foto yang dikeluarkan tidak dianggap Hidden.

---

# 4. PIN SYSTEM

## 4.1 State

Setiap slot:

```text
pinned = true / false
```

## 4.2 Pin Action

Saat user menekan Pin:

```text
slot.pinned = true
```

Foto tetap di slot tersebut.

## 4.3 Unpin

```text
slot.pinned = false
```

Foto tidak langsung berubah.

Foto baru dapat berubah pada Next berikutnya.

## 4.4 Next dengan Pin

Contoh:

```text
Slot 1 = A PINNED
Slot 2 = B
Slot 3 = C PINNED
Slot 4 = D
```

Next:

```text
Slot 1 = A
Slot 2 = E
Slot 3 = C
Slot 4 = F
```

## 4.5 Replace pada Pinned Slot

Jika user menekan Replace pada foto pinned:

Pilihan desain V1:

```text
Replace Anyway
```

Setelah Replace:

- foto baru tetap dapat mempertahankan status pinned.

Default behavior:

```text
Replace pinned slot
→ slot tetap PINNED
```

## 4.6 End Session

Pin temporary dihapus.

Saved Composition dapat menyimpan pin state secara terpisah.

---

# 5. REPLACE ONE PHOTO

## 5.1 Trigger

Button:

```text
↻
```

## 5.2 Rules

Replace harus:

- mengambil foto dari active pool,
- menghindari foto yang sedang tampil,
- menghormati Hidden,
- menghormati filter,
- menghormati No Repeat queue jika aktif.

## 5.3 Replace dan History

Replace menciptakan Display State baru di Player History.

---

# 6. LIKE

## 6.1 Toggle

```text
false → true
true → false
```

## 6.2 Persistence

Like harus tersimpan tanpa menunggu session selesai.

## 6.3 Collection Suggestion

Setelah Like, UI dapat menampilkan opsi non-intrusif:

```text
Liked ✓
Add to collection?
```

Tidak wajib memaksa user memilih.

---

# 7. FAVORITE

Favorite merupakan status lebih kuat dari Like tetapi tidak wajib membutuhkan Like.

Foto dapat:

```text
liked = false
favorite = true
```

Jika UX nanti ingin menyatukan, keputusan dapat direvisi.

---

# 8. KEEP

## 8.1 Purpose

Membuat salinan foto ke storage internal aplikasi.

## 8.2 Keep Flow

```text
Keep
↓
Choose Collection
↓
Choose Naming Rule
↓
Copy File
↓
Create Kept Record
↓
Link to Original Photo Metadata
```

## 8.3 Duplicate Keep

Jika file sudah pernah di-Keep:

Jangan otomatis membuat duplikat.

Tampilkan:

```text
Already saved
```

Pilihan:

```text
Add existing saved photo to another collection
Save duplicate anyway
Cancel
```

---

# 9. HIDE

## 9.1 Behavior

```text
hidden = true
```

Foto langsung dikeluarkan dari:

- active queue,
- future shuffle.

Jika foto sedang tampil:

Default:

```text
hide → replace slot immediately
```

Pinned status dilepas untuk foto tersebut.

## 9.2 Restore

Hidden page menyediakan:

```text
Restore
```

---

# 10. COLLECTION

## 10.1 Create

Input:

```text
name
optional description
```

## 10.2 Rename

Rename tidak mengubah physical filename kecuali user meminta rename file.

## 10.3 Delete

Delete collection:

- menghapus relasi,
- tidak menghapus foto,
- tidak menghapus Kept file.

## 10.4 Multi Membership

Photo ID dapat memiliki banyak `collection_id`.

---

# 11. FILE NAMING

## 11.1 Original

```text
IMG_1001.jpg
```

## 11.2 Collection Number

```text
Collection-A_001.jpg
```

Counter bersifat per collection.

## 11.3 Date Number

```text
Collection-A_20260923_001.jpg
```

## 11.4 Conflict Resolution

Jika filename sudah ada:

```text
_002
_003
...
```

atau gunakan internal UUID sambil mempertahankan display filename.

---

# 12. SHUFFLE ENGINE

## 12.1 No Repeat

Algoritme konsep:

```text
pool
↓
shuffle(pool)
↓
queue
↓
consume
↓
when empty:
reshuffle
```

## 12.2 Active Display Exclusion

Foto yang sedang tampil tidak boleh dipilih untuk slot lain.

## 12.3 Pinned Exclusion

Pinned photo tetap dianggap occupied.

Jangan dimasukkan sebagai candidate untuk slot lain.

## 12.4 End-of-Cycle Cooldown

Minimal V1:

foto terakhir pada cycle sebelumnya tidak boleh langsung muncul pada batch pertama cycle baru jika pool memungkinkan.

---

# 13. PURE SHUFFLE

Setiap replace/next memilih random candidate.

Tetap harus menghindari:

- currently displayed,
- Hidden,
- excluded filters.

---

# 14. FAVORITES ONLY

Pool:

```text
favorite = true
```

Jika jumlah pool lebih kecil dari jumlah slot:

Aplikasi menampilkan seluruh foto yang tersedia dan memberi informasi bahwa source terlalu kecil.

---

# 15. UNSEEN ONLY

Unseen didefinisikan:

```text
view_count = 0
```

Saat seluruh unseen habis:

Tampilkan:

```text
No unseen photos remaining
```

Jangan otomatis pindah mode tanpa persetujuan user.

---

# 16. SESSION PRESET

Preset menyimpan:

```text
name
photo_count
mode
interval
layout
shuffle_mode
background
source_filters optional
```

Preset tidak menyimpan session history.

---

# 17. SAVED COMPOSITION

Composition menyimpan:

```text
name
photo IDs
slot positions
layout
pin state
background
```

Jika source photo hilang:

slot ditandai:

```text
Missing Photo
```

User dapat:

```text
Replace Missing
Locate File
Remove Slot
```

---

# 18. AUTO MODE

## 18.1 Timer

Timer dimulai setelah transition selesai.

## 18.2 Pause

Pause menghentikan countdown.

## 18.3 Resume

Resume melanjutkan dari sisa countdown atau reset penuh.

Default:

```text
resume remaining countdown
```

---

# 19. AUTO PAUSE ON INTERACTION

Interaction yang dapat pause:

- Focus Mode,
- More menu,
- Keep dialog,
- Collection picker,
- Pin interaction opsional.

Default:

```text
Focus/Dialogs = pause
Simple Like/Favorite = no pause
```

---

# 20. MANUAL MODE

Tidak ada automatic countdown.

Next hanya terjadi melalui:

- Next button,
- keyboard shortcut,
- swipe.

---

# 21. PREVIOUS

History stack.

Contoh:

```text
state_001
state_002
state_003
```

Previous:

```text
003 → 002
```

Next setelah Previous memiliki dua opsi desain.

V1 default:

```text
History navigation
```

Jika user melakukan Replace/Pin/Like yang mengubah display state, history branch baru dibuat.

---

# 22. FOCUS MODE

## Enter

Tap/click foto.

## Effects

- player timer pause,
- foto diperbesar,
- action controls tersedia.

## Exit

Timer:

Default:

```text
resume remaining time
```

---

# 23. IMAGE FIT

## Cover

Mengisi seluruh slot, cropping diperbolehkan.

## Contain

Seluruh gambar terlihat, letterbox diperbolehkan.

## Smart Crop

V2.

---

# 24. LAYOUT

## Fixed

Layout tidak berubah.

## Dynamic

Layout dipilih berdasarkan:

- jumlah foto,
- orientation.

## Random

Layout dipilih random dari compatible layouts.

## Sequential

Layout menggunakan urutan preset.

---

# 25. TRANSITION

V1 minimal:

```text
Crossfade
None
```

V1.5:

```text
Fade
Slide
Zoom
Random
```

Pinned photos:

Default:

- tidak perlu fade out,
- unpinned slots saja yang transition.

---

# 26. PRELOADING

Sebelum countdown selesai:

aplikasi harus sudah mencoba decode/cache kandidat berikutnya.

Target:

```text
next display ready before switch
```

Jika gagal:

gunakan current display sedikit lebih lama daripada menampilkan blank state.

---

# 27. SESSION START

Flow:

```text
Select Source
↓
Validate pool
↓
Generate queue
↓
Generate first display
↓
Create Session
↓
start_time = now
↓
Timer Start
```

---

# 28. SESSION END

Trigger:

- End Session button,
- app close event jika dapat ditangani,
- background timeout,
- explicit stop.

Actions:

```text
set end_time
calculate duration
persist session
update calendar aggregate
clear temporary pins
```

---

# 29. SESSION TIMER

## Active Time

Timer hanya menghitung saat session status:

```text
ACTIVE
```

Possible state:

```text
ACTIVE
PAUSED
BACKGROUND_GRACE
ENDED
```

## Manual Pause

Keputusan V1:

Manual Play/Pause pada slideshow **tidak otomatis menghentikan session duration**.

Alasannya user mungkin masih melihat foto.

Jika user ingin menghentikan session duration:

gunakan:

```text
End Session
```

---

# 30. BACKGROUND TIMER

Saat app masuk background:

```text
ACTIVE
→ BACKGROUND_GRACE
```

Default:

```text
120 seconds
```

Jika user kembali sebelum 120 detik:

```text
ACTIVE
```

Jika tidak:

```text
ENDED
end_time = background_start + grace_period
```

---

# 31. APP USAGE

App Usage terpisah dari Session Duration.

App Usage hanya dihitung bila analytics lokal ini diaktifkan.

Tidak wajib menjadi bagian dari V1 minimum.

---

# 32. CALENDAR

## Daily Aggregate

Untuk setiap tanggal:

```text
session_count
total_duration
```

## Entry

Automatic session:

```text
manual = false
```

Manual entry:

```text
manual = true
```

---

# 33. MANUAL CALENDAR ENTRY

Minimal:

```text
date
count
```

Optional:

```text
time
duration
notes
```

Jika `count > 1` tanpa duration per sesi:

simpan sebagai aggregate manual record.

---

# 34. DAILY SUMMARY

Formula:

```text
Daily Sessions =
automatic session count
+
manual count
```

```text
Daily Duration =
automatic durations
+
manual durations that are provided
```

Manual entry tanpa duration tidak menambah total duration.

---

# 35. WEEKLY / MONTHLY STATS

## Sessions

Jumlah semua session.

## Active Days

Tanggal dengan minimal 1 session.

## Average Session

Hanya dihitung dari session yang memiliki duration.

Formula:

```text
total known duration / sessions with known duration
```

---

# 36. CALENDAR HEATMAP

V1.5.

Heat intensity berdasarkan session count.

Tidak menggunakan goal streak atau reward.

---

# 37. PLAYER STATE PERSISTENCE

Jika browser crash/reload:

Aplikasi boleh menawarkan:

```text
Resume previous session?
```

Data minimum:

```text
session ID
current display
queue
queue index
pin state
elapsed session time
```

---

# 38. MOBILE GESTURES

Suggested:

```text
Swipe Left = Next
Swipe Right = Previous
Double Tap = Like
Single Tap = Focus / Controls
Long Press = More
```

Gestures harus dapat dinonaktifkan jika mengganggu.

---

# 39. DESKTOP SHORTCUTS

Suggested:

```text
Space = Play / Pause
Right Arrow = Next
Left Arrow = Previous
1–5 = Photo Count
P = Pin selected
L = Like selected
F = Fullscreen
Esc = Back / Exit Fullscreen
```

Shortcut sensitif seperti Hide/Keep sebaiknya tidak terlalu mudah dipencet tanpa konfirmasi awal.

---

# 40. SOURCE VALIDATION

Saat source dipilih:

- cek akses,
- scan supported formats,
- hitung photo count,
- generate metadata.

Source status:

```text
Available
Permission Required
Missing
Offline
```

---

# 41. MISSING SOURCE FILE

Jika source photo hilang:

Metadata tidak langsung dihapus.

Status:

```text
missing = true
```

UI:

```text
Locate
Remove Reference
```

---

# 42. BACKUP

Backup metadata harus memiliki version.

Contoh:

```json
{
  "schema_version": 1
}
```

Restore harus memvalidasi versi.

---

# 43. PRIVACY MODE

Modes:

```text
Local Only
Sync Enabled
```

Default:

```text
Local Only
```

hingga user memilih sync.

---

# 44. APP LOCK

V1 minimum:

```text
PIN / Password
```

Mobile wrapper nanti:

```text
Biometric
```

---

# 45. PRIVACY SCREEN

Ketika mobile app background:

preview harus diusahakan:

```text
blur / neutral screen
```

Implementasi tergantung platform.

---

# 46. PANIC EXIT

V2.

Satu action:

```text
Stop session
Clear visible photos
Open neutral screen
```

Tidak menghapus data.

---

# 47. SEARCH

Search fields:

```text
filename
display name
collection
tag
```

Filter:

```text
liked
favorite
hidden
kept
orientation
```

---

# 48. TAGS

Tag tidak sama dengan Collection.

Collection = pengelompokan utama.

Tag = label fleksibel.

Satu photo:

```text
many collections
many tags
```

---

# 49. DUPLICATE DETECTION

V2.

Minimum method:

```text
file hash
```

Advanced:

```text
perceptual hash
```

---

# 50. MULTI-SOURCE SESSION

V1.5.

User dapat memilih:

```text
Collection A
+
Collection B
+
Favorites
```

Semua digabung menjadi satu deduplicated pool.

---

# 51. RESPONSIVE RULE

Player harus menentukan layout berdasarkan viewport.

Contoh:

Desktop 3-photo:

```text
1 large left
2 stacked right
```

Mobile:

```text
1 large top
2 split bottom
```

---

# 52. STATE PRIORITY RULES

Jika beberapa rule bertabrakan:

Prioritas:

```text
1. User explicit action
2. Privacy / data integrity
3. Pin state
4. Active filters
5. Shuffle mode
6. Layout automation
```

---

# 53. DATA DELETION RULE

Delete photo reference:

- hapus metadata aplikasi,
- jangan menghapus original file secara default.

Delete Kept File:

harus meminta confirmation.

---

# 54. SESSION SOURCE CHANGES

Jika user mengganti source saat session aktif:

Default V1:

```text
End current session
Start new session
```

Jangan mengubah pool diam-diam di tengah session.

---

# 55. PHOTO COUNT CHANGE DURING SESSION

Diizinkan.

Event disimpan ke session history bila diperlukan.

Calendar tidak perlu menyimpan setiap perubahan layout.

---

# 56. NOTES

Session notes optional.

Default:

```text
OFF / empty
```

Tidak pernah diwajibkan.

---

# 57. NOTIFICATION

Tidak dibutuhkan untuk V1 core.

Jika ditambahkan:

notification text harus generik.

---

# 58. ANALYTICS

Tidak ada third-party analytics wajib.

Jika analytics produk digunakan:

- jangan kirim filename,
- jangan kirim image data,
- jangan kirim collection name,
- jangan kirim notes.

---

# 59. PERFORMANCE STRATEGY

Thumbnail:

gunakan generated/cached thumbnails.

Full image:

load hanya untuk active display dan nearby queue.

Jangan preload ribuan original image.

---

# 60. PLAYER MEMORY LIMIT

History:

Default:

```text
50 states
```

Dapat disesuaikan kemudian.

---

# 61. FAILURE RECOVERY

Jika app crash:

- metadata terakhir tersimpan,
- session dapat dipulihkan,
- tidak ada file original rusak.

---

# 62. FEATURE DEPENDENCY MAP

```text
Photo Source
    ↓
Library
    ↓
Collections / Filters
    ↓
Session Pool
    ↓
Shuffle Queue
    ↓
Player
    ├── Pin
    ├── Replace
    ├── Like
    ├── Favorite
    ├── Keep
    └── Hide
    ↓
Session Timer
    ↓
Calendar
```

---

# 63. V1 ACCEPTANCE SCENARIO

Scenario:

1. User membuka aplikasi di laptop.
2. User memilih folder berisi 500 foto.
3. App membaca 500 foto.
4. User membuat Collection A.
5. User memilih 100 foto ke Collection A.
6. User mulai session dari Collection A.
7. User memilih 4-photo display.
8. User memilih Auto 7 detik.
9. Foto A/B/C/D tampil.
10. User Pin A.
11. User Replace C.
12. C berubah menjadi E.
13. Timer berjalan.
14. A tetap.
15. B/E/D berubah.
16. User Like salah satu foto.
17. User Keep foto ke Collection Saved.
18. User mengakhiri session.
19. Calendar bertambah satu session.
20. Duration masuk ke total hari tersebut.

Jika seluruh langkah ini bekerja, core flow V1 dianggap valid.

---

# 64. OPEN DECISIONS

Masih harus diputuskan pada dokumen UI/Architecture:

- final app name,
- account system,
- sync provider,
- storage provider,
- local database choice,
- PWA vs mobile wrapper timeline,
- exact thumbnail strategy,
- browser folder permission persistence,
- exact encryption design,
- visual theme.

---

# 65. Next Documents

Setelah ini:

```text
03_USER_FLOW.md
04_DATABASE_SCHEMA.md
05_UI_UX_STRUCTURE.md
06_API_SPECIFICATION.md
07_PRIVACY_SECURITY.md
08_DEVELOPMENT_ROADMAP.md
09_AGENT_IMPLEMENTATION_PROMPT.md
10_TESTING_CHECKLIST.md
```

