import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';
import { PinEngine } from '../player/PinEngine';
import { PlayerStateEngine } from '../player/PlayerStateEngine';
import { SessionTimerEngine } from '../session/SessionTimerEngine';
import { CalendarAggregator } from '../calendar/CalendarAggregator';
import { CalendarEntry } from '../../types/calendar';

describe('1. ShuffleEngine (No Repeat & Exclusion)', () => {
  it('should initialize and exhaust queue without repetition before reshuffling', () => {
    const pool = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5'];
    const engine = new ShuffleEngine(pool, 'no_repeat');

    const firstBatch = engine.getNextCandidates(3, new Set());
    expect(firstBatch.length).toBe(3);
    expect(new Set(firstBatch).size).toBe(3);

    // Pull remaining 2 from pool
    const secondBatch = engine.getNextCandidates(2, new Set(firstBatch));
    expect(secondBatch.length).toBe(2);

    // Total unique items seen across the cycle should be 5
    const allSeen = [...firstBatch, ...secondBatch];
    expect(new Set(allSeen).size).toBe(5);
  });

  it('should strictly exclude currently visible photo IDs from candidate selection', () => {
    const pool = ['photo-A', 'photo-B', 'photo-C', 'photo-D'];
    const engine = new ShuffleEngine(pool, 'no_repeat');

    const activeSet = new Set(['photo-A', 'photo-B']);
    const candidates = engine.getNextCandidates(2, activeSet);

    // Must not pick photo-A or photo-B
    expect(candidates).not.toContain('photo-A');
    expect(candidates).not.toContain('photo-B');
    expect(candidates.length).toBe(2);
  });

  it('restores the unconsumed queue in the same order after an interruption', () => {
    const engine = new ShuffleEngine(['a', 'b', 'c', 'd'], 'no_repeat');
    engine.getNextCandidates(1, new Set());
    const snapshot = engine.snapshot();
    const expected = engine.getNextCandidates(2, new Set());
    const restored = new ShuffleEngine(snapshot.pool, snapshot.mode);
    restored.restore(snapshot);
    expect(restored.getNextCandidates(2, new Set())).toEqual(expected);
  });

  it('replaceOneCandidate should exclude the current slot and all other visible slots', () => {
    const pool = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5'];
    const engine = new ShuffleEngine(pool, 'no_repeat');

    const currentVisible = new Set(['photo-1', 'photo-2', 'photo-3']);
    const replacement = engine.replaceOneCandidate('photo-2', currentVisible);

    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe('photo-1');
    expect(replacement).not.toBe('photo-2');
    expect(replacement).not.toBe('photo-3');
    expect(['photo-4', 'photo-5']).toContain(replacement);
  });
});

describe('2. PinEngine & Section 7 Mandate', () => {
  it('should preserve pinned slots during Next transition (A📌 B / C D📌 -> A📌 E / F D📌)', () => {
    const initialSlots = [
      { slotIndex: 0, photoId: 'photo-A', pinned: true },
      { slotIndex: 1, photoId: 'photo-B', pinned: false },
      { slotIndex: 2, photoId: 'photo-C', pinned: false },
      { slotIndex: 3, photoId: 'photo-D', pinned: true },
    ];

    const unpinnedIndices = PinEngine.getUnpinnedSlotIndices(initialSlots);
    expect(unpinnedIndices).toEqual([1, 2]);

    const newCandidates = ['photo-E', 'photo-F'];
    const nextSlots = PinEngine.applyNextToSlots(initialSlots, newCandidates);

    // Slot 0 (A) and Slot 3 (D) must remain unchanged and pinned!
    expect(nextSlots[0]).toEqual({ slotIndex: 0, photoId: 'photo-A', pinned: true });
    expect(nextSlots[3]).toEqual({ slotIndex: 3, photoId: 'photo-D', pinned: true });

    // Slot 1 and Slot 2 must have new photos E and F
    expect(nextSlots[1]).toEqual({ slotIndex: 1, photoId: 'photo-E', pinned: false });
    expect(nextSlots[2]).toEqual({ slotIndex: 2, photoId: 'photo-F', pinned: false });
  });

  it('explicit Replace on a pinned slot replaces photo but KEEPS THE SLOT PINNED', () => {
    const slots = [
      { slotIndex: 0, photoId: 'photo-A', pinned: true },
      { slotIndex: 1, photoId: 'photo-B', pinned: false },
    ];

    // User replaces slot 0 (A 📌 -> G 📌)
    const afterReplace = PinEngine.replaceSlotPhoto(slots, 0, 'photo-G');

    expect(afterReplace[0].photoId).toBe('photo-G');
    expect(afterReplace[0].pinned).toBe(true); // Must remain pinned!
    expect(afterReplace[1].photoId).toBe('photo-B');
  });

  it('resizing slots prioritizes keeping pinned slots', () => {
    const slots = [
      { slotIndex: 0, photoId: 'photo-1', pinned: false },
      { slotIndex: 1, photoId: 'photo-2', pinned: true },
      { slotIndex: 2, photoId: 'photo-3', pinned: false },
      { slotIndex: 3, photoId: 'photo-4', pinned: true },
      { slotIndex: 4, photoId: 'photo-5', pinned: false },
    ];

    // Reduce from 5 to 2 slots -> Pinned slots (photo-2 and photo-4) must be kept
    const reduced = PinEngine.resizeSlots(slots, 2, () => 'fallback');
    expect(reduced.length).toBe(2);
    expect(reduced.map((s) => s.photoId)).toEqual(['photo-2', 'photo-4']);
  });
});

describe('3. PlayerStateEngine & History Navigation', () => {
  it('should support next and previous history restoration', () => {
    const pool = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5', 'photo-6', 'photo-7', 'photo-8'];
    const engine = new PlayerStateEngine(pool, 4);

    const initial = engine.getSlots();
    expect(initial.length).toBe(4);
    expect(engine.canGoPrevious()).toBe(false);

    // Advance to next display
    engine.next();
    expect(engine.canGoPrevious()).toBe(true);
    expect(engine.getHistoryLength()).toBe(1);

    const secondDisplay = engine.getSlots();
    expect(secondDisplay.map((s) => s.photoId)).not.toEqual(initial.map((s) => s.photoId));

    // Go previous -> restores initial display exactly
    const reverted = engine.previous();
    expect(reverted).toBe(true);
    expect(engine.getSlots()).toEqual(initial);
    expect(engine.canGoPrevious()).toBe(false);
  });

  it('replaceOne creates a history state and only mutates the single targeted slot', () => {
    const pool = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5', 'photo-6'];
    const engine = new PlayerStateEngine(pool, 3);

    const before = engine.getSlots();
    const replacedPhotoId = engine.replaceOne(1); // Replace slot 1

    expect(replacedPhotoId).not.toBeNull();
    const after = engine.getSlots();

    // Slot 0 and Slot 2 must be identical
    expect(after[0]).toEqual(before[0]);
    expect(after[2]).toEqual(before[2]);

    // Slot 1 must have the new photoId
    expect(after[1].photoId).toBe(replacedPhotoId);
    expect(after[1].slotIndex).toBe(1);
    expect(engine.canGoPrevious()).toBe(true);
  });
});

describe('4. SessionTimerEngine (Timing, Slideshow Pause, Background Grace)', () => {
  it('should accumulate session duration on tick, and auto-advance when countdown reaches 0', () => {
    const onAutoAdvance = vi.fn();
    const timer = new SessionTimerEngine(3, 120, { onAutoAdvance });

    timer.startSession();
    expect(timer.getStatus()).toBe('active');
    expect(timer.getSessionDuration()).toBe(0);
    expect(timer.getCountdown()).toBe(3);

    timer.tickOneSecond(); // 1s
    expect(timer.getSessionDuration()).toBe(1);
    expect(timer.getCountdown()).toBe(2);

    timer.tickOneSecond(); // 2s
    expect(timer.getSessionDuration()).toBe(2);
    expect(timer.getCountdown()).toBe(1);

    timer.tickOneSecond(); // 3s -> countdown reached 0, resets to 3 and triggers auto-advance
    expect(timer.getSessionDuration()).toBe(3);
    expect(timer.getCountdown()).toBe(3);
    expect(onAutoAdvance).toHaveBeenCalledTimes(1);
  });

  it('slideshow pause halts countdown but DOES NOT pause session duration', () => {
    const timer = new SessionTimerEngine(5, 120);
    timer.startSession();

    // Pause slideshow
    timer.togglePlaySlideshow();
    expect(timer.isPlaying()).toBe(false);

    timer.tickOneSecond();
    timer.tickOneSecond();

    // Duration continues counting (Fantasy Time)!
    expect(timer.getSessionDuration()).toBe(2);
    // Countdown stays frozen at 5
    expect(timer.getCountdown()).toBe(5);
  });

  it('focus mode halts countdown while session duration continues', () => {
    const timer = new SessionTimerEngine(5, 120);
    timer.startSession();

    timer.enterFocusMode();
    timer.tickOneSecond();

    expect(timer.getSessionDuration()).toBe(1);
    expect(timer.getCountdown()).toBe(5);

    timer.exitFocusMode();
    timer.tickOneSecond();
    expect(timer.getSessionDuration()).toBe(2);
    expect(timer.getCountdown()).toBe(4);
  });

  it('background grace period: resumes if returning within 120s', () => {
    const timer = new SessionTimerEngine(7, 120);
    timer.startSession();
    const t0 = 1000000;

    timer.enterBackground(t0);
    expect(timer.getStatus()).toBe('background_grace');

    // Return 60 seconds later (within 120s grace)
    const resumed = timer.resumeFromBackground(t0 + 60 * 1000);
    expect(resumed).toBe(true);
    expect(timer.getStatus()).toBe('active');
    expect(timer.getSessionDuration()).toBe(60);
  });

  it('background grace period: auto-ends session if exceeding 120s', () => {
    const onTimeout = vi.fn();
    const timer = new SessionTimerEngine(7, 120, { onSessionTimeout: onTimeout });
    timer.startSession();
    const t0 = 1000000;

    timer.enterBackground(t0);
    expect(timer.getStatus()).toBe('background_grace');

    // Return 300 seconds later (exceeding 120s grace)
    const resumed = timer.resumeFromBackground(t0 + 300 * 1000);
    expect(resumed).toBe(false);
    expect(timer.getStatus()).toBe('ended');
    // Session duration capped to grace period (120s)
    expect(timer.getSessionDuration()).toBe(120);
    expect(onTimeout).toHaveBeenCalledWith(120);
  });
});

describe('5. CalendarAggregator (Daily & Observational Metrics)', () => {
  const sampleEntries: CalendarEntry[] = [
    {
      id: 'e1',
      entry_date: '2026-09-23',
      manual: false,
      count_value: 1,
      duration_seconds: 1500, // 25m
    },
    {
      id: 'e2',
      entry_date: '2026-09-23',
      manual: true,
      count_value: 1,
      duration_seconds: 600, // 10m
    },
    {
      id: 'e3',
      entry_date: '2026-09-23',
      manual: true,
      count_value: 2,
      duration_seconds: 0, // Manual count without duration
    },
    {
      id: 'e4',
      entry_date: '2026-09-22',
      manual: false,
      count_value: 1,
      duration_seconds: 1800, // 30m
    },
  ];

  it('calculates daily totals: manual count adds to sessions; manual without duration does not inflate duration', () => {
    const summary = CalendarAggregator.getDaySummary(sampleEntries, '2026-09-23');

    // 1 auto + 1 manual + 2 manual = 4 sessions
    expect(summary.session_count).toBe(4);
    // 1500 + 600 + 0 = 2100 seconds (35 min)
    expect(summary.total_duration_seconds).toBe(2100);
  });

  it('average session duration excludes manual entries that have 0 duration', () => {
    const stats = CalendarAggregator.computeStats(sampleEntries, '2026-09-23');

    // Sessions with duration: e1 (1500s / 1), e2 (600s / 1), e4 (1800s / 1) -> 3900s / 3 sessions = 1300s
    expect(stats.average_session_seconds).toBe(1300);
    expect(stats.active_days).toBe(2);
  });
});
