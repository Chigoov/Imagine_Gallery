import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../repositories/db';
import { PhotoRepository } from '../../repositories/PhotoRepository';
import { PinEngine } from '../player/PinEngine';
import { Photo } from '../../types/photo';

describe('UX & Storage Integrity Tests', () => {
  beforeEach(async () => {
    await db.photos.clear();
    await db.photo_files.clear();
    await db.photo_sources.clear();
    await db.collections.clear();
    await db.photo_collections.clear();
    PhotoRepository.releaseObjectUrls();
  });

  describe('Photo Status Classification', () => {
    const resolveStatus = (photo: { kept: boolean; missing?: boolean }) => {
      if (photo.kept) return 'Salinan tersimpan';
      if (photo.missing) return 'Perlu dipilih ulang';
      return 'Tersedia';
    };

    it('classifies photos accurately according to their storage condition', () => {
      expect(resolveStatus({ kept: true, missing: false })).toBe('Salinan tersimpan');
      expect(resolveStatus({ kept: true, missing: true })).toBe('Salinan tersimpan');
      expect(resolveStatus({ kept: false, missing: true })).toBe('Perlu dipilih ulang');
      expect(resolveStatus({ kept: false, missing: false })).toBe('Tersedia');
    });
  });

  describe('Eligible Pool Resolver & Empty Source Handling', () => {
    const mockPhotos: Photo[] = [
      {
        id: 'p1',
        original_filename: 'img1.jpg',
        display_name: 'Image 1',
        url: 'blob://1',
        mime_type: 'image/jpeg',
        orientation: 'landscape',
        liked: true,
        favorite: false,
        hidden: false,
        kept: false,
        missing: false,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'p2',
        original_filename: 'img2.jpg',
        display_name: 'Image 2',
        url: 'blob://2',
        mime_type: 'image/jpeg',
        orientation: 'portrait',
        liked: false,
        favorite: true,
        hidden: false,
        kept: true,
        missing: false,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'p3',
        original_filename: 'img3.jpg',
        display_name: 'Image 3',
        url: '',
        mime_type: 'image/jpeg',
        orientation: 'portrait',
        liked: true,
        favorite: true,
        hidden: false,
        kept: false,
        missing: true, // Needs re-selection
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'p4',
        original_filename: 'img4.jpg',
        display_name: 'Image 4',
        url: 'blob://4',
        mime_type: 'image/jpeg',
        orientation: 'square',
        liked: true,
        favorite: true,
        hidden: true, // Hidden photo
        kept: false,
        missing: false,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const getEligiblePool = (photos: Photo[], sourceKind: string) => {
      return photos.filter((p) => {
        if (p.hidden || p.missing) return false;
        if (sourceKind === 'favorites' && !p.favorite) return false;
        if (sourceKind === 'liked' && !p.liked) return false;
        return true;
      });
    };

    it('filters out missing and hidden photos from candidate playback pool', () => {
      const allEligible = getEligiblePool(mockPhotos, 'all_photos');
      // p3 is missing, p4 is hidden -> eligible: p1, p2
      expect(allEligible.map((p) => p.id)).toEqual(['p1', 'p2']);
    });

    it('filters favorites correctly excluding un-reselected or hidden items', () => {
      const favEligible = getEligiblePool(mockPhotos, 'favorites');
      // p2 is favorite and available; p3 is favorite but missing; p4 is favorite but hidden
      expect(favEligible.map((p) => p.id)).toEqual(['p2']);
    });

    it('filters liked correctly excluding un-reselected or hidden items', () => {
      const likedEligible = getEligiblePool(mockPhotos, 'liked');
      // p1 is liked and available; p3 is liked but missing; p4 is liked but hidden
      expect(likedEligible.map((p) => p.id)).toEqual(['p1']);
    });

    it('correctly detects an empty pool and identifies appropriate feedback', () => {
      const emptyFavorites = getEligiblePool([], 'favorites');
      expect(emptyFavorites.length).toBe(0);

      const sourceReasons: Record<string, string> = {
        empty_gallery: 'Galeri masih kosong. Tambahkan foto pertama Anda terlebih dahulu.',
        favorites: 'Belum ada foto yang ditandai Favorit (★). Tandai foto favorit di Galeri.',
        liked: 'Belum ada foto yang ditandai Disukai (♥). Beri tanda suka pada foto di Galeri.',
      };

      expect(sourceReasons.empty_gallery).toContain('Galeri masih kosong');
      expect(sourceReasons.favorites).toContain('Belum ada foto yang ditandai Favorit');
    });
  });

  describe('Pin & Slot Management Behavior', () => {
    it('preserves pinned slots during next advance', () => {
      const initialSlots = [
        { slotIndex: 0, photoId: 'photo-1', pinned: false },
        { slotIndex: 1, photoId: 'photo-2', pinned: true },
        { slotIndex: 2, photoId: 'photo-3', pinned: false },
      ];

      const newCandidates = ['photo-4', 'photo-5'];
      const updated = PinEngine.applyNextToSlots(initialSlots, newCandidates);

      expect(updated[0].photoId).toBe('photo-4');
      expect(updated[1].photoId).toBe('photo-2'); // Unchanged!
      expect(updated[1].pinned).toBe(true);
      expect(updated[2].photoId).toBe('photo-5');
    });

    it('keeps a slot pinned when its photo is manually replaced', () => {
      const slots = [
        { slotIndex: 0, photoId: 'photo-1', pinned: true },
        { slotIndex: 1, photoId: 'photo-2', pinned: false },
      ];

      const replaced = PinEngine.replaceSlotPhoto(slots, 0, 'photo-99');
      expect(replaced[0].photoId).toBe('photo-99');
      expect(replaced[0].pinned).toBe(true); // Pinned status preserved!
    });
  });

  describe('Photo Reconnection & Ambiguity Safeguards', () => {
    function mockImageDecoding() {
      // @ts-ignore
      globalThis.createImageBitmap = async () => ({ width: 800, height: 600, close: () => {} });
      // @ts-ignore
      globalThis.document = {
        createElement: () => ({
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: () => {} }),
          toBlob: (cb: (b: Blob) => void) => cb(new Blob(['t'], { type: 'image/jpeg' })),
        } as any),
      } as any;
    }

    it('reconnects a photo originally added with relative folder path when reselected as a single file', async () => {
      mockImageDecoding();
      // Suppose file was originally imported with webkitRelativePath
      const fileWithFolder = new File(['beach-bytes-12345'], 'beach.jpg', { type: 'image/jpeg', lastModified: 1700000 });
      Object.defineProperty(fileWithFolder, 'webkitRelativePath', { value: 'vacations/2026/beach.jpg' });

      const [firstImport] = await PhotoRepository.importFiles([fileWithFolder]);
      expect(firstImport.relative_path).toBe('vacations/2026/beach.jpg');
      await PhotoRepository.toggleFavorite(firstImport.id);

      // App reloads:
      PhotoRepository.releaseObjectUrls();
      const afterReload = await PhotoRepository.getById(firstImport.id);
      expect(afterReload?.missing).toBe(true);

      // User reselects as a standalone file (no webkitRelativePath)
      const standaloneFile = new File(['beach-bytes-12345'], 'beach.jpg', { type: 'image/jpeg', lastModified: 1700000 });
      const [reconnected] = await PhotoRepository.importFiles([standaloneFile]);

      expect(reconnected.id).toBe(firstImport.id);
      expect(reconnected.favorite).toBe(true); // preserved!
      expect(reconnected.missing).toBe(false);
      expect(reconnected.relative_path).toBe('vacations/2026/beach.jpg'); // original path preserved!
    });

    it('reconnectSinglePhoto rejects files with mismatched name or size', async () => {
      mockImageDecoding();
      const fileOriginal = new File(['hello-bytes'], 'hello.jpg', { type: 'image/jpeg', lastModified: 100 });
      const [imported] = await PhotoRepository.importFiles([fileOriginal]);

      // Mismatched name
      const wrongName = new File(['hello-bytes'], 'wrong.jpg', { type: 'image/jpeg', lastModified: 100 });
      await expect(PhotoRepository.reconnectSinglePhoto(imported.id, wrongName)).rejects.toThrow('tidak cocok');

      // Mismatched size
      const wrongSize = new File(['completely-different-size-content'], 'hello.jpg', { type: 'image/jpeg', lastModified: 100 });
      await expect(PhotoRepository.reconnectSinglePhoto(imported.id, wrongSize)).rejects.toThrow('berbeda dari ukuran asli');

      // Matching file
      const matching = new File(['hello-bytes'], 'hello.jpg', { type: 'image/jpeg', lastModified: 100 });
      const reconnected = await PhotoRepository.reconnectSinglePhoto(imported.id, matching);
      expect(reconnected.id).toBe(imported.id);
      expect(reconnected.missing).toBe(false);
    });
  });
});
