# MASTER_SPEC_PRIVATE_2.1.md
# Private Photo Fantasy Board — Master Specification 2.1

Version: 2.1
Status: Design Lock Candidate
Architecture: Local-First / Privacy-First / Cross-Platform

---

# 1. Why 2.1

Version 2.1 refines 2.0 without changing the core product identity.

Added:
```text
Design System
High-Fidelity UI Rules
Motion / Interaction Rules
Design Lock Criteria
More precise Player UX
More precise Mobile behavior
```

---

# 2. Product Identity

Private Photo Fantasy Board is:

> A private cross-platform visual-session application for dynamically displaying 1–5 personal photos, pinning preferred photos, replacing individual slots, organizing collections, and tracking session frequency and duration.

---

# 3. Core Pillars

```text
Dynamic Player
Pin + Replace
Personal Library
Collections
Session Tracking
Calendar
Privacy
Cross-Platform
```

---

# 4. Core Player

Must include:

```text
1–5 photos
Auto Mode
Manual Mode
Pin
Unpin
Replace One
Like
Favorite
Keep
Hide
Focus
Previous
Next
Pause
Fullscreen
Saved Composition
```

---

# 5. Pin Final Rule

Pinned slot:
- stays in same position,
- does not change on Auto Next,
- does not change on Manual Next,
- does not change on global refresh.

Explicit Replace:
- replaces image,
- keeps slot pinned.

End Session:
- clears temporary pin.

Saved Composition:
- may persist pin state.

---

# 6. Replace Final Rule

Replace One:
- modifies one slot only,
- uses active pool,
- excludes current visible photos,
- excludes Hidden,
- respects filters,
- respects No Repeat queue where possible.

Other slots remain visually and logically unchanged.

---

# 7. Shuffle Final Rule

Default:
```text
No Repeat
```

Implementation:
```text
pool
→ shuffled queue
→ consume
→ reshuffle after exhaustion
```

Same photo must never appear twice in the same display state.

---

# 8. Session Timing Final Rule

Fantasy Time:
```text
Start Session → End Session
```

Player Pause:
does not end Fantasy Time.

Background default:
```text
2-minute grace
```

After timeout:
session auto-ends.

---

# 9. Calendar Final Rule

Daily data:
```text
session count
known duration total
session detail
manual entries
```

Manual count without duration:
- increments count,
- does not inflate duration.

---

# 10. Collections Final Rule

Collections are virtual.

Photo can belong to many collections.

Physical file duplication is not required.

---

# 11. Keep Final Rule

Keep:
- saves app-managed copy,
- never mutates source file,
- allows collection selection,
- allows naming rule.

Recommended storage:
```text
UUID internal filename
user-facing display name
```

---

# 12. File Naming

Options:
```text
Original
Collection + Number
Collection + Date + Number
Custom
```

Default:
```text
Original display name
UUID internal storage name
```

---

# 13. Platform Strategy

V1:
```text
Responsive Web
PWA
```

Later:
```text
Native Wrapper
```

Core logic shared across platforms.

---

# 14. Design Direction Final

```text
Dark Minimal
Photo First
Soft Glass Controls
Near-black Player
Subtle Motion
Low Visual Noise
```

---

# 15. Home Final Structure

```text
Today Summary
Start Session
Continue Session
Recent Collections
Calendar Preview
```

---

# 16. Desktop Navigation

```text
Home
Library
Collections
Favorites
Liked
Calendar
Settings
```

---

# 17. Mobile Navigation

```text
Home
Player
Library
Calendar
```

Settings via header/menu.

---

# 18. Player Desktop Final Structure

```text
Photo canvas
Auto-hide slot actions
Floating bottom player controls
Minimal session exit
```

---

# 19. Player Mobile Final Structure

```text
Photo canvas
Bottom player controls
Tap-based actions
Swipe navigation
Optional double-tap Like
```

Critical actions always have button alternatives.

---

# 20. Photo Count Layout Strategy

1:
single.

2:
desktop horizontal / mobile vertical.

3:
desktop hero + stacked pair / mobile hero + bottom pair.

4:
2×2.

5:
adaptive mosaic.

---

# 21. Focus Mode Final

Focus:
- pauses automatic transition,
- preserves session time,
- supports zoom,
- supports actions,
- returns to exact prior display.

---

# 22. Design Tokens

Centralize:
```text
colors
typography
spacing
radius
shadow
motion
z-index
```

No scattered hardcoded visual values.

---

# 23. Motion Final

Default:
```text
Photo Crossfade 220ms
Replace 180–220ms
Control Fade 140ms
Bottom Sheet 220ms
```

Pinned slots:
```text
no global transition
```

---

# 24. Privacy Defaults

```text
Local Only        ON
Sync              OFF
Public Sharing    OFF
Analytics         OFF
App Usage Track   OFF
```

---

# 25. Privacy UI

App Lock:
supported.

Privacy Screen:
planned / required for mobile wrapper.

Notifications:
generic only.

---

# 26. Data Architecture

Primary:
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

---

# 27. API Architecture

Frontend uses service abstractions.

Local and cloud implementations should share compatible contracts.

Core app must not depend on cloud availability.

---

# 28. Performance Target

Architecture should support:
```text
5,000–20,000 photo references
```

Strategies:
```text
lazy loading
thumbnail cache
bounded history
preload next
virtualized grids
```

---

# 29. Offline Rule

Core features must work offline:
```text
Library
Collections
Player
Pin
Replace
Like
Favorite
Hide
Session
Calendar
Settings
```

---

# 30. Implementation Order

```text
Foundation
Library
Collections
Player
Pin + Replace
Shuffle
Photo Actions
Session
Calendar
Focus/Composition
Privacy
PWA
Optional Sync
Mobile Wrapper
```

---

# 31. V1 Must-Have

```text
Local photo source
Library
Collections
1–5 Player
Auto
Manual
Pin
Replace One
No Repeat
Like
Favorite
Keep
Hide
Previous
Focus
Session Timer
Calendar
Manual Entry
Responsive UI
Basic App Lock
Metadata Backup
```

---

# 32. V1.5

```text
Dynamic layouts
Tags
Advanced filters
Session presets
Calendar heatmap
Multi-source
Privacy screen
Saved composition polish
```

---

# 33. V2

```text
Weighted shuffle
Recent cooldown
Discovery
Encrypted vault
Encrypted backup
Cross-device sync
Duplicate detection
Metadata stripping
Panic exit
Discreet mode
```

---

# 34. V3 Trigger

Master Spec 3.0 should only be created if the product architecture or identity changes substantially.

Examples:
```text
video support
multi-screen ecosystem
central encrypted cloud library
AI recommendation as core feature
remote controller
major native-first architecture
```

---

# 35. Design Lock Checklist

Before coding UI:

```text
[ ] Accent selected
[ ] Typography selected
[ ] Home approved
[ ] Desktop Player approved
[ ] Mobile Player approved
[ ] Pin state approved
[ ] Replace state approved
[ ] Focus Mode approved
[ ] Library approved
[ ] Collection picker approved
[ ] Calendar approved
[ ] Settings approved
[ ] App Lock approved
[ ] Responsive behavior approved
```

---

# 36. Engineering Lock Checklist

Before full implementation:

```text
[ ] Storage adapter selected
[ ] IndexedDB structure finalized
[ ] Thumbnail pipeline finalized
[ ] Session state machine finalized
[ ] Shuffle engine API finalized
[ ] Backup format finalized
[ ] Migration strategy finalized
[ ] PWA strategy finalized
```

---

# 37. Project Document Set

```text
MASTER_SPEC_PRIVATE_2.1.md
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
11_DESIGN_SYSTEM.md
12_HIGH_FIDELITY_UI_SPEC.md
13_INTERACTION_ANIMATION_SPEC.md
UI_WIREFRAME_V1.md
```

---

# 38. Current Status

```text
Product Definition       COMPLETE
Core Feature Rules       COMPLETE
User Flow                COMPLETE
Database Concept         COMPLETE
API Concept              COMPLETE
Privacy Spec             COMPLETE
Development Roadmap      COMPLETE
Wireframe                COMPLETE
Design System            COMPLETE
High-Fidelity UI Spec    COMPLETE
Interaction Spec         COMPLETE

Visual Mockup Images     OPTIONAL NEXT
Architecture Lock        NEXT
Implementation           AFTER LOCK
```

---

# 39. Immediate Next Step

Recommended:
```text
1. Review Master 2.1
2. Create visual mockups
3. Lock design decisions
4. Finalize architecture
5. Run coding agent with implementation prompt
```
