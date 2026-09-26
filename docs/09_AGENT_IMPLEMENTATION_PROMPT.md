# 09_AGENT_IMPLEMENTATION_PROMPT.md
# Master Implementation Prompt for AI Coding Agent
## Private Photo Fantasy Board

You are the primary software engineering agent responsible for implementing the application described in the specification set.

You must treat the specification files as the source of truth.

---

# 1. Read First

Before editing any code, read:

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
UI_WIREFRAME_V1.md
10_TESTING_CHECKLIST.md
```

Do not begin implementation until you understand:
- product scope,
- local-first architecture,
- photo safety rules,
- Pin behavior,
- Replace behavior,
- shuffle behavior,
- session timing,
- calendar aggregation,
- responsive UI,
- privacy defaults.

---

# 2. Primary Goal

Build a private cross-platform photo-session application that supports:

```text
1–5 photo display
Pin
Replace One Photo
Like
Favorite
Keep
Hide
Collections
No Repeat Shuffle
Auto / Manual Player
Session Timer
Calendar
Responsive Desktop + Mobile UI
Local-First Storage
Privacy Controls
```

---

# 3. Architecture Rules

Use:

```text
Next.js
React
TypeScript
```

Prefer:
```text
modular architecture
typed services
feature isolation
testable business logic
```

Do not tightly couple UI components to storage implementation.

Required conceptual layers:

```text
UI
↓
Application / Feature Services
↓
Domain Logic
↓
Repository / Data Adapter
↓
IndexedDB / SQLite / API
```

---

# 4. Local-First Requirement

The app must work without a cloud backend for core V1 features.

Cloud sync must remain optional.

Do not make:
```text
login
server availability
cloud storage
```

mandatory for:
```text
library
player
pin
replace
like
favorite
collections
session timer
calendar
```

---

# 5. Source File Safety

Never:
- delete source photos automatically,
- rename source photos automatically,
- move source photos automatically.

All source file operations must be non-destructive by default.

---

# 6. Implementation Order

Follow:

```text
Phase 0 Foundation
Phase 1 Local Library
Phase 2 Collections
Phase 3 Player
Phase 4 Pin & Replace
Phase 5 Shuffle
Phase 6 Photo Actions
Phase 7 Session
Phase 8 Calendar
Phase 9 Focus / Composition
Phase 10 Privacy / Backup
Phase 11 UI Polish
Phase 12 PWA
```

Do not skip directly to AI, cloud sync, or advanced V2 features.

---

# 7. Mandatory Core Logic

## Pin

Pinned photos must remain during:
```text
Auto Next
Manual Next
Replace All
```

Replace on pinned slot:
```text
replace photo
keep slot pinned
```

## Replace One

Must:
```text
change one slot only
preserve all other slots
respect active filters
avoid duplicates
respect queue
```

## No Repeat

Use a shuffled queue.

Do not use naive random on every transition.

Required:
```text
pool
→ shuffle
→ consume
→ reshuffle when empty
```

## Display State

Never show the same photo twice in one display state.

---

# 8. Player Requirements

Must support:
```text
1
2
3
4
5
```

photos.

Player state:
```text
current slots
pin states
mode
interval
layout
queue
queue cursor
history
```

---

# 9. Session Timing

Session begins:
```text
Start Session
```

Session ends:
```text
End Session
background timeout
explicit close if reliably detectable
```

Slideshow pause does not necessarily mean session end.

Default background grace:
```text
120 seconds
```

---

# 10. Calendar

Automatic ended session must create/update calendar data.

Daily:
```text
session count
total known duration
```

Manual entries must be supported.

Manual entry without duration:
```text
adds count
does not add duration
```

---

# 11. Persistence

State that must survive reload:
```text
photos metadata
collections
likes
favorites
hidden
kept metadata
settings
calendar
session history
saved compositions
```

Active session recovery:
offer:
```text
Resume previous session?
```

---

# 12. UI Rules

Default:
```text
dark minimal
photo-first
responsive
low visual noise
```

Desktop:
sidebar.

Mobile:
bottom navigation.

Player controls:
auto-hide where appropriate.

---

# 13. Mobile Rules

Touch targets:
```text
>= 44x44px
```

Support:
```text
Swipe Left
Swipe Right
Tap
Long Press
```

Never make a gesture the only way to perform a critical action.

---

# 14. Performance

Do not load all original images at once.

Use:
```text
thumbnail generation/cache
lazy loading
preload next display
bounded history
virtualized grids when needed
```

Architecture target:
```text
5,000–20,000 photo references
```

---

# 15. Privacy Rules

Default:
```text
Local Only
Sync OFF
Public Sharing OFF
Analytics OFF
App Usage Tracking OFF
```

Never log:
```text
photo content
full file paths
calendar notes
private collection names
auth secrets
```

---

# 16. Error Handling

Implement graceful states for:
```text
missing source
missing photo
permission revoked
broken internal file
storage full
database migration failure
invalid backup
```

Never crash the whole player due to one missing photo.

---

# 17. Testing

Every completed feature must include tests defined in:
```text
10_TESTING_CHECKLIST.md
```

Highest priority:
```text
Pin
Replace
No Repeat
Session Timer
Calendar
Original File Safety
```

---

# 18. Coding Standards

Use:
```text
strict TypeScript
clear naming
small modules
pure functions for shuffle logic
explicit state transitions
```

Avoid:
```text
giant components
implicit global state
business logic inside JSX
untyped storage
silent error swallowing
```

---

# 19. Required Documentation During Build

Maintain:

```text
IMPLEMENTATION_STATUS.md
KNOWN_ISSUES.md
ARCHITECTURE_DECISIONS.md
../CHANGELOG.md
```

For each phase:
record:
```text
completed
tests
known limitations
next steps
```

---

# 20. Agent Behavior

Before each major phase:

1. inspect current code,
2. identify affected modules,
3. describe intended changes briefly,
4. implement,
5. run tests,
6. fix failures,
7. update status docs.

Do not blindly rewrite unrelated code.

---

# 21. Definition of V1 Success

V1 is complete only if a user can:

```text
add photos
create collection
start session
show 1–5 photos
pin one
replace another
like a photo
favorite a photo
keep a photo
hide a photo
advance without repeat
end session
see session in calendar
see daily duration
reload app without losing metadata
use core flow on mobile and desktop
```

---

# 22. Final Rule

If any implementation choice conflicts with:
```text
privacy
source-file safety
Pin behavior
session timing
calendar accuracy
```

choose the safer and specification-consistent behavior.

Do not invent a conflicting product rule without documenting the decision.
