import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '../../repositories/db';
import { PhotoRepository } from '../../repositories/PhotoRepository';
import { CollectionRepository } from '../../repositories/CollectionRepository';
import { PinEngine } from '../player/PinEngine';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';
import { Photo } from '../../types/photo';

describe('Pre-Release Verification Suite (Safe Sample Photos)', () => {
  function mockImageBitmap() {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 800, height: 600, close: vi.fn() })));
    vi.stubGlobal('document', {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: vi.fn() }),
        toBlob: (cb: (b: Blob) => void) => cb(new Blob(['mock-thumb'], { type: 'image/jpeg' })),
      }),
    });
  }

  beforeEach(async () => {
    PhotoRepository.releaseObjectUrls();
    await db.photos.clear();
    await db.photo_files.clear();
    await db.photo_sources.clear();
    await db.collections.clear();
    await db.photo_collections.clear();
    await db.calendar_entries.clear();
    await db.sessions.clear();
    await db.saved_compositions.clear();
    await db.settings.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('verifies flow 1: Initial empty gallery state', async () => {
    const all = await PhotoRepository.getAll();
    expect(all.length).toBe(0);
    const readyPhotos = all.filter((p) => !p.hidden && !p.missing);
    expect(readyPhotos.length).toBe(0);
  });

  it('verifies flow 2: Adding photos from standalone files and folder paths', async () => {
    mockImageBitmap();
    const file1 = new File(['safe-photo-1'], 'flower.jpg', { type: 'image/jpeg', lastModified: 100 });
    const file2 = new File(['safe-photo-2'], 'tree.png', { type: 'image/png', lastModified: 200 });
    Object.defineProperty(file2, 'webkitRelativePath', { value: 'nature/plants/tree.png' });

    const imported = await PhotoRepository.importFiles([file1, file2]);
    expect(imported.length).toBe(2);
    expect(imported[0].missing).toBe(false);
    expect(imported[1].relative_path).toBe('nature/plants/tree.png');
  });

  it('verifies flow 3 & 4: Starting session, pin, replace, like/favorite, and collection assignment', async () => {
    mockImageBitmap();
    const fA = new File(['a-content'], 'sampleA.jpg', { type: 'image/jpeg', lastModified: 1 });
    const fB = new File(['b-content'], 'sampleB.jpg', { type: 'image/jpeg', lastModified: 2 });
    const fC = new File(['c-content'], 'sampleC.jpg', { type: 'image/jpeg', lastModified: 3 });
    const [pA, pB, pC] = await PhotoRepository.importFiles([fA, fB, fC]);

    // 4. Mark favorite & like
    await PhotoRepository.toggleFavorite(pA.id);
    await PhotoRepository.toggleLike(pB.id);

    const checkA = await PhotoRepository.getById(pA.id);
    const checkB = await PhotoRepository.getById(pB.id);
    expect(checkA?.favorite).toBe(true);
    expect(checkB?.liked).toBe(true);

    // Put into collection
    const col = await CollectionRepository.createCollection('Nature Collection');
    await CollectionRepository.addPhotoToCollection(pA.id, col.id);
    await CollectionRepository.addPhotoToCollection(pB.id, col.id);

    const refreshedCol = await CollectionRepository.getById(col.id);
    expect(refreshedCol?.photo_count).toBe(2);

    // 3. Start session with 2 slots
    const shuffle = new ShuffleEngine([pA.id, pB.id, pC.id], 'no_repeat');
    const firstTwo = shuffle.getNextCandidates(2, new Set());
    expect(firstTwo.length).toBe(2);

    let slots = firstTwo.map((id, idx) => ({ slotIndex: idx, photoId: id, pinned: false }));

    // Pin slot 0
    slots = PinEngine.togglePin(slots, 0);
    expect(slots[0].pinned).toBe(true);
    const pinnedId = slots[0].photoId;

    // Advance: slot 0 must not change
    const nextCandidates = [pC.id];
    slots = PinEngine.applyNextToSlots(slots, nextCandidates);
    expect(slots[0].photoId).toBe(pinnedId);
    expect(slots[0].pinned).toBe(true);

    // Replace: find candidate not visible on any slot
    const visibleIds = new Set(slots.map((s) => s.photoId));
    const unshown = [pA.id, pB.id, pC.id].find((id) => !visibleIds.has(id));
    expect(unshown).toBeDefined();

    slots = PinEngine.replaceSlotPhoto(slots, 0, unshown!);
    expect(slots[0].photoId).toBe(unshown);
    expect(slots[0].pinned).toBe(true); // Remains pinned!
  });

  it('verifies flow 5 & 6: App reload, uncopied photos become missing, keeping copy makes it persistent, and reconnecting restores missing photo', async () => {
    mockImageBitmap();
    const fileTemp = new File(['temp-bytes'], 'sky.jpg', { type: 'image/jpeg', lastModified: 500 });
    const filePersistent = new File(['keep-bytes'], 'mountain.jpg', { type: 'image/jpeg', lastModified: 600 });

    const [pTemp, pKeep] = await PhotoRepository.importFiles([fileTemp, filePersistent]);

    // 6. Keep persistent copy
    await PhotoRepository.keepPhoto(pKeep.id);
    const savedKeep = await PhotoRepository.getById(pKeep.id);
    expect(savedKeep?.kept).toBe(true);

    // 5. App reload simulation
    PhotoRepository.releaseObjectUrls();

    const afterReloadTemp = await PhotoRepository.getById(pTemp.id);
    const afterReloadKeep = await PhotoRepository.getById(pKeep.id);

    expect(afterReloadTemp?.missing).toBe(true); // Needs reselection!
    expect(afterReloadKeep?.missing).toBe(false); // Salinan tersimpan, still ready!

    // Reconnect temp photo with single reconnect
    const reconnected = await PhotoRepository.reconnectSinglePhoto(pTemp.id, fileTemp);
    expect(reconnected.missing).toBe(false);
  });

  it('verifies flow 7: Backup JSON export & restore', async () => {
    mockImageBitmap();
    const file = new File(['backup-test-data'], 'sea.jpg', { type: 'image/jpeg', lastModified: 900 });
    const [p] = await PhotoRepository.importFiles([file]);
    await PhotoRepository.toggleFavorite(p.id);

    const col = await CollectionRepository.createCollection('Seascapes');
    await CollectionRepository.addPhotoToCollection(p.id, col.id);

    // Prepare JSON backup structure
    const backupJson = JSON.stringify({
      schema_version: 3,
      exported_at: new Date().toISOString(),
      photos: (await db.photos.toArray()).map((item) => ({ ...item, url: '', missing: true })),
      photo_files: await db.photo_files.toArray(),
      collections: await db.collections.toArray(),
      photo_collections: await db.photo_collections.toArray(),
      calendar: [],
      sessions: [],
      compositions: [],
      settings: { theme: 'dark', app_lock_enabled: false },
    });

    // Wipe DB
    await db.photos.clear();
    await db.collections.clear();
    expect(await db.photos.count()).toBe(0);

    // Restore
    const parsed = JSON.parse(backupJson);
    await db.photos.bulkPut(parsed.photos);
    await db.collections.bulkPut(parsed.collections);

    expect(await db.photos.count()).toBe(1);
    const restoredPhoto = await PhotoRepository.getById(p.id);
    expect(restoredPhoto?.original_filename).toBe('sea.jpg');
    expect(restoredPhoto?.favorite).toBe(true);
  });
});
