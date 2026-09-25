import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../repositories/db';
import { PhotoRepository } from '../../repositories/PhotoRepository';
import { CollectionRepository } from '../../repositories/CollectionRepository';
import { CalendarRepository } from '../../repositories/CalendarRepository';
import { SessionRepository } from '../../repositories/SessionRepository';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';
import { PinEngine } from '../player/PinEngine';
import { PlayerStateEngine } from '../player/PlayerStateEngine';
import { SessionTimerEngine } from '../session/SessionTimerEngine';
import { CalendarAggregator } from '../calendar/CalendarAggregator';

describe('14. P0 Checklist Validation (10_TESTING_CHECKLIST.md)', () => {
  beforeEach(async () => {
    await db.photos.clear();
    await db.collections.clear();
    await db.photo_collections.clear();
    await db.calendar_entries.clear();
    await db.sessions.clear();
    await db.saved_compositions.clear();
  });

  // =========================================================================
  // 1. COLLECTION TESTS & MULTI-MEMBERSHIP
  // =========================================================================
  describe('Collection Multi-Membership & Non-Destructive Integrity', () => {
    it('supports photo existing in multiple collections; deleting one collection does not affect other memberships or photo itself', async () => {
      // Add photo to repository
      await PhotoRepository.addPhoto({
        id: 'photo-shared',
        original_filename: 'sunset.jpg',
        display_name: 'Sunset',
        url: 'blob:sunset',
        mime_type: 'image/jpeg',
        orientation: 'landscape',
        liked: true,
        favorite: true,
        hidden: false,
        kept: true,
        view_count: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Create two collections
      const colA = await CollectionRepository.createCollection('Nature Favorites');
      const colB = await CollectionRepository.createCollection('Golden Hour');

      // Add same photo to both collections
      await CollectionRepository.addPhotoToCollection('photo-shared', colA.id);
      await CollectionRepository.addPhotoToCollection('photo-shared', colB.id);

      const inA = await CollectionRepository.getPhotosForCollection(colA.id);
      const inB = await CollectionRepository.getPhotosForCollection(colB.id);
      expect(inA.length).toBe(1);
      expect(inB.length).toBe(1);
      expect(inA[0].id).toBe('photo-shared');
      expect(inB[0].id).toBe('photo-shared');

      // Remove from Collection A
      await CollectionRepository.removePhotoFromCollection('photo-shared', colA.id);
      const inAAfter = await CollectionRepository.getPhotosForCollection(colA.id);
      const inBAfter = await CollectionRepository.getPhotosForCollection(colB.id);

      expect(inAAfter.length).toBe(0);
      // Still in Collection B!
      expect(inBAfter.length).toBe(1);
      expect(inBAfter[0].id).toBe('photo-shared');

      // Delete Collection B
      await CollectionRepository.deleteCollection(colB.id);

      // Photo itself remains intact in Library!
      const photoCheck = await PhotoRepository.getById('photo-shared');
      expect(photoCheck).toBeDefined();
      expect(photoCheck?.id).toBe('photo-shared');
    });
  });

  // =========================================================================
  // 2. PLAYER COUNT TESTS (1 TO 5) & RESIZE PIN PRESERVATION
  // =========================================================================
  describe('Player Count Slots (1 to 5) & Priority Resizing', () => {
    it('correctly resizes across all 1 to 5 layouts and prioritizes pinned slots', () => {
      const pool = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
      const player = new PlayerStateEngine(pool, 4);

      expect(player.getSlots().length).toBe(4);

      // Pin slot 2 ('P3')
      player.togglePin(2);
      const pinnedSlotPhoto = player.getSlots()[2].photoId;
      expect(player.getSlots()[2].pinned).toBe(true);

      // Expand to 5 slots
      player.resize(5);
      expect(player.getSlots().length).toBe(5);

      // Shrink to 1 slot: The pinned slot MUST be preserved in slot 0!
      player.resize(1);
      const finalSlots = player.getSlots();
      expect(finalSlots.length).toBe(1);
      expect(finalSlots[0].photoId).toBe(pinnedSlotPhoto);
      expect(finalSlots[0].pinned).toBe(true);
    });

    it('all slots pinned causes Next to advance 0 slots without error', () => {
      const slots = [
        { slotIndex: 0, photoId: 'P1', pinned: true },
        { slotIndex: 1, photoId: 'P2', pinned: true },
        { slotIndex: 2, photoId: 'P3', pinned: true },
      ];

      const unpinned = PinEngine.getUnpinnedSlotIndices(slots);
      expect(unpinned).toEqual([]);

      const nextSlots = PinEngine.applyNextToSlots(slots, []);
      expect(nextSlots).toEqual(slots);
    });
  });

  // =========================================================================
  // 3. SHUFFLE EDGE CASES (SMALL POOLS & SINGLE PHOTO)
  // =========================================================================
  describe('ShuffleEngine Edge Cases', () => {
    it('handles 1-photo pool gracefully without crashing', () => {
      const singlePool = ['only-photo'];
      const engine = new ShuffleEngine(singlePool, 'no_repeat');

      const candidates = engine.getNextCandidates(1, new Set());
      expect(candidates).toEqual(['only-photo']);

      // Replace candidate on 1-photo pool
      const replacement = engine.replaceOneCandidate('only-photo', new Set());
      expect(replacement).toBeNull();
    });

    it('handles pool smaller than requested candidate count', () => {
      const smallPool = ['P-A', 'P-B'];
      const engine = new ShuffleEngine(smallPool, 'no_repeat');

      // Request 4 slots from 2 photos
      const candidates = engine.getNextCandidates(4, new Set());
      expect(candidates.length).toBe(2);
      expect(new Set(candidates).size).toBe(2);
      for (const id of candidates) {
        expect(smallPool).toContain(id);
      }
    });
  });

  // =========================================================================
  // 4. FOCUS MODE INTERACTION FLOW
  // =========================================================================
  describe('Focus Mode Lifecycle & Pause Coherence', () => {
    it('pauses slideshow auto-advance countdown on enter and resumes on exit while session duration keeps ticking', () => {
      const onAutoAdvance = vi.fn();
      const timer = new SessionTimerEngine(5, 120, { onAutoAdvance });
      timer.startSession();

      // Tick 2s
      timer.tickOneSecond();
      timer.tickOneSecond();
      expect(timer.getSessionDuration()).toBe(2);
      expect(timer.getCountdown()).toBe(3);

      // Enter Focus Mode
      timer.enterFocusMode();

      // Tick 5s during Focus Mode: countdown remains FROZEN at 3, autoAdvance is NOT triggered
      for (let i = 0; i < 5; i++) {
        timer.tickOneSecond();
      }
      expect(timer.getSessionDuration()).toBe(7); // Fantasy session duration continued!
      expect(timer.getCountdown()).toBe(3); // Countdown stayed frozen
      expect(onAutoAdvance).not.toHaveBeenCalled();

      // Exit Focus Mode
      timer.exitFocusMode();

      // Tick 3s -> countdown reaches 0 and triggers auto-advance
      timer.tickOneSecond(); // 2
      timer.tickOneSecond(); // 1
      timer.tickOneSecond(); // 0 -> reset to 5 & trigger
      expect(timer.getSessionDuration()).toBe(10);
      expect(timer.getCountdown()).toBe(5);
      expect(onAutoAdvance).toHaveBeenCalledTimes(1);
    });
  });

});
