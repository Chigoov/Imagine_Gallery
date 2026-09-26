# MASTER_SPEC_PRIVATE_2.2.md
# Private Photo Fantasy Board — Master Specification 2.2

Version: 2.2  
Status: Release Candidate Certified (V1.0.0-rc1)  
Architecture: Local-First / Privacy-First / Cross-Platform  
Date: September 23, 2026  

---

# 1. Why 2.2

Version 2.2 formalizes real-world User Acceptance Testing (UAT) findings and Quality Gate validations without altering the core product identity:

Added & Formalized:
```text
Recursive Directory Ingestion & Traversal (depth 3)
Live Progress Feedback during Large-Scale Folder Scanning
Session Termination Lifecycle (SessionSummaryModal Recap before Navigation)
Inline Collection Renaming & Collision-Proof Identifier Generation
Non-Destructive Hide Semantics & Library Recovery
Enforced Mobile Touch Target Standards (min 36px–48px)
PWA Offline Shell & Web App Manifest Specification
Automated Regression Test Suite Baseline (51 Tests)
```

---

# 2. Product Identity

Private Photo Fantasy Board is:

> A private, local-first visual-session application for dynamically displaying 1–5 personal photos, pinning preferred photos, replacing individual slots with localized transitions, organizing collections, and tracking honest session frequency and duration with zero cloud telemetry.

---

# 3. Core Pillars

```text
Dynamic Player (1–5 Slots)
True Pin + Isolated Replace
Personal Library & Non-Destructive Ingestion
Virtual Collections & Multi-Membership
Honest Session Tracking (Fantasy Time)
Non-Gamified Observational Calendar
100% Offline Privacy & File Safety
Cross-Platform PWA & Mobile Ergonomics
```

---

# 4. Core Player

Must include:

```text
1–5 photo simultaneous display
Auto Mode (configurable interval 5s–30s)
Manual Mode (Arrows, Click, Touch Swipe)
Pin (📌) & Unpin
Replace One (↻)
Like (Heart) & Favorite (Star)
Keep to App Storage (Bookmark)
Hide from Shuffle (EyeOff)
Focus Mode with Multi-level Zoom (1x, 1.6x, 2.2x)
Bounded History Navigation (Previous/Next, depth 50)
Slideshow Pause / Resume
Fullscreen (F)
Saved Composition & In-Session Count Switching
Session Summary Recap Modal
```

---

# 5. Pin Final Rule

Pinned slot:
- stays in exact same slot position,
- does not change on Auto Next,
- does not change on Manual Next,
- does not change on global refresh,
- does not undergo global screen crossfade animations.

Explicit Replace on a Pinned Slot:
- replaces image with a new candidate from active pool,
- **KEEPS THE SLOT PINNED**.

End Session:
- clears temporary in-session pin states unless saved to a Saved Composition.

Saved Composition:
- stores slot layout and pinned states permanently in Dexie IndexedDB.

---

# 6. Replace One Final Rule

Replace One (↻):
- modifies the targeted slot only,
- draws from the active pool,
- strictly excludes currently visible photos in other slots,
- strictly excludes photos marked as Hidden,
- respects active source filters (All, Collection, Favorites, Liked),
- uses localized transition (`duration-replace: 200ms`),
- preserves other unpinned and pinned slots without layout shift or re-fade,
- records an entry in the history stack enabling Previous reversal.

---

# 7. Shuffle Final Rule

Default:
```text
No Repeat
```

Implementation:
```text
pool
→ Fisher-Yates shuffled queue
→ consume candidate
→ check against active visible & pinned IDs
→ cycle exhaustion check
→ end-of-cycle tail cooldown
→ reshuffle after exhaustion
```

Rules:
- The same photo must never appear twice in the same display state.
- Every eligible photo in the pool must be displayed before any photo repeats in a new cycle.
- Hidden photos are purged immediately from the active queue and pool upon being hidden.

---

# 8. Session Timing & Termination Final Rule

Fantasy Time:
```text
Start Session → Active Ticking → End Session
```

Player Pause:
- stops auto-advance slideshow countdown,
- **DOES NOT pause session duration (Fantasy Time)**, reflecting ongoing engagement.

Background Grace:
- default window: 120 seconds.
- return within 120s: resume session seamlessly, adding elapsed time.
- return after 120s: auto-end session with duration capped at 120s.

Session Termination Lifecycle:
- Clicking "End Session" halts active slideshow.
- Displays `SessionSummaryModal` recap showing:
  - Total Fantasy Time duration
  - Photos viewed count
  - Liked count
  - Kept count
- Provides explicit navigation choices:
  - "View Calendar"
  - "Start Another Session"
  - "Return to Home"
- Finalizes database logging to `sessions` and `calendar_entries` tables.

---

# 9. Calendar Final Rule

Daily Data:
```text
session count
known duration total
session details
manual entries
```

Manual Calendar Entry:
- accepts date, session count, optional duration, and notes.
- supports **Unknown Duration** toggle (`duration = 0`):
  - increments session count,
  - **does not inflate or falsify duration total**,
  - excluded from duration average calculations.

Observational Metrics:
- strictly observational (daily, weekly, monthly totals, active days).
- zero gamification, zero streaks, zero competitive badges.

---

# 10. Collections Final Rule

- Collections are virtual groupings in IndexedDB (`collections` and `photo_collections` tables).
- A photo can belong to multiple collections simultaneously (many-to-many relationship).
- Deleting a collection removes virtual membership relations but **NEVER deletes the photo** from the library or disk.
- **Collection Renaming:** Supported directly via inline edit in Collection Detail view, updating metadata instantly.
- Identifiers use collision-proof entropy suffixes (`col-${Date.now()}-${random}`).

---

# 11. Keep & Hide Final Rules

### Keep
- Designates a photo as preserved in local app storage.
- Associates photo with a chosen destination collection.
- Never mutates, moves, or deletes source files on disk.

### Hide
- Sets `hidden: true` on the photo record.
- Immediately removes photo from the active player slot (replacing with a new candidate).
- Immediately purges photo from active `ShuffleEngine` queue and pool.
- Displays reassuring toast: *"Photo hidden (original file untouched). View in Library > Hidden tab."*
- Accessible under the Hidden filter tab in Library with instant Restore capability.

---

# 12. Photo Source Ingestion & Safety Rule

### Non-Destructive File Safety (Absolute Requirement)
- The application is **100% Read-Only** with respect to the user's filesystem.
- Zero filesystem delete, move, rename, or write operations.
- File System Access API uses `entry.getFile()` only.

### Recursive Folder Traversal
- Supported directory pickers automatically scan subdirectories up to a depth of 3 levels.
- File matcher accepts standard MIME types and extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.bmp`.
- Displays live feedback during ingestion: *"Scanning folder and subfolders... Found X photos so far"*.

---

# 13. Platform & PWA Strategy

V1.0 Release Candidate:
```text
Responsive Web Application
Installable Progressive Web App (PWA)
Offline App Shell via Service Worker
Web App Manifest with standalone display
```

---

# 14. Design System & Ergonomics

### Dark Minimal Aesthetic
- Base background: `#0F1012`
- Surface: `#17181C`
- Elevated: `#1E2025`
- Player Canvas: `#090A0B`
- Accent (Gold): `#F59E0B`
- Heart (Liked): `#EF4444`
- Star (Favorite): `#FBBF24`
- Bookmark (Kept): `#10B981`

### Mobile Touch Ergonomics
- Fixed bottom navigation bar with 48px touch targets.
- Player slot action buttons elevated to minimum **36px–48px** bounding boxes.
- Swipe gestures for touch navigation (Swipe Left = Next, Swipe Right = Previous).
- Two-photo layout displays as a vertical split (top-bottom) on mobile screens (<768px).

---

# 15. Privacy & App Lock Rule

- Offline-first: zero analytics, zero crash telemetry, zero cloud dependencies.
- App Lock PIN: 4-digit numeric code with privacy screen shield and header lock button.
- Metadata backup export produces standard JSON conforming to `schema_version: 1`.
- Import validates schema version, rejecting corrupted or incompatible files.

---

# 16. Performance Specifications

Validated Benchmarks (up to 20,000 photo references):
- Shuffle queue generation: < 10ms for 20,000 items.
- Candidate advance draw: < 0.1ms (budget < 5ms).
- Single-slot replace: < 0.1ms (budget < 2ms).
- History rewind traversal: < 0.5ms for 50 states (budget < 20ms).
- Memory footprint: ~295 bytes per record; < 7.5 MB heap for 20,000 records.
- Raw original image binary buffers are never stored in JavaScript heap or database tables.

---

# 17. Quality Gate & Release Baseline

The V1.0.0 Release Candidate baseline is certified with:
- **51 Automated Unit & Integration Tests** passing at 100%.
- Production bundle compiled with zero errors.
- All 15 UAT scenarios verified and accepted.
