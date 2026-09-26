# 08_DEVELOPMENT_ROADMAP.md
# Development Roadmap — Private Photo Fantasy Board

Version: 1.0

---

# 1. Development Strategy

Build in vertical slices.

Do not build all backend first or all UI first.

Each milestone should produce a usable increment.

---

# 2. Phase 0 — Project Foundation

Deliverables:
```text
Repository setup
Next.js + TypeScript
Component system
Linting
Testing
Local DB abstraction
State management
Routing
Theme
```

Definition of done:
- app boots,
- desktop/mobile shell works,
- local persistence works.

---

# 3. Phase 1 — Local Library

Build:
```text
Add files
Add folder where supported
Index metadata
Generate thumbnails
Library grid
Search basic
Missing source state
```

DoD:
- 1,000+ photo references can be indexed,
- app does not load every original at once,
- library survives reload.

---

# 4. Phase 2 — Collections

Build:
```text
Create collection
Rename
Delete
Add/remove photos
Multi-collection membership
Liked
Favorites
Hidden
```

DoD:
- collection delete never deletes original,
- one photo can exist in several collections.

---

# 5. Phase 3 — Player Core

Build:
```text
1–5 photo display
Desktop layouts
Mobile layouts
Manual Next
Previous
Fullscreen
Image fit
Preloading
```

DoD:
- no obvious blank flash on change,
- 1–5 layout responsive.

---

# 6. Phase 4 — Pin & Replace

Build:
```text
Pin
Unpin
Unpin All
Replace One
Pinned transition behavior
History state
```

DoD:
- pinned photo never changes on ordinary next,
- replace changes one slot only.

---

# 7. Phase 5 — Shuffle Engine

Build:
```text
No Repeat
Pure Shuffle
Favorites Only
Unseen Only
Queue persistence
End-cycle reshuffle
```

DoD:
- no duplicate on same display,
- no-repeat cycle behaves correctly.

---

# 8. Phase 6 — Photo Actions

Build:
```text
Like
Favorite
Keep
Hide
Collection picker
Naming rule
Duplicate keep handling
```

DoD:
- state persists instantly,
- source files remain untouched.

---

# 9. Phase 7 — Session System

Build:
```text
Start Session
End Session
Auto/Manual
Interval
Pause
Background grace
Resume session
Session summary
```

DoD:
- duration accurate,
- background timeout accurate,
- interrupted session recoverable.

---

# 10. Phase 8 — Calendar

Build:
```text
Daily count
Daily duration
Day detail
Manual entry
Weekly summary
Monthly summary
```

DoD:
- ended session automatically appears,
- manual entries combine correctly.

---

# 11. Phase 9 — Focus & Composition

Build:
```text
Focus Mode
Zoom
Save Composition
Load Composition
Missing-photo handling
```

---

# 12. Phase 10 — Settings & Privacy

Build:
```text
App Lock
Background rule
Local-only setting
Privacy defaults
Backup metadata
Restore metadata
```

---

# 13. Phase 11 — UI Polish

Build:
```text
Motion
Crossfade
Auto-hide controls
Empty states
Error states
Mobile gesture tuning
Keyboard shortcuts
Accessibility
```

---

# 14. Phase 12 — PWA

Build:
```text
Installable PWA
Offline app shell
Cache strategy
Local library offline behavior
```

---

# 15. Phase 13 — Optional Sync Backend

Only after local V1 stable.

Build:
```text
Auth
User
Device
Private metadata sync
Kept photo storage
Conflict resolution
Device management
```

---

# 16. Phase 14 — Mobile Wrapper

After PWA quality acceptable.

Build:
```text
Capacitor integration
Native file access
Biometric lock
Privacy screen
Mobile storage
```

---

# 17. Phase 15 — V1.5

```text
Dynamic layouts
Tags
Advanced search
Session presets
Heatmap
Multi-source
Saved composition improvements
```

---

# 18. Phase 16 — V2

```text
Weighted shuffle
Recent cooldown
Discovery mode
Encrypted vault
Encrypted backup
Duplicate detection
Metadata stripping
Panic exit
Discreet mode
Cross-device sync polish
```

---

# 19. Phase 17 — V3

```text
Multi-display
Remote controller
AI-assisted organization
Image similarity
Advanced recommendation
Advanced analytics
```

---

# 20. Testing Gates

Every phase:
```text
Unit tests
Integration tests
Mobile responsive check
Desktop check
Data persistence test
Privacy regression
```

Critical:
```text
Pin logic
No Repeat
Session duration
Calendar aggregation
Original-file safety
```

---

# 21. Release Milestones

## Internal Prototype
Phases 0–4

## Functional Alpha
Phases 0–8

## Private Beta
Phases 0–12

## Sync Beta
Phase 13+

## Mobile Beta
Phase 14+

---

# 22. Recommended Build Order

```text
Foundation
→ Library
→ Collections
→ Player
→ Pin
→ Shuffle
→ Actions
→ Session
→ Calendar
→ Privacy
→ PWA
→ Sync
→ Native Mobile
```

---

# 23. Rule

Do not implement AI, cloud sync, or advanced analytics before the local player and session tracking are stable.
