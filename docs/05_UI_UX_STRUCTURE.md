# 05_UI_UX_STRUCTURE.md
# UI / UX Design Structure — Private Photo Fantasy Board

## 1. Design Direction

Aplikasi harus terasa:
- private,
- minimal,
- immersive,
- modern,
- dark-friendly,
- photo-first.

Bukan dashboard bisnis yang penuh tabel.

Prioritas visual:
```text
1. Photo
2. Current action
3. Session controls
4. Secondary navigation
```

---

# 2. Design Language

Default visual direction:
```text
Dark Minimal
Soft Glass Layer
Large Image Surface
Low Visual Noise
Rounded Controls
Subtle Motion
```

Avoid:
- warna terlalu ramai,
- terlalu banyak border,
- terlalu banyak teks di Player,
- modal berlapis,
- kontrol permanen menutupi foto.

---

# 3. Main App Shell — Desktop

```text
┌──────────────────────────────────────────────────────────┐
│ Logo / App Name                    Search     Profile ⚙  │
├──────────────┬───────────────────────────────────────────┤
│ Home         │                                           │
│ Library      │                                           │
│ Collections  │               CONTENT                     │
│ Favorites    │                                           │
│ Liked        │                                           │
│ Calendar     │                                           │
│ Settings     │                                           │
└──────────────┴───────────────────────────────────────────┘
```

Sidebar dapat collapse.

---

# 4. Main App Shell — Mobile

```text
┌──────────────────────────┐
│       Current Page       │
├──────────────────────────┤
│                          │
│        CONTENT           │
│                          │
├──────────────────────────┤
│ Home Player Library Cal  │
└──────────────────────────┘
```

Bottom navigation max 4–5 item.

---

# 5. Home Screen

Desktop:
```text
┌─────────────────────────────────────────────────────┐
│ Good evening                                        │
│                                                     │
│ TODAY                                               │
│ Sessions 2        Fantasy Time 31 min              │
│                                                     │
│ [ START SESSION ]    [ CONTINUE ]                  │
│                                                     │
│ Recent Collections                                 │
│ [A] [B] [Favorites] [Saved]                       │
│                                                     │
│ Recent Activity / Calendar Preview                 │
└─────────────────────────────────────────────────────┘
```

Mobile:
```text
TODAY
2 sessions
31 min

[ Start Session ]

Continue last session

Recent Collections
[A] [B] [Fav]

Calendar preview
```

---

# 6. Start Session Screen

Structure:
```text
Source
Photo Count
Play Mode
Interval
Layout
Shuffle
Background
Preview
Start
```

UI rule:
- advanced controls collapsed by default,
- primary setup harus bisa selesai dalam <30 detik.

---

# 7. Player — Desktop

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌──────────────────┬──────────────────────────────┐   │
│   │                  │                              │   │
│   │      PHOTO A     │          PHOTO B             │   │
│   │      📌          │                              │   │
│   ├──────────────────┼──────────────────────────────┤   │
│   │      PHOTO C     │          PHOTO D             │   │
│   └──────────────────┴──────────────────────────────┘   │
│                                                         │
│    ◀      ⏸      ▶         4 photos        00:04        │
└─────────────────────────────────────────────────────────┘
```

Saat hover slot:
```text
♡  ★  ↓  📌  ↻  ⋯
```

---

# 8. Player — Mobile

2-photo:
```text
┌──────────────────────┐
│                      │
│       PHOTO A        │
│                      │
├──────────────────────┤
│                      │
│       PHOTO B        │
│                      │
├──────────────────────┤
│ ◀   ⏸   ▶    2   ⋯  │
└──────────────────────┘
```

3-photo:
```text
┌──────────────────────┐
│       PHOTO A        │
├───────────┬──────────┤
│ PHOTO B   │ PHOTO C  │
└───────────┴──────────┘
```

---

# 9. Photo Slot Interaction

Default:
```text
Photo only
```

Hover/tap:
```text
Like
Favorite
Keep
Pin
Replace
More
```

Pinned indicator harus:
- kecil,
- jelas,
- tidak menutupi subjek.

---

# 10. Pin Visual State

Unpinned:
```text
📌 outline
```

Pinned:
```text
📌 filled + subtle indicator
```

Optional:
- thin highlight around pinned slot.

Jangan gunakan animasi berlebihan.

---

# 11. Replace Interaction

Desktop:
- hover → ↻

Mobile:
- tap controls → Replace
- optional swipe-up quick action later.

Replace harus terasa instan.

---

# 12. Focus Mode

```text
┌────────────────────────────────────────┐
│ ←                                      │
│                                        │
│               PHOTO                    │
│                                        │
│                                        │
│     ♡     ★     ↓     📌     ⋯          │
└────────────────────────────────────────┘
```

Background gelap.

Tap sekali:
- show/hide controls.

---

# 13. Library Screen

Desktop:
```text
Filters / Search
─────────────────────────────────────────
All | Liked | Favorites | Kept | Hidden

[img] [img] [img] [img] [img]
[img] [img] [img] [img] [img]
```

Thumbnail grid responsive.

---

# 14. Collection Screen

Header:
```text
Collection Name
274 photos

[Start Session] [Add Photos] [⋯]
```

Grid:
```text
[img] [img] [img]
[img] [img] [img]
```

---

# 15. Save to Collection Sheet

Mobile:
```text
┌──────────────────────┐
│ Save to collection   │
│                      │
│ ○ Collection A       │
│ ○ Collection B       │
│ ○ Favorites Mix      │
│                      │
│ + New Collection     │
│                      │
│       [ Save ]       │
└──────────────────────┘
```

Desktop:
- compact modal/popover.

---

# 16. Calendar

Month view:
```text
SEPTEMBER 2026

 M   T   W   T   F   S   S
     1   2   3   4   5   6
 7   8   9  10  11  12  13
14  15  16  17  18  19  20
21  22 23×3 24  25  26  27
28  29  30
```

Day marker:
```text
×3
```
or a small intensity dot.

---

# 17. Calendar Detail

```text
23 September

3 sessions
1h 14m

10:12 – 10:37   25m
16:20 – 16:38   18m
23:05 – 23:36   31m

[ + Add ]
```

---

# 18. Statistics

Keep simple.

Desktop:
```text
This Week
Sessions      9
Total Time    2h 48m
Active Days   5
Avg Session   18m
```

Avoid:
- competitive streaks,
- ranking,
- badges,
- pressure UI.

---

# 19. Settings Structure

```text
SETTINGS

Player
- Default photo count
- Default interval
- Auto pause
- History depth

Library
- Naming rules
- Thumbnail quality
- Duplicate handling

Session
- Background timeout
- App usage tracking

Privacy
- App lock
- Privacy screen
- Local only / Sync

Backup
- Export
- Restore

Advanced
- Cache
- Reset settings
```

---

# 20. Empty States

Library empty:
```text
No photos yet
[ Add Photos ]
```

Collection empty:
```text
This collection is empty
[ Add Photos ]
```

Calendar empty:
```text
No sessions recorded for this day
[ Add Entry ]
```

---

# 21. Error States

Source unavailable:
```text
Source unavailable
[ Locate Folder ]
[ Remove Source ]
```

Photo missing:
```text
Photo unavailable
[ Locate ]
[ Remove Reference ]
```

---

# 22. Loading States

Avoid full-screen spinner.

Use:
- skeleton thumbnails,
- cached preview,
- progressive image loading.

Player:
- keep previous photo visible until next ready.

---

# 23. Motion

Recommended:
```text
Crossfade 180–300ms
Control fade 120–180ms
Modal 180–240ms
```

Pinned slot:
- no full fade when other slots change.

---

# 24. Theme

Default:
```text
Dark
```

Optional:
```text
System
Light
Dark
```

Photo player can always force dark/black background.

---

# 25. Typography

Use clean sans-serif.

Rules:
- large numerals for session duration,
- short labels,
- no long explanatory copy in Player.

---

# 26. Touch Targets

Minimum:
```text
44×44 px
```

for mobile interactive controls.

---

# 27. Desktop Density

Library can be denser.

Player must remain spacious.

---

# 28. Mobile One-Hand Use

Primary controls should be near lower area:
```text
Like
Next
Pause
More
```

Avoid essential actions only at top corners.

---

# 29. Privacy UX

App background:
```text
neutral/blur preview
```

App lock:
```text
minimal lock screen
```

Do not show private collection names on lock screen notifications.

---

# 30. Design System Components

Need:
```text
Button
IconButton
PhotoCard
PhotoSlot
BottomSheet
Modal
CollectionChip
TagChip
CalendarDay
SessionCard
StatCard
Toast
Tooltip
ProgressTimer
PlayerControlBar
```

---

# 31. Desktop Breakpoints

Suggested:
```text
>= 1280 large desktop
1024–1279 desktop
768–1023 tablet
< 768 mobile
```

---

# 32. Player Layout Presets

Need preset layouts for 1–5 photos.

Each count should have:
- desktop variant,
- mobile variant.

---

# 33. Visual Priority

Player:
```text
Photo > Pin State > Immediate Controls > Timer > Metadata
```

Library:
```text
Photo > Collection > Search > Secondary Metadata
```

Calendar:
```text
Date > Session Count > Duration > Notes
```

---

# 34. MVP Design Pages

Must design first:
```text
1. Home
2. Add Source
3. Library
4. Collection Detail
5. Start Session
6. Player Desktop
7. Player Mobile
8. Focus Mode
9. Save/Keep Sheet
10. Calendar
11. Day Detail
12. Settings
13. App Lock
```

---

# 35. Design Deliverables

Before coding UI:
```text
Low-fidelity wireframes
Desktop player states
Mobile player states
Collection flow
Calendar flow
Component inventory
Responsive rules
Interaction states
```

---

# 36. Design Acceptance

Design dianggap siap jika:
- semua core flow punya layar,
- Pin state jelas,
- Replace mudah ditemukan,
- Player tidak terasa penuh,
- mobile nyaman satu tangan,
- calendar mudah dibaca,
- privacy state tersedia,
- responsive behavior sudah ditentukan.
