import { describe, it, expect, vi } from 'vitest';
import { PinEngine } from '../player/PinEngine';
import { PlayerStateEngine } from '../player/PlayerStateEngine';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';
import { SessionTimerEngine } from '../session/SessionTimerEngine';
import { CalendarAggregator } from '../calendar/CalendarAggregator';
import { CalendarEntry } from '../../types/calendar';

describe('V1 QUALITY GATE — Core Domain & Specification Conformance', () => {

  // =========================================================================
  // SECTION 2: VERIFY PIN ENGINE
  // =========================================================================
  describe('Section 2: Pin Engine Verification', () => {
    it('executes exact scenario: A📌 B / C D📌 -> Manual Next -> Auto Next -> Replace A -> I📌', () => {
      // Step 1: Initial state
      // Slot 0: Photo A (pinned)
      // Slot 1: Photo B (unpinned)
      // Slot 2: Photo C (unpinned)
      // Slot 3: Photo D (pinned)
      const pool = [
        'Photo-A', 'Photo-B', 'Photo-C', 'Photo-D',
        'Photo-E', 'Photo-F', 'Photo-G', 'Photo-H',
        'Photo-I', 'Photo-J', 'Photo-K'
      ];

      const initialSlots = [
        { slotIndex: 0, photoId: 'Photo-A', pinned: true },
        { slotIndex: 1, photoId: 'Photo-B', pinned: false },
        { slotIndex: 2, photoId: 'Photo-C', pinned: false },
        { slotIndex: 3, photoId: 'Photo-D', pinned: true },
      ];

      // Step 2: Manual Next
      // Expected:
      // A📌  E
      // F    D📌
      const unpinned1 = PinEngine.getUnpinnedSlotIndices(initialSlots);
      expect(unpinned1).toEqual([1, 2]);

      const manualNextCandidates = ['Photo-E', 'Photo-F'];
      const afterManualNext = PinEngine.applyNextToSlots(initialSlots, manualNextCandidates);

      expect(afterManualNext[0]).toEqual({ slotIndex: 0, photoId: 'Photo-A', pinned: true }); // A unchanged & pinned
      expect(afterManualNext[1]).toEqual({ slotIndex: 1, photoId: 'Photo-E', pinned: false }); // B -> E
      expect(afterManualNext[2]).toEqual({ slotIndex: 2, photoId: 'Photo-F', pinned: false }); // C -> F
      expect(afterManualNext[3]).toEqual({ slotIndex: 3, photoId: 'Photo-D', pinned: true }); // D unchanged & pinned

      // Step 3: Auto Next
      // Expected:
      // A📌  G
      // H    D📌
      const unpinned2 = PinEngine.getUnpinnedSlotIndices(afterManualNext);
      expect(unpinned2).toEqual([1, 2]);

      const autoNextCandidates = ['Photo-G', 'Photo-H'];
      const afterAutoNext = PinEngine.applyNextToSlots(afterManualNext, autoNextCandidates);

      expect(afterAutoNext[0]).toEqual({ slotIndex: 0, photoId: 'Photo-A', pinned: true }); // A still unchanged & pinned
      expect(afterAutoNext[1]).toEqual({ slotIndex: 1, photoId: 'Photo-G', pinned: false }); // E -> G
      expect(afterAutoNext[2]).toEqual({ slotIndex: 2, photoId: 'Photo-H', pinned: false }); // F -> H
      expect(afterAutoNext[3]).toEqual({ slotIndex: 3, photoId: 'Photo-D', pinned: true }); // D still unchanged & pinned

      // Step 4: Replace A (Slot 0)
      // Expected:
      // I📌
      // Slot must remain pinned!
      const afterReplaceA = PinEngine.replaceSlotPhoto(afterAutoNext, 0, 'Photo-I');

      expect(afterReplaceA[0]).toEqual({ slotIndex: 0, photoId: 'Photo-I', pinned: true }); // Photo is I and stays PINNED!
      expect(afterReplaceA[1]).toEqual({ slotIndex: 1, photoId: 'Photo-G', pinned: false }); // Slot 1 unchanged
      expect(afterReplaceA[2]).toEqual({ slotIndex: 2, photoId: 'Photo-H', pinned: false }); // Slot 2 unchanged
      expect(afterReplaceA[3]).toEqual({ slotIndex: 3, photoId: 'Photo-D', pinned: true }); // Slot 3 unchanged & pinned
    });

    it('verifies PlayerStateEngine execution of the full Pin scenario with unpin and history', () => {
      const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
      const engine = new PlayerStateEngine(pool, 4);

      // Pin slot 0 and slot 3
      engine.togglePin(0);
      engine.togglePin(3);

      const s0 = engine.getSlots();
      expect(s0[0].pinned).toBe(true);
      expect(s0[3].pinned).toBe(true);
      const pinnedPhoto0 = s0[0].photoId;
      const pinnedPhoto3 = s0[3].photoId;

      // Next advance
      engine.next();
      const s1 = engine.getSlots();
      expect(s1[0].photoId).toBe(pinnedPhoto0);
      expect(s1[0].pinned).toBe(true);
      expect(s1[3].photoId).toBe(pinnedPhoto3);
      expect(s1[3].pinned).toBe(true);

      // Replace slot 0
      const newId = engine.replaceOne(0);
      expect(newId).not.toBeNull();
      const s2 = engine.getSlots();
      expect(s2[0].photoId).toBe(newId);
      expect(s2[0].pinned).toBe(true); // Retains pinned status!

      // Unpin slot 0
      engine.togglePin(0);
      const s3 = engine.getSlots();
      expect(s3[0].pinned).toBe(false);
      // Photo stays until next advance
      expect(s3[0].photoId).toBe(newId);

      // Unpin all
      engine.unpinAll();
      const s4 = engine.getSlots();
      expect(s4.every((s) => !s.pinned)).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 3: VERIFY REPLACE ONE
  // =========================================================================
  describe('Section 3: Replace One Verification', () => {
    it('initial A B / C D -> Replace C -> A B / E D without regenerating other slots', () => {
      const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const engine = new PlayerStateEngine(pool, 4);

      const initial = engine.getSlots();
      const photoA = initial[0].photoId;
      const photoB = initial[1].photoId;
      const photoC = initial[2].photoId;
      const photoD = initial[3].photoId;

      // Replace C (Slot 2)
      const replacedId = engine.replaceOne(2);
      expect(replacedId).not.toBeNull();
      expect(replacedId).not.toBe(photoC); // C != E

      const updated = engine.getSlots();

      // Assert:
      // A unchanged
      expect(updated[0].photoId).toBe(photoA);
      // B unchanged
      expect(updated[1].photoId).toBe(photoB);
      // D unchanged
      expect(updated[3].photoId).toBe(photoD);
      // Slot 2 replaced by E
      expect(updated[2].photoId).toBe(replacedId);

      // History was preserved
      expect(engine.canGoPrevious()).toBe(true);
      const restored = engine.previous();
      expect(restored).toBe(true);
      expect(engine.getSlots()[2].photoId).toBe(photoC);
    });

    it('asserts candidate is not among other visible slots', () => {
      const pool = ['Photo-1', 'Photo-2', 'Photo-3', 'Photo-4'];
      const engine = new ShuffleEngine(pool, 'no_repeat');

      // Slots 0, 1, 2 are visible
      const visible = new Set(['Photo-1', 'Photo-2', 'Photo-3']);

      // Replace slot 1 ('Photo-2')
      const candidate = engine.replaceOneCandidate('Photo-2', visible);

      // Must be Photo-4 (the only one not visible)
      expect(candidate).toBe('Photo-4');
    });
  });

  // =========================================================================
  // SECTION 4: VERIFY NO-REPEAT SHUFFLE
  // =========================================================================
  describe('Section 4: No-Repeat Shuffle Verification', () => {
    it('runs 100 photos, 4 photos/display: ensures entire pool is seen before cycle completes without premature duplicates', () => {
      // Deterministic 100 photo pool
      const pool = Array.from({ length: 100 }, (_, i) => `photo-${i.toString().padStart(3, '0')}`);
      const engine = new ShuffleEngine(pool, 'no_repeat');

      const seenInCycle = new Set<string>();
      const displayCount = 4;
      const batchesPerCycle = 100 / displayCount; // 25 batches

      for (let b = 0; b < batchesPerCycle; b++) {
        const batch = engine.getNextCandidates(displayCount, new Set());

        // Assert: No duplicates within display
        expect(batch.length).toBe(displayCount);
        expect(new Set(batch).size).toBe(displayCount);

        // Assert: No premature duplicate in this cycle
        for (const id of batch) {
          expect(seenInCycle.has(id)).toBe(false);
          seenInCycle.add(id);
        }
      }

      // Entire pool of 100 photos has been seen exactly once
      expect(seenInCycle.size).toBe(100);

      // Next batch starts a new cycle (reshuffle occurs seamlessly)
      const nextCycleBatch = engine.getNextCandidates(displayCount, new Set());
      expect(nextCycleBatch.length).toBe(displayCount);
      expect(new Set(nextCycleBatch).size).toBe(displayCount);
      // All items in new cycle belong to pool
      for (const id of nextCycleBatch) {
        expect(pool).toContain(id);
      }
    });

    it('properly excludes pinned photos from unpinned candidate pool', () => {
      const pool = ['P-0', 'P-1', 'P-2', 'P-3', 'P-4', 'P-5'];
      const engine = new ShuffleEngine(pool, 'no_repeat');

      // Suppose P-0 and P-1 are pinned in visible slots
      const pinnedVisible = new Set(['P-0', 'P-1']);

      // Pull 4 candidates for remaining unpinned slots across two batches
      const batch1 = engine.getNextCandidates(2, pinnedVisible);
      expect(batch1).not.toContain('P-0');
      expect(batch1).not.toContain('P-1');

      const batch2 = engine.getNextCandidates(2, pinnedVisible);
      expect(batch2).not.toContain('P-0');
      expect(batch2).not.toContain('P-1');

      // Total 4 candidates drawn must all be unpinned
      const allDrawn = [...batch1, ...batch2];
      expect(allDrawn.sort()).toEqual(['P-2', 'P-3', 'P-4', 'P-5']);
    });

    it('hidden photos excluded immediately when removed from engine', () => {
      const pool = ['P-1', 'P-2', 'P-3', 'P-4', 'P-5'];
      const engine = new ShuffleEngine(pool, 'no_repeat');

      // User hides P-3 during session
      engine.removePhoto('P-3');
      expect(engine.getPoolSize()).toBe(4);

      // Next candidates will NEVER include P-3
      const allPicked: string[] = [];
      for (let i = 0; i < 4; i++) {
        const batch = engine.getNextCandidates(1, new Set(allPicked));
        if (batch[0]) allPicked.push(batch[0]);
      }

      expect(allPicked).not.toContain('P-3');
      expect(allPicked.length).toBe(4);
    });

    it('pure shuffle mode allows non-cyclical random candidate selection', () => {
      const pool = ['P-A', 'P-B', 'P-C'];
      const engine = new ShuffleEngine(pool, 'pure_shuffle');

      const candidates = engine.getNextCandidates(2, new Set(['P-A']));
      expect(candidates.length).toBe(2);
      expect(candidates).not.toContain('P-A');
    });
  });

  // =========================================================================
  // SECTION 5: VERIFY SESSION TIMER & BACKGROUND GRACE
  // =========================================================================
  describe('Section 5: Session Timer & Background Grace Verification', () => {
    it('verifies Fantasy Time continues during slideshow pause; handles background return < 2 min vs timeout > 2 min', () => {
      const onTimeout = vi.fn();
      const onAutoAdvance = vi.fn();
      const timer = new SessionTimerEngine(7, 120, {
        onSessionTimeout: onTimeout,
        onAutoAdvance,
      });

      // 1. Start Session
      timer.startSession();
      expect(timer.getStatus()).toBe('active');
      expect(timer.getSessionDuration()).toBe(0);
      expect(timer.getCountdown()).toBe(7);

      // 2. Active ticks for 3 seconds
      timer.tickOneSecond();
      timer.tickOneSecond();
      timer.tickOneSecond();
      expect(timer.getSessionDuration()).toBe(3);
      expect(timer.getCountdown()).toBe(4);

      // 3. Pause slideshow
      timer.togglePlaySlideshow();
      expect(timer.isPlaying()).toBe(false);

      // 4. Tick during pause: duration continues! (Player Pause != Fantasy Session End)
      timer.tickOneSecond();
      timer.tickOneSecond();
      expect(timer.getSessionDuration()).toBe(5);
      expect(timer.getCountdown()).toBe(4); // Countdown remains paused at 4

      // 5. Resume slideshow
      timer.togglePlaySlideshow();
      expect(timer.isPlaying()).toBe(true);

      timer.tickOneSecond();
      expect(timer.getSessionDuration()).toBe(6);
      expect(timer.getCountdown()).toBe(3);

      // 6. Enter background (e.g. at timestamp 1,000,000)
      const t0 = 1000000;
      timer.enterBackground(t0);
      expect(timer.getStatus()).toBe('background_grace');

      // 7. Return before 2 min (90s elapsed <= 120s grace)
      const resumeSuccess = timer.resumeFromBackground(t0 + 90 * 1000);
      expect(resumeSuccess).toBe(true);
      expect(timer.getStatus()).toBe('active');
      // Elapsed 90s added to Fantasy Time duration: 6 + 90 = 96s
      expect(timer.getSessionDuration()).toBe(96);

      // 8. Enter background again
      const t1 = t0 + 90 * 1000;
      timer.enterBackground(t1);
      expect(timer.getStatus()).toBe('background_grace');

      // 9. Timeout: Return after > 2 min (150s elapsed > 120s grace)
      const timeoutResume = timer.resumeFromBackground(t1 + 150 * 1000);
      expect(timeoutResume).toBe(false);
      expect(timer.getStatus()).toBe('ended');
      // Duration capped at grace period: 96 + 120 = 216s
      expect(timer.getSessionDuration()).toBe(216);
      expect(onTimeout).toHaveBeenCalledWith(216);
    });
  });

  // =========================================================================
  // SECTION 6: VERIFY CALENDAR AGGREGATION & MANUAL ENTRY
  // =========================================================================
  describe('Section 6: Calendar Aggregator & Manual Entry Verification', () => {
    it('verifies multiple sessions on same date (20m + 15m + 25m = 3 sessions, 60m total duration)', () => {
      const sameDayEntries: CalendarEntry[] = [
        {
          id: 'sess-a',
          entry_date: '2026-09-23',
          manual: false,
          count_value: 1,
          duration_seconds: 20 * 60, // 20 min = 1200s
        },
        {
          id: 'sess-b',
          entry_date: '2026-09-23',
          manual: false,
          count_value: 1,
          duration_seconds: 15 * 60, // 15 min = 900s
        },
        {
          id: 'sess-c',
          entry_date: '2026-09-23',
          manual: false,
          count_value: 1,
          duration_seconds: 25 * 60, // 25 min = 1500s
        },
      ];

      const summary = CalendarAggregator.getDaySummary(sameDayEntries, '2026-09-23');
      expect(summary.session_count).toBe(3);
      expect(summary.total_duration_seconds).toBe(3600); // 60 min
    });

    it('adds manual entry with unknown duration: sessions = 4, total duration = 60 min (no fake duration added)', () => {
      const entriesWithManual: CalendarEntry[] = [
        {
          id: 'sess-a',
          entry_date: '2026-09-23',
          manual: false,
          count_value: 1,
          duration_seconds: 20 * 60, // 1200s
        },
        {
          id: 'sess-b',
          entry_date: '2026-09-23',
          manual: false,
          count_value: 1,
          duration_seconds: 15 * 60, // 900s
        },
        {
          id: 'sess-c',
          entry_date: '2026-09-23',
          manual: false,
          count_value: 1,
          duration_seconds: 25 * 60, // 1500s
        },
        {
          id: 'sess-manual-unknown',
          entry_date: '2026-09-23',
          manual: true,
          count_value: 1,
          duration_seconds: 0, // Unknown duration
        },
      ];

      const summary = CalendarAggregator.getDaySummary(entriesWithManual, '2026-09-23');

      // Expected:
      // Sessions = 4
      expect(summary.session_count).toBe(4);
      // Total Duration = 60 min (3600 seconds)
      expect(summary.total_duration_seconds).toBe(3600);

      // Average session duration calculation:
      // Only 3 sessions have known duration (3600 / 3 = 1200s = 20 min)
      // The unknown duration entry MUST NOT dilute or falsify the average!
      const stats = CalendarAggregator.computeStats(entriesWithManual, '2026-09-23');
      expect(stats.average_session_seconds).toBe(1200);
      expect(stats.today_sessions).toBe(4);
      expect(stats.today_duration_seconds).toBe(3600);
    });
  });
});
