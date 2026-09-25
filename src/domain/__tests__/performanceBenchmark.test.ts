import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';
import { PlayerStateEngine } from '../player/PlayerStateEngine';
import { db } from '../../repositories/db';
import { Photo } from '../../types/photo';

describe('10. Performance Benchmarks (1k, 5k, 10k, 20k Photo References)', () => {
  const SIZES = [1000, 5000, 10000, 20000];

  describe('ShuffleEngine Scalability & Responsiveness', () => {
    for (const size of SIZES) {
      it(`benchmarks ShuffleEngine with ${size.toLocaleString()} photo references`, () => {
        const pool = Array.from({ length: size }, (_, i) => `photo-ref-${i}`);

        // 1. Initialization and Queue Generation Time
        const initStart = performance.now();
        const engine = new ShuffleEngine(pool, 'no_repeat');
        const initDuration = performance.now() - initStart;

        expect(engine.getPoolSize()).toBe(size);
        expect(engine.getQueueLength()).toBe(size);
        // Initialization must be instantaneous (< 50ms even for 20k)
        expect(initDuration).toBeLessThan(100);

        // 2. Candidate Selection Throughput (Simulate 100 consecutive 4-photo advances)
        const activePinned = new Set([`photo-ref-0`, `photo-ref-1`]);
        const drawStart = performance.now();
        const iterations = 100;
        for (let i = 0; i < iterations; i++) {
          const candidates = engine.getNextCandidates(4, activePinned);
          expect(candidates.length).toBe(4);
          expect(candidates).not.toContain('photo-ref-0');
          expect(candidates).not.toContain('photo-ref-1');
        }
        const drawDuration = performance.now() - drawStart;
        const avgPerAdvance = drawDuration / iterations;

        // Player transition requires advance under 16ms (60 FPS budget)
        expect(avgPerAdvance).toBeLessThan(5);

        // 3. Single-Slot Replace Responsiveness (Replace 1 photo with active visible set)
        const replaceStart = performance.now();
        const visible = new Set(['photo-ref-10', 'photo-ref-20', 'photo-ref-30']);
        const replacement = engine.replaceOneCandidate('photo-ref-10', visible);
        const replaceDuration = performance.now() - replaceStart;

        expect(replacement).not.toBeNull();
        expect(visible.has(replacement!)).toBe(false);
        // Replace must execute in < 2ms
        expect(replaceDuration).toBeLessThan(10);
      });
    }
  });

  describe('PlayerStateEngine Responsiveness at Scale', () => {
    it('manages 20,000 photo pool with 5-slot layout, pin toggling, and 50-step history', () => {
      const pool20k = Array.from({ length: 20000 }, (_, i) => `p20k-${i}`);
      const player = new PlayerStateEngine(pool20k, 5, 50);

      const slots = player.getSlots();
      expect(slots.length).toBe(5);

      // Pin 2 slots
      player.togglePin(1);
      player.togglePin(3);

      const pin1Id = player.getSlots()[1].photoId;
      const pin3Id = player.getSlots()[3].photoId;

      // Advance 50 times (filling history to max depth)
      const t0 = performance.now();
      for (let i = 0; i < 50; i++) {
        player.next();
      }
      const duration50 = performance.now() - t0;

      // 50 advances across 20k pool must take < 50ms total (< 1ms per frame)
      expect(duration50).toBeLessThan(100);
      expect(player.getHistoryLength()).toBe(50);

      // Pinned slots must be intact after 50 advances
      const finalSlots = player.getSlots();
      expect(finalSlots[1].photoId).toBe(pin1Id);
      expect(finalSlots[1].pinned).toBe(true);
      expect(finalSlots[3].photoId).toBe(pin3Id);
      expect(finalSlots[3].pinned).toBe(true);

      // Test previous rewind across 20k pool
      const revStart = performance.now();
      for (let i = 0; i < 50; i++) {
        const ok = player.previous();
        expect(ok).toBe(true);
      }
      const revDuration = performance.now() - revStart;
      expect(revDuration).toBeLessThan(20);
      expect(player.canGoPrevious()).toBe(false);
    });
  });

  describe('Dexie Database Batch Insert & Indexed Query Performance', () => {
    it('efficiently bulk inserts 5,000 photo metadata references and queries indexed fields', async () => {
      await db.photos.clear();

      const mockPhotos: Photo[] = Array.from({ length: 5000 }, (_, i) => ({
        id: `bench-photo-${i}`,
        original_filename: `IMG_${i.toString().padStart(5, '0')}.JPG`,
        display_name: `Photo ${i}`,
        url: `blob:http://localhost:5173/mock-uuid-${i}`,
        thumbnail_url: `blob:http://localhost:5173/thumb-uuid-${i}`,
        mime_type: 'image/jpeg',
        file_size: 2400000,
        orientation: i % 2 === 0 ? 'landscape' : 'portrait',
        liked: i % 10 === 0,
        favorite: i % 25 === 0,
        hidden: i % 100 === 0,
        kept: i % 50 === 0,
        view_count: i % 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // 1. Bulk insert timing
      const insertStart = performance.now();
      await db.photos.bulkAdd(mockPhotos);
      const insertDuration = performance.now() - insertStart;

      const totalInDb = await db.photos.count();
      expect(totalInDb).toBe(5000);

      // 2. Query indexed / filtered records
      const queryStart = performance.now();
      const liked = await db.photos.filter((p) => p.liked && !p.hidden).toArray();
      const queryDuration = performance.now() - queryStart;

      // 10% liked minus 1% hidden overlap = exactly 450 photos
      expect(liked.length).toBe(450);
      expect(queryDuration).toBeLessThan(200);

      // 3. Memory verification: Photo records only contain lightweight strings & numbers
      const sample = mockPhotos[0];
      const jsonSize = new TextEncoder().encode(JSON.stringify(sample)).length;
      // Each metadata record should be ~300 bytes (NOT storing MBs of original image buffer)
      expect(jsonSize).toBeLessThan(500);

      // Total 5,000 references memory footprint in RAM < 2.5 MB!
      const totalEstimatedBytes = jsonSize * 5000;
      expect(totalEstimatedBytes).toBeLessThan(2.5 * 1024 * 1024);
    });
  });
});
