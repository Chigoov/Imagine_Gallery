# ARCHITECTURE_DECISIONS.md
# Architecture Decision Records (ADR)
## Private Photo Fantasy Board

---

### ADR 001: Local-First IndexedDB Storage with Dexie.js
- **Context:** Core V1 requires complete offline functionality without cloud server dependencies.
- **Decision:** Use Dexie.js over raw IndexedDB for type-safe queries, indexed multi-collection relationships, and robust transactions.
- **Consequences:** Eliminates cloud backend requirements for V1, provides zero-latency reads, and preserves privacy by default.

---

### ADR 002: Pure Domain Engine Separation
- **Context:** Complex business rules for Pin preservation, No Repeat shuffle queue exhaustion, slideshow interval pause vs. session duration tracking, and calendar calculations risk becoming tangled in React component states.
- **Decision:** Extract pure TypeScript modules (`ShuffleEngine`, `PinEngine`, `PlayerStateEngine`, `SessionTimerEngine`, `CalendarAggregator`) with zero React dependencies.
- **Consequences:** All business logic can be unit tested in sub-second CLI runs with Vitest. UI components remain thin controllers.

---

### ADR 003: Pin Retention & Explicit Replace Rule
- **Context:** Ambiguity over what happens when an already-pinned slot is explicitly replaced by the user.
- **Decision:** Following Master Spec 2.1 Section 5, replacing a pinned slot replaces the photo with a new candidate from the pool, but the slot KEEPS its pinned status.
- **Consequences:** User workflow is predictable: slots pinned for visual balance remain anchored even when individual images are replaced.

---

### ADR 004: Decoupling Slideshow Pause from Fantasy Session Duration
- **Context:** Should manual slideshow pause stop the session timer?
- **Decision:** Following Feature Spec 29 & Master Spec 2.1 Section 8, pausing the slideshow only stops automatic photo advancement. Total session duration continues ticking as the user is still actively observing the board.
- **Consequences:** Session time accurately reflects viewing engagement, while allowing the user to pause fast transitions.
