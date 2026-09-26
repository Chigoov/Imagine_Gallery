# MASTER_SPEC_PRIVATE_2.0.md
# Private Photo Fantasy Board — Master Specification 2.0

Version: 2.0  
Status: Product Definition + Design Architecture  
Platform: Web, PWA, Mobile  
Architecture Principle: Local-First, Privacy-First, Cross-Platform

---

# 1. Product Vision

Private Photo Fantasy Board adalah aplikasi pribadi untuk mengelola, menampilkan, mengacak, dan mempertahankan kombinasi 1–5 foto dari koleksi pengguna.

Aplikasi tidak diposisikan sebagai slideshow biasa.

Identitas utama produk:

> Dynamic private visual session application dengan Pin-based composition control, collection-driven library, session tracking, calendar, dan cross-device support.

---

# 2. Core Experience

User dapat:

```text
Choose Photos
↓
Choose Collection
↓
Start Session
↓
Display 1–5 Photos
↓
Pin photos that should remain
↓
Replace only unwanted slots
↓
Like / Favorite / Keep / Hide
↓
Continue automatic or manual shuffle
↓
End Session
↓
Calendar records frequency + duration
```

---

# 3. Core Product Pillars

## Pillar A — Dynamic Visual Player

- 1–5 photos
- responsive layouts
- auto/manual
- transitions
- focus mode
- fullscreen

## Pillar B — Pin & Composition Control

- Pin photo
- Unpin
- Replace one slot
- Save composition
- Previous states

## Pillar C — Personal Library

- Source photos
- Liked
- Favorites
- Kept
- Hidden
- Collections
- Tags
- Naming rules

## Pillar D — Session Tracking

- Start/End session
- timer
- daily duration
- calendar
- manual entry
- weekly/monthly stats

## Pillar E — Privacy

- local-first
- app lock
- privacy screen
- optional sync
- backup

---

# 4. Platform Strategy

## Web Desktop

Best for:
- folder scanning,
- large library management,
- fullscreen player,
- keyboard controls.

## Mobile

Best for:
- player,
- quick interaction,
- pin,
- like,
- keep,
- calendar.

## PWA

Primary cross-platform distribution for early versions.

## Native Wrapper

Can be introduced after core web/PWA stability.

---

# 5. Navigation Model

Desktop:
```text
Home
Library
Collections
Player
Calendar
Settings
```

Mobile:
```text
Home
Player
Library
Calendar
```

---

# 6. Home 2.0

Home should provide immediate access to:

```text
TODAY
Sessions: 2
Fantasy Time: 31 min

[ START SESSION ]

Continue Previous Session

Recent Collections
Recent Saved Compositions
Calendar Preview
```

Optional:
```text
App Usage
```

---

# 7. Source Model

Supported source types:

```text
Local Folder
Selected Files
Mobile Gallery
App Storage
Future Cloud Storage
```

Original files remain untouched by default.

---

# 8. Photo States

Each Photo can independently have:

```text
Liked
Favorite
Hidden
Kept
Missing
```

These are not mutually exclusive except where logical restrictions apply.

---

# 9. Collection Model

Collections are virtual folders.

One photo can exist in:
```text
Collection A
Collection B
Favorites Mix
```

without physical duplication.

---

# 10. Custom Naming

Keep operation supports:

```text
Original Filename
{collection}_{number}
{collection}_{date}_{number}
Custom Template
```

Default:
```text
Original Filename
```

---

# 11. Player 2.0

The Player is the core surface.

It must support:

```text
Photo Count: 1–5
Mode: Auto / Manual
Pin
Replace One
Like
Favorite
Keep
Hide
Focus
Previous
Next
Pause
Save Composition
Fullscreen
```

---

# 12. Pin Engine

Pinned photo:
- remains during auto refresh,
- remains during manual Next,
- remains during Replace All,
- stays in the same slot.

Pinned photo can still be:
- liked,
- favorited,
- kept,
- hidden,
- explicitly replaced.

---

# 13. Replace Engine

Replace affects only one slot.

Candidate:
- from active pool,
- not currently visible,
- not hidden,
- matches filters,
- follows shuffle mode.

---

# 14. Shuffle Modes

V1:
```text
No Repeat
Pure Shuffle
Favorites Only
Unseen Only
```

V1.5:
```text
Discovery
Liked Mix
Multi-source Mix
```

V2:
```text
Weighted Shuffle
Recent Cooldown
Smart Distribution
```

---

# 15. Session Source

Can use:
```text
One Collection
Multiple Collections
Favorites
Liked
All Photos
Selected Sources
```

Pool is deduplicated.

---

# 16. Session Preset

Preset stores:
```text
Photo Count
Mode
Interval
Layout
Shuffle
Background
Optional Sources
```

---

# 17. Saved Composition

Stores:
```text
Photos
Slot Positions
Pin State
Layout
Background
```

Purpose:
- recreate a preferred combination later.

---

# 18. Focus Mode

Focus Mode:
- pauses timer,
- enlarges one photo,
- enables zoom,
- exposes actions,
- returns to same session state.

---

# 19. History

Default:
```text
50 display states
```

Stores:
```text
photos
positions
pin state
layout
```

---

# 20. Session Timer 2.0

Session Timer is not the same as App Usage.

## Fantasy Time

Counts only active visual sessions.

## App Usage

Optional metric for total app usage.

---

# 21. Background Logic

Default:
```text
Background grace = 2 minutes
```

If app does not return:
```text
session auto-ended
```

User options:
```text
Pause immediately
Stop after 2 min
Stop after 5 min
Keep counting
```

---

# 22. Calendar 2.0

Each date stores:
```text
Session Count
Total Known Duration
Session List
Manual Entries
Optional Notes
```

Month view should show frequency without gamification pressure.

---

# 23. Statistics 2.0

Daily:
```text
Sessions
Total Time
Average Session
```

Weekly:
```text
Sessions
Total Time
Active Days
Average
```

Monthly:
```text
Sessions
Total Time
Active Days
Average Session
Average per Active Day
Most Used Layout
```

---

# 24. Design Direction 2.0

Default:
```text
Dark Minimal
Immersive
Photo First
Soft Glass Controls
Subtle Motion
Responsive
```

Player should feel closer to a visual canvas than a dashboard.

---

# 25. Desktop Player Design

```text
┌─────────────────────────────────────────────────────┐
│                                                     │
│    PHOTO A              PHOTO B                     │
│      📌                                             │
│                                                     │
│    PHOTO C              PHOTO D                     │
│                                                     │
│   ◀      ⏸      ▶      4 photos      00:04          │
└─────────────────────────────────────────────────────┘
```

Controls auto-hide when inactive.

---

# 26. Mobile Player Design

```text
┌──────────────────────┐
│      PHOTO A         │
├──────────┬───────────┤
│ PHOTO B  │ PHOTO C   │
└──────────┴───────────┘

◀   ⏸   ▶   3   ⋯
```

Mobile controls prioritize one-hand interaction.

---

# 27. Interaction Philosophy

Tap/click:
```text
Focus or show controls
```

Double tap mobile:
```text
Like
```

Long press:
```text
More actions
```

Swipe:
```text
Next / Previous
```

All gestures must have button equivalents.

---

# 28. Privacy 2.0

V1:
```text
Local-first
Private by default
App lock
Local metadata
Private calendar
```

V1.5:
```text
Privacy screen
Backup
Generic notifications
```

V2:
```text
Private vault
Encrypted backup
Metadata stripping
Panic exit
Discreet mode
```

---

# 29. Sync 2.0

Sync is optional.

Sync candidates:
```text
Likes
Favorites
Collections
Tags
Calendar
Settings
Saved Compositions
Kept Photos
```

Do not auto-upload every source photo.

---

# 30. Data Architecture 2.0

Primary entities:
```text
PhotoSource
Photo
Collection
PhotoCollection
Session
SessionDisplayState
SessionSlot
CalendarEntry
SavedComposition
SessionPreset
AppSetting
```

Future:
```text
Tag
PhotoTag
PhotoEvent
SyncState
BackupRecord
```

---

# 31. Performance Strategy

Do not load all originals at once.

Use:
```text
thumbnail cache
lazy loading
next-display preload
limited player history
metadata indexing
```

Target:
```text
5,000–20,000 photo references
```

for early architecture.

---

# 32. Error Recovery

App must gracefully handle:
```text
Missing source
Permission revoked
Missing file
Broken kept file
Interrupted session
Browser refresh
App crash
```

---

# 33. Offline Strategy

Core offline:
```text
Library
Local Player
Pin
Replace
Like
Favorites
Collections
Timer
Calendar
Settings
```

Sync resumes later.

---

# 34. Design Pages Required

Before UI coding:

```text
01 Home
02 Onboarding
03 Add Source
04 Library
05 Collection Detail
06 Start Session
07 Player Desktop
08 Player Mobile
09 Focus Mode
10 Keep / Collection Picker
11 Saved Compositions
12 Calendar
13 Day Detail
14 Statistics
15 Settings
16 App Lock
17 Missing Source State
18 Empty States
```

---

# 35. Design Components

```text
AppShell
Sidebar
BottomNav
PhotoGrid
PhotoSlot
PhotoActionBar
PlayerControlBar
PinBadge
TimerIndicator
CollectionCard
PhotoCard
CalendarDay
SessionCard
StatCard
BottomSheet
Modal
Toast
Tooltip
SearchBar
FilterChip
```

---

# 36. V1 Scope 2.0

Must:
```text
Local photo source
Library
Collections
1–5 Player
Auto
Manual
No Repeat
Pin
Replace One
Like
Favorite
Keep
Hide
Focus Mode
Previous
Session Timer
Calendar
Manual Entry
Responsive UI
Basic App Lock
Backup Metadata
```

---

# 37. V1.5 Scope

```text
Dynamic layout
Saved Composition
Session Preset
Tags
Search
Smart Filters
Heatmap
Advanced stats
Privacy Screen
Offline improvements
Multi-source sessions
```

---

# 38. V2 Scope

```text
Weighted Shuffle
Discovery
Recent Cooldown
Encrypted Vault
Encrypted Backup
Cross-device Sync
Duplicate Detection
Smart Crop
Metadata Privacy
Panic Exit
Discreet Mode
```

---

# 39. V3 Scope

```text
Multi-display support
Remote controller
Advanced sync
AI-assisted organization
Image similarity
Advanced recommendation
```

---

# 40. Product Rules

1. Never modify original source by default.
2. Pin always beats auto refresh.
3. User explicit action beats automation.
4. Hidden photos do not appear in future queue.
5. Calendar records without gamifying frequency.
6. Sync is optional.
7. Player remains visually clean.
8. Mobile and desktop use same product logic but different layouts.
9. Collection membership does not duplicate files.
10. Session Timer and App Usage remain separate.

---

# 41. Development Document Set 2.0

```text
MASTER_SPEC_PRIVATE_2.0.md
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

# 42. Current Project Status

```text
Concept                  COMPLETE
Feature List             COMPLETE
Product Requirements     COMPLETE
Feature Rules            COMPLETE
User Flow                COMPLETE
Database Concept         COMPLETE
UI/UX Structure          COMPLETE

API Specification        NEXT
Privacy/Security         NEXT
Development Roadmap      NEXT
Agent Build Prompt       NEXT
Testing Checklist        NEXT
Visual Design Mockup     NEXT
Implementation           AFTER DESIGN LOCK
```

---

# 43. Immediate Next Stage

Recommended sequence:

```text
1. API Specification
2. Privacy/Security Specification
3. Development Roadmap
4. UI Wireframe / Mockup
5. Final Architecture Lock
6. Agent Implementation Prompt
7. Coding
8. Testing
```

---

# 44. Version 2.0 Summary

Master Spec 2.0 upgrades the project from a feature idea into a structured product blueprint.

It now includes:
- product scope,
- explicit user flow,
- player rules,
- pin engine,
- session and calendar model,
- database structure,
- responsive design architecture,
- privacy model,
- implementation priorities,
- staged roadmap.
