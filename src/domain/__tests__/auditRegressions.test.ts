import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';
import { PlayerStateEngine } from '../player/PlayerStateEngine';
import { PinEngine } from '../player/PinEngine';
import { SessionTimerEngine } from '../session/SessionTimerEngine';
import { CalendarAggregator } from '../calendar/CalendarAggregator';
import { CalendarEntry } from '../../types/calendar';
import { parsePublicDrivePhotoLink } from '../photo/driveLinks';

afterEach(() => vi.useRealTimers());

describe('Public Google Drive photo links', () => {
  it('converts supported public file links and preserves the resource key', () => {
    const parsed = parsePublicDrivePhotoLink('https://drive.google.com/file/d/abcdefghijk123456/view?resourcekey=key_123');
    expect(parsed.fileId).toBe('abcdefghijk123456');
    expect(new URL(parsed.imageUrl).searchParams.get('resourcekey')).toBe('key_123');
    expect(new URL(parsed.imageUrl).searchParams.get('export')).toBe('view');
  });

  it('rejects non-Drive hosts, folders, and invalid IDs before persistence', () => {
    expect(() => parsePublicDrivePhotoLink('https://example.com/file/d/abcdefghijk123456/view')).toThrow();
    expect(() => parsePublicDrivePhotoLink('https://drive.google.com/drive/folders/abcdefghijk123456')).toThrow();
    expect(() => parsePublicDrivePhotoLink('https://drive.google.com/open?id=short')).toThrow();
  });
});

describe('Audit regressions: display integrity', () => {
  it.each(['no_repeat', 'pure_shuffle'] as const)('%s never fills a small/exhausted pool with duplicates or excluded photos', (mode) => {
    for (let size = 1; size <= 5; size++) {
      const pool = Array.from({ length: size }, (_, index) => String(index));
      const engine = new ShuffleEngine(pool, mode);
      for (let excluded = 0; excluded <= size; excluded++) {
        const visible = new Set(pool.slice(0, excluded));
        const candidates = engine.getNextCandidates(5, visible);
        expect(candidates).toHaveLength(size - excluded);
        expect(new Set(candidates).size).toBe(candidates.length);
        expect(candidates.some((id) => visible.has(id))).toBe(false);
      }
      expect(engine.replaceOneCandidate(pool[0], new Set(pool))).toBeNull();
    }
  });

  it('keeps a bounded history only when the display changes', () => {
    const player = new PlayerStateEngine(['a', 'b'], 5);
    expect(player.getSlots()).toHaveLength(2);
    player.next();
    expect(player.replaceOne(0)).toBeNull();
    expect(player.getHistoryLength()).toBe(0);
    player.togglePin(0);
    player.togglePin(1);
    player.next();
    expect(player.getHistoryLength()).toBe(0);
  });

  it('expands through one distinct batch and returns isolated snapshots', () => {
    const player = new PlayerStateEngine(['a', 'b', 'c'], 1);
    player.resize(5);
    expect(player.getSlots()).toHaveLength(3);
    expect(new Set(player.getSlots().map((slot) => slot.photoId)).size).toBe(3);
    player.getSlots()[0].photoId = 'external-mutation';
    expect(player.getSlots()[0].photoId).not.toBe('external-mutation');
    expect(player.previous()).toBe(true);
    expect(player.getSlots()).toHaveLength(1);
  });

  it('restores forward history after Previous and branches on Pin', () => {
    const player = new PlayerStateEngine(['a', 'b', 'c', 'd', 'e', 'f'], 2, 2);
    player.next();
    const nextDisplay = player.getSlots();
    player.previous();
    player.next();
    expect(player.getSlots()).toEqual(nextDisplay);
    player.previous();
    player.togglePin(0);
    const pinnedPhoto = player.getSlots()[0];
    player.next();
    expect(player.getSlots()[0]).toEqual(pinnedPhoto);
    for (let count = 0; count < 5; count++) player.next();
    expect(player.getHistoryLength()).toBe(2);
  });

  it('hides an active pinned photo immediately and removes it from all history', () => {
    const player = new PlayerStateEngine(['a', 'b', 'c', 'd', 'e', 'f'], 2);
    player.next();
    player.togglePin(0);
    const hiddenId = player.getSlots()[0].photoId;
    player.next();
    player.previous();
    player.removePhotoFromPool(hiddenId);
    expect(player.getSlots()[0].pinned).toBe(false);
    expect(player.getSlots().some((slot) => slot.photoId === hiddenId)).toBe(false);
    while (player.previous()) expect(player.getSlots().some((slot) => slot.photoId === hiddenId)).toBe(false);
    for (let i = 0; i < 10; i++) {
      player.next();
      expect(player.getSlots().some((slot) => slot.photoId === hiddenId)).toBe(false);
    }
  });

  it('keeps retained slots in visual order on shrink and rejects colliding candidates', () => {
    const slots = ['a', 'b', 'c', 'd'].map((photoId, slotIndex) => ({ photoId, slotIndex, pinned: slotIndex === 1 }));
    expect(PinEngine.resizeSlots(slots, 3, () => '').map((slot) => slot.photoId)).toEqual(['a', 'b', 'c']);
    const next = PinEngine.applyNextToSlots(slots, ['b', 'e', 'e']);
    expect(new Set(next.map((slot) => slot.photoId)).size).toBe(4);
    expect(PinEngine.replaceSlotPhoto(slots, 0, 'b')).toEqual(slots);
  });
});

describe('Audit regressions: real elapsed time', () => {
  it('counts delayed ticks using elapsed time, pauses only slideshow and avoids transition bursts', () => {
    const onAutoAdvance = vi.fn();
    const timer = new SessionTimerEngine(3, 120, { onAutoAdvance });
    timer.startSession(0);
    timer.tick(5700);
    expect(timer.getSessionDuration()).toBe(5);
    expect(onAutoAdvance).toHaveBeenCalledTimes(1);
    timer.togglePlaySlideshow();
    timer.tick(11500);
    expect(timer.getSessionDuration()).toBe(11);
    expect(timer.getCountdown()).toBe(3);
    expect(timer.endSession(12000)).toBe(12);
    timer.tick(20000);
    expect(timer.getSessionDuration()).toBe(12);
  });

  it('ends while backgrounded exactly at the grace deadline and fires only once', () => {
    const onSessionTimeout = vi.fn();
    const timer = new SessionTimerEngine(7, 120, { onSessionTimeout });
    timer.startSession(0);
    timer.enterBackground(1500);
    timer.tick(121499);
    expect(timer.getStatus()).toBe('background_grace');
    timer.tick(121500);
    expect(timer.getStatus()).toBe('ended');
    expect(timer.getSessionDuration()).toBe(121);
    timer.tick(400000);
    expect(timer.resumeFromBackground(400000)).toBe(false);
    expect(onSessionTimeout).toHaveBeenCalledExactlyOnceWith(121);
  });

  it('preserves fractional elapsed time across background resume and manual end', () => {
    const timer = new SessionTimerEngine(7, 120);
    timer.startSession(0);
    timer.enterBackground(1500);
    expect(timer.resumeFromBackground(61000)).toBe(true);
    expect(timer.getSessionDuration()).toBe(61);
    timer.enterBackground(61500);
    expect(timer.endSession(63000)).toBe(63);
  });

  it('treats zero grace as immediate timeout and ignores a backward clock tick', () => {
    const timer = new SessionTimerEngine(7, 0);
    timer.startSession(1000);
    timer.tick(0);
    expect(timer.getSessionDuration()).toBe(0);
    timer.enterBackground(2000);
    expect(timer.getStatus()).toBe('ended');
    expect(timer.getSessionDuration()).toBe(1);
  });
});

describe('Audit regressions: calendar boundaries', () => {
  const entry = (date: string, count = 1, duration = 60, manual = false): CalendarEntry => ({
    id: `${date}-${count}`, entry_date: date, count_value: count, duration_seconds: duration, manual,
  });

  it('uses Monday-first calendar weeks and actual calendar months, excluding future dates', () => {
    const entries = ['2025-12-31', '2026-01-31', '2026-02-01', '2026-02-02', '2026-02-03'].map((date) => entry(date));
    const monday = CalendarAggregator.computeStats(entries, '2026-02-02');
    expect(monday.week_sessions).toBe(1);
    expect(monday.month_sessions).toBe(2);
    expect(monday.active_days).toBe(4);
    const sunday = CalendarAggregator.computeStats(entries, '2026-02-01');
    expect(sunday.week_sessions).toBe(2);
    expect(sunday.month_sessions).toBe(1);
  });

  it('uses the local date at midnight instead of a fixed or UTC date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 0, 2, 0, 15));
    expect(CalendarAggregator.localDateKey()).toBe('2030-01-02');
    expect(CalendarAggregator.computeStats([entry('2030-01-02')]).today_sessions).toBe(1);
    expect(CalendarAggregator.isValidDate('2030-02-30')).toBe(false);
  });

  it('counts automatic zero duration as known and excludes unknown manual duration from averages', () => {
    const stats = CalendarAggregator.computeStats([
      entry('2026-09-23', 1, 60), entry('2026-09-23', 1, 0), entry('2026-09-23', 3, 0, true),
      entry('2026-09-22', 0, 0), entry('2026-09-24', 1, 9999),
    ], '2026-09-23');
    expect(stats.today_sessions).toBe(5);
    expect(stats.today_duration_seconds).toBe(60);
    expect(stats.average_session_seconds).toBe(30);
    expect(stats.active_days).toBe(1);
  });
});
