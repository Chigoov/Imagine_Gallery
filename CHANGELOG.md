# CHANGELOG.md
# Changelog — Private Photo Fantasy Board

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Historical entries below include verification and release claims that were not reproducible in this audit; current status is in `docs/V1_IMPLEMENTATION_AUDIT.md` and `docs/V1_RELEASE_READINESS.md`.

---

## [Unreleased] — Specification audit and data-integrity corrections

### Fixed
- Replaced seeded photo/activity content with an empty local-first initial state and a versioned migration that removes only recognizable legacy demo rows.
- Removed expired persisted object URLs; imported file references now require reselection after reload when no app-owned copy exists.
- Persisted active-session recovery state, including slots, pins, history, shuffle queue, timer, and counters, and exposed Resume after reload within the configured grace window.
- Made session completion and its calendar entry persist together, kept source files read-only, and made app reset explicitly describe removal of app-owned kept copies.
- Persisted backup restoration as a metadata merge, included memberships/sessions, and excluded runtime object URLs and image bytes.
- Added a user-consented public Drive link source. It stores link metadata locally, loads the image directly from Google, supports link removal from the app, and does not add sign-in or upload.
- Corrected player history refresh after photo metadata changes and rejected slot counts larger than the eligible source.

### Verification
- `npm test`: 74/74 passing; `npm run build`: passing.
- Local desktop browser smoke check passed. Real-photo and physical-device UAT remain outstanding; see `docs/V1_UAT_REPORT.md`.

## [1.1.0] - 2026-09-23 — V1 Validation & Quality Gate Release

### Added
- Comprehensive V1 Quality Gate suite with 50 automated tests in Vitest passing at 100%.
- `docs/V1_IMPLEMENTATION_AUDIT.md`: Complete audit of 24 core requirement areas showing 100% PASS status.
- `docs/V1_TEST_MATRIX.md`: Mapping of all 50 automated test cases against `docs/10_TESTING_CHECKLIST.md`.
- `docs/V1_PERFORMANCE_REPORT.md`: Benchmarks across 1,000, 5,000, 10,000, and 20,000 photo references (<0.1ms candidate latency, <7.5 MB heap).
- `docs/V1_VISUAL_REVIEW.md`: Multi-viewport layout verification (1440px, 1024px, 768px, 390px, 360px).
- `PhotoSourceRepository` and `photo_sources` table in Dexie database conforming to `docs/04_DATABASE_SCHEMA.md`.
- Unknown-duration toggle in `ManualEntryModal` allowing session count logging without false duration inflation.
- Dedicated tests for Pin Engine sequence (`A📌 B / C D📌` -> Manual Next -> Auto Next -> Replace A -> `I📌` with pin retention).
- Dedicated tests for Replace One single-slot isolation and history undo.
- Dedicated tests for No-Repeat Shuffle 100-photo cycle exhaustiveness without premature duplicates.
- Dedicated tests for Session Timer Fantasy Time decoupling on pause and 120s background grace timeout.
- Dedicated tests for multi-session calendar aggregation (20m + 15m + 25m = 3 sessions, 60m total duration).

### Fixed
- Fixed collection primary key collision by appending random entropy in `CollectionRepository.createCollection`.
- Scoped localized replace transition (`duration-replace` 200ms) to prevent global screen flash during single-slot replaces.
- Enhanced mobile touch targets on `PhotoSlot` action buttons to minimum 36px–40px.
- Guaranteed that hiding a photo during an active session immediately purges it from the running `ShuffleEngine` queue and pool.

---

## [1.0.0] - 2026-09-23 — Initial V1 Implementation

### Added
- Foundation setup with React 18, Vite, TypeScript, Tailwind CSS, Dexie.js.
- Core domain engines: `ShuffleEngine`, `PinEngine`, `PlayerStateEngine`, `SessionTimerEngine`, `CalendarAggregator`.
- Dexie IndexedDB repository layer (`PhotoRepository`, `CollectionRepository`, `CalendarRepository`, `SessionRepository`).
- Responsive visual prototypes and interfaces for 12 key screens.
- 23 initial unit tests.
