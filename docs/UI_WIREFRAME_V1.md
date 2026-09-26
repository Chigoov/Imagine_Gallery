# UI_WIREFRAME_V1.md
# Visual Wireframe V1 — Private Photo Fantasy Board

Version: 1.0
Purpose: Low-fidelity design blueprint before high-fidelity UI.

---

# 1. Home — Desktop

```text
┌────────────────────────────────────────────────────────────────────┐
│ APP NAME                                  Search     Lock     User │
├──────────────┬─────────────────────────────────────────────────────┤
│ Home         │ TODAY                                               │
│ Library      │                                                     │
│ Collections  │ Sessions                  Fantasy Time              │
│ Favorites    │    2                         31 min                 │
│ Liked        │                                                     │
│ Calendar     │ [ START SESSION ]      [ CONTINUE SESSION ]        │
│ Settings     │                                                     │
│              │ RECENT COLLECTIONS                                  │
│              │ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│              │ │  A       │ │  B       │ │ Favorite │             │
│              │ │ 126 img  │ │ 84 img   │ │ 43 img   │             │
│              │ └──────────┘ └──────────┘ └──────────┘             │
│              │                                                     │
│              │ CALENDAR PREVIEW                                    │
│              │  M  T  W  T  F  S  S                               │
│              │     •     ••    •                                   │
└──────────────┴─────────────────────────────────────────────────────┘
```

---

# 2. Home — Mobile

```text
┌────────────────────────────┐
│ Private Board          🔒  │
├────────────────────────────┤
│ TODAY                      │
│                            │
│ 2 sessions      31 min     │
│                            │
│ [   START SESSION   ]      │
│                            │
│ Continue Session           │
│ [ 3 photos • paused ]      │
│                            │
│ Recent Collections         │
│ [ A ] [ B ] [ Fav ]        │
│                            │
│ Calendar Preview           │
│ •  ••   •                  │
├────────────────────────────┤
│ Home  Player  Library Cal  │
└────────────────────────────┘
```

---

# 3. Add Source

```text
┌──────────────────────────────────────┐
│ Add Photos                           │
│                                      │
│ [ Select Folder ]                    │
│ [ Select Files  ]                    │
│                                      │
│ Recently used sources                │
│ D:\Photos\Collection A              │
│ D:\Photos\Collection B              │
│                                      │
│                      [ Cancel ]       │
└──────────────────────────────────────┘
```

---

# 4. Library — Desktop

```text
┌──────────────┬─────────────────────────────────────────────────────┐
│ Library      │ LIBRARY                              + Add Photos   │
│ Collections  │ Search...                                           │
│ Favorites    │                                                     │
│ Liked        │ All  Liked  Favorites  Kept  Hidden                │
│ Calendar     │                                                     │
│              │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│              │ │ IMG │ │ IMG │ │ IMG │ │ IMG │ │ IMG │          │
│              │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
│              │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│              │ │ IMG │ │ IMG │ │ IMG │ │ IMG │ │ IMG │          │
│              │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
└──────────────┴─────────────────────────────────────────────────────┘
```

---

# 5. Collection Detail

```text
Collection A
126 photos

[ Start Session ] [ Add Photos ] [ ... ]

Filter: All   Sort: Added

[img][img][img][img][img]
[img][img][img][img][img]
```

---

# 6. Start Session — Desktop

```text
┌─────────────────────────────────────────────────────┐
│ START SESSION                                       │
│                                                     │
│ Source                                              │
│ [ Collection A ▼ ]                                 │
│                                                     │
│ Photos on screen                                    │
│ [1] [2] [3] [4] [5]                               │
│                                                     │
│ Mode                                                │
│ (●) Auto   ( ) Manual                              │
│                                                     │
│ Interval                                            │
│ [ 7 sec ▼ ]                                        │
│                                                     │
│ Layout                                              │
│ [ Dynamic ▼ ]                                      │
│                                                     │
│ Shuffle                                             │
│ [ No Repeat ▼ ]                                    │
│                                                     │
│           [ Preview ]   [ START ]                  │
└─────────────────────────────────────────────────────┘
```

---

# 7. Player — Desktop 4 Photos

```text
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│ ┌────────────────────────┬────────────────────────┐                │
│ │                        │                        │                │
│ │        PHOTO A         │        PHOTO B         │                │
│ │          📌            │                        │                │
│ │                        │                        │                │
│ ├────────────────────────┼────────────────────────┤                │
│ │                        │                        │                │
│ │        PHOTO C         │        PHOTO D         │                │
│ │                        │                        │                │
│ └────────────────────────┴────────────────────────┘                │
│                                                                    │
│  ◀            ⏸             ▶        4 photos       00:04         │
└────────────────────────────────────────────────────────────────────┘
```

Hover Photo C:
```text
♡   ★   ↓   📌   ↻   ⋯
```

---

# 8. Player — Mobile 3 Photos

```text
┌────────────────────────────┐
│                            │
│          PHOTO A           │
│             📌             │
│                            │
├──────────────┬─────────────┤
│   PHOTO B    │   PHOTO C   │
│              │             │
└──────────────┴─────────────┘

        00:04

   ◀     ⏸     ▶

[ Like ] [ Pin ] [ Replace ] [ ⋯ ]
```

Controls can collapse.

---

# 9. Focus Mode

```text
┌────────────────────────────────────────────────────┐
│ ←                                                  │
│                                                    │
│                                                    │
│                    PHOTO                           │
│                                                    │
│                                                    │
│        ♡       ★       ↓       📌       ⋯           │
└────────────────────────────────────────────────────┘
```

---

# 10. Keep Sheet — Mobile

```text
┌────────────────────────────┐
│ Save Photo                 │
│                            │
│ Save to                    │
│ ○ Saved                    │
│ ○ Collection A             │
│ ○ Collection B             │
│                            │
│ + New Collection           │
│                            │
│ Naming                     │
│ Original Filename ▼        │
│                            │
│ [        SAVE        ]     │
└────────────────────────────┘
```

---

# 11. Saved Composition

```text
SAVED COMPOSITIONS

┌──────────────┐
│ A      B 📌  │
│ C 📌   D     │
└──────────────┘
Composition 01

[ Open ] [ Edit ] [ Delete ]
```

---

# 12. Calendar — Month

```text
SEPTEMBER 2026

M    T    W    T    F    S    S
     1    2    3    4    5    6
7    8    9   10   11   12   13
14  15   16   17   18   19   20
21  22  23×3  24   25   26   27
28  29   30

Today:
2 sessions
31 min

[ + Add Entry ]
```

---

# 13. Calendar Day Detail

```text
23 September

3 Sessions
1h 14m Total

10:12 – 10:37      25m
16:20 – 16:38      18m
23:05 – 23:36      31m

[ + Add Manual Entry ]
```

---

# 14. Settings

```text
SETTINGS

PLAYER
Default photos          3
Default interval        7 sec
History depth           50

SESSION
Background timeout      2 min
App usage tracking      Off

PRIVACY
App Lock                On
Privacy Screen          On
Sync                    Off

BACKUP
Export
Restore
```

---

# 15. App Lock

```text
┌──────────────────────────┐
│                          │
│         APP LOGO         │
│                          │
│     Enter PIN            │
│     ● ● ● ○              │
│                          │
│     [ Unlock ]           │
│                          │
└──────────────────────────┘
```

---

# 16. Missing Source

```text
Source unavailable

Collection A cannot be accessed.

[ Locate Folder ]
[ Remove Source ]
[ Cancel ]
```

---

# 17. Empty Library

```text
No photos yet

Add a folder or select photos
to start building your library.

[ Add Photos ]
```

---

# 18. Session Summary

```text
SESSION COMPLETE

Duration          24 min
Photos Viewed     86
Liked             11
Favorites          4
Kept               3

[ View Calendar ]
[ New Session ]
[ Home ]
```

---

# 19. Design Lock Requirements

Before high-fidelity UI:
- finalize navigation,
- finalize desktop player controls,
- finalize mobile player controls,
- finalize calendar information density,
- finalize collection picker,
- finalize pin visual state,
- finalize app lock behavior.

---

# 20. Suggested High-Fidelity Direction

```text
Dark charcoal background
Near-black player surface
Neutral light text
Subtle glass overlays
Rounded 12–16px cards
Minimal accent usage
Crossfade motion
Large edge-to-edge images
```

Accent color should be selected later during branding.
