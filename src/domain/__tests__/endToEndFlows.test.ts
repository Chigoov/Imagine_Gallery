import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '../../repositories/db';
import { PhotoRepository } from '../../repositories/PhotoRepository';
import { CollectionRepository } from '../../repositories/CollectionRepository';
import { SessionRepository } from '../../repositories/SessionRepository';
import { CalendarRepository } from '../../repositories/CalendarRepository';
import { PinEngine } from '../player/PinEngine';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';
import { Photo } from '../../types/photo';

describe('End-to-End Primary User Flows Verification', () => {
  function mockImageDecoding() {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 1024, height: 768, close: vi.fn() })));
    vi.stubGlobal('document', {
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: vi.fn() }),
        toBlob: (callback: (blob: Blob) => void) => callback(new Blob(['mock-thumb-bytes'], { type: 'image/jpeg' })),
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

  it('verifies the full lifecycle: add photos, start session, pin/replace photo, reload app, keep photo, and backup/restore', async () => {
    mockImageDecoding();

    // 1. TAMBAH FOTO (Add Photos Flow)
    const fileA = new File(['image-bytes-A'], 'nature_01.jpg', { type: 'image/jpeg', lastModified: 1000 });
    const fileB = new File(['image-bytes-B'], 'city_02.png', { type: 'image/png', lastModified: 2000 });
    const fileC = new File(['image-bytes-C'], 'portrait_03.jpg', { type: 'image/jpeg', lastModified: 3000 });

    const importedPhotos = await PhotoRepository.importFiles([fileA, fileB, fileC]);
    expect(importedPhotos.length).toBe(3);

    // Initial state: All newly imported photos are available ("Tersedia")
    for (const p of importedPhotos) {
      expect(p.missing).toBe(false);
      expect(p.kept).toBe(false);
    }

    const [photoA, photoB, photoC] = importedPhotos;

    // Mark photoA as favorite
    await PhotoRepository.toggleFavorite(photoA.id);
    const updatedA = await PhotoRepository.getById(photoA.id);
    expect(updatedA?.favorite).toBe(true);

    // Keep photoB as a permanent copy ("Salinan tersimpan")
    const myCollection = await CollectionRepository.createCollection('Koleksi Liburan');
    const keptB = await PhotoRepository.keepPhoto(photoB.id, myCollection.id, 'original');
    expect(keptB.kept).toBe(true);
    expect(keptB.missing).toBe(false);

    // 2. MULAI SESI (Start Session Flow)
    const pool = await PhotoRepository.getAll();
    const activePool = pool.filter((p) => !p.hidden && !p.missing);
    expect(activePool.length).toBe(3);

    const shuffle = new ShuffleEngine(activePool.map((p) => p.id), 'no_repeat');
    const candidateIds = shuffle.getNextCandidates(2, new Set());
    expect(candidateIds.length).toBe(2);

    let slots = candidateIds.map((id, idx) => ({
      slotIndex: idx,
      photoId: id,
      pinned: false,
    }));

    // 3. SEMATKAN DAN GANTI FOTO (Pin & Replace Photo Flow)
    // Sematkan slot 0
    slots = PinEngine.togglePin(slots, 0);
    expect(slots[0].pinned).toBe(true);
    const pinnedPhotoId = slots[0].photoId;

    // Next advance: slot 0 yang disematkan TIDAK BOLEH berganti
    const nextCandidates = [photoC.id];
    slots = PinEngine.applyNextToSlots(slots, nextCandidates);
    expect(slots[0].photoId).toBe(pinnedPhotoId);
    expect(slots[0].pinned).toBe(true);

    // Ganti foto pada slot yang disematkan dengan kandidat yang belum tampil di layar
    const visiblePhotoIds = new Set(slots.map((s) => s.photoId));
    const availableReplacement = [photoA.id, photoB.id, photoC.id].find((id) => !visiblePhotoIds.has(id));
    expect(availableReplacement).toBeDefined();
    slots = PinEngine.replaceSlotPhoto(slots, 0, availableReplacement!);
    expect(slots[0].photoId).toBe(availableReplacement);
    expect(slots[0].pinned).toBe(true);

    // 4. BUKA ULANG APLIKASI (App Reload Simulation)
    // Saat aplikasi ditutup atau di-reload, in-memory sourceFiles dibersihkan
    PhotoRepository.releaseObjectUrls();

    // Hydrate kembali data dari database
    const reloadedPhotos = await PhotoRepository.getAll();
    const mapReloaded = new Map(reloadedPhotos.map((p) => [p.id, p]));

    // Photo A (belum disalin) -> missing: true ("Perlu dipilih ulang")
    const reloadedA = mapReloaded.get(photoA.id);
    expect(reloadedA?.kept).toBe(false);
    expect(reloadedA?.missing).toBe(true);

    // Photo B (sudah disimpan salinannya lewat keepPhoto) -> kept: true, missing: false ("Salinan tersimpan")
    const reloadedB = mapReloaded.get(photoB.id);
    expect(reloadedB?.kept).toBe(true);
    expect(reloadedB?.missing).toBe(false);

    // HUBUNGKAN KEMBALI (Reconnect Flow):
    // Pengguna memilih ulang fileA yang sama
    const [reconnectedA] = await PhotoRepository.importFiles([fileA]);
    expect(reconnectedA.id).toBe(photoA.id);
    expect(reconnectedA.favorite).toBe(true); // metadata terselamatkan!
    expect(reconnectedA.missing).toBe(false); // status kembali "Tersedia"!

    // 5. CADANGKAN DAN PULIHKAN (Backup & Restore Verification)
    const backupExport = {
      schema_version: 3,
      exported_at: new Date().toISOString(),
      photos: (await db.photos.toArray()).map((p) => ({ ...p, url: '', missing: true })),
      photo_files: await db.photo_files.toArray(),
      collections: await db.collections.toArray(),
      photo_collections: await db.photo_collections.toArray(),
      calendar: await db.calendar_entries.toArray(),
      sessions: await db.sessions.toArray(),
      compositions: await db.saved_compositions.toArray(),
      settings: { theme: 'dark', app_lock_enabled: false },
    };

    expect(backupExport.photos.length).toBe(3);
    expect(backupExport.collections.length).toBe(1);
    expect(backupExport.collections[0].name).toBe('Koleksi Liburan');

    // Simulate clean state and restore
    await db.photos.clear();
    await db.collections.clear();
    await db.photo_collections.clear();
    expect(await db.photos.count()).toBe(0);

    // Restore
    await db.photos.bulkPut(backupExport.photos);
    await db.collections.bulkPut(backupExport.collections);
    await db.photo_collections.bulkPut(backupExport.photo_collections);

    expect(await db.photos.count()).toBe(3);
    expect(await db.collections.count()).toBe(1);
    const restoredCol = await CollectionRepository.getById(myCollection.id);
    expect(restoredCol?.name).toBe('Koleksi Liburan');
  });
});
