import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Dexie from 'dexie';
import { db, PrivateBoardDB } from '../db';
import { PhotoRepository } from '../PhotoRepository';
import { PhotoSourceRepository } from '../PhotoSourceRepository';
import { CollectionRepository } from '../CollectionRepository';
import { CalendarRepository } from '../CalendarRepository';
import { SessionRepository } from '../SessionRepository';
import { INITIAL_MOCK_PHOTOS, INITIAL_MOCK_COLLECTIONS, INITIAL_MOCK_CALENDAR_ENTRIES } from '../../data/mockData';

describe('Local-First Repositories (Dexie / IndexedDB)', () => {
  beforeEach(async () => {
    PhotoRepository.releaseObjectUrls();
    await db.photo_files.clear();
    await db.photos.clear();
    await db.photo_sources.clear();
    await db.collections.clear();
    await db.photo_collections.clear();
    await db.calendar_entries.clear();
    await db.sessions.clear();
    await db.saved_compositions.clear();
    await db.settings.clear();

    // Seed test photos
    await db.photos.bulkAdd([
      {
        id: 'p-1',
        original_filename: 'sample1.jpg',
        display_name: 'Sample 1',
        url: 'blob:sample-1',
        mime_type: 'image/jpeg',
        orientation: 'landscape',
        liked: true,
        favorite: false,
        hidden: false,
        kept: true,
        view_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'p-2',
        original_filename: 'sample2.jpg',
        display_name: 'Sample 2',
        url: 'blob:sample-2',
        mime_type: 'image/jpeg',
        orientation: 'portrait',
        liked: false,
        favorite: true,
        hidden: false,
        kept: false,
        view_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'p-3',
        original_filename: 'sample3.jpg',
        display_name: 'Sample 3',
        url: 'blob:sample-3',
        mime_type: 'image/jpeg',
        orientation: 'landscape',
        liked: false,
        favorite: false,
        hidden: true,
        kept: false,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  });

  afterEach(() => vi.unstubAllGlobals());

  describe('PhotoRepository', () => {
    it('filters photos accurately by liked, favorites, kept, and hidden', async () => {
      await db.photo_files.put({ photo_id: 'p-1', blob: new Blob(['kept image'], { type: 'image/jpeg' }) });
      const liked = await PhotoRepository.getByFilter('liked');
      expect(liked.length).toBe(1);
      expect(liked[0].id).toBe('p-1');

      const favorites = await PhotoRepository.getByFilter('favorites');
      expect(favorites.length).toBe(1);
      expect(favorites[0].id).toBe('p-2');

      const kept = await PhotoRepository.getByFilter('kept');
      expect(kept.length).toBe(1);
      expect(kept[0].id).toBe('p-1');

      const hidden = await PhotoRepository.getByFilter('hidden');
      expect(hidden.length).toBe(1);
      expect(hidden[0].id).toBe('p-3');
    });

    it('toggleLike updates database record and returns new status', async () => {
      const nextLiked = await PhotoRepository.toggleLike('p-2');
      expect(nextLiked).toBe(true);

      const p2 = await PhotoRepository.getById('p-2');
      expect(p2?.liked).toBe(true);
    });

    it('incrementViewCount increases view count and updates last_viewed_at', async () => {
      await PhotoRepository.incrementViewCount('p-1');
      const p1 = await PhotoRepository.getById('p-1');
      expect(p1?.view_count).toBe(6);
      expect(p1?.last_viewed_at).toBeDefined();
    });

    it('deletePhotoReference deletes only app metadata, not touching files', async () => {
      await PhotoRepository.deletePhotoReference('p-1');
      const p1 = await PhotoRepository.getById('p-1');
      expect(p1).toBeUndefined();
    });
  });

  describe('Regression: actual file persistence and atomic changes', () => {
    function mockImageDecoding() {
      vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 800, height: 600, close: vi.fn() })));
      vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0,
        getContext: () => ({ drawImage: vi.fn() }),
        toBlob: (callback: (blob: Blob) => void) => callback(new Blob(['thumbnail'], { type: 'image/jpeg' })),
      }) });
    }

    it('persists previews, relinks original references after reload, and only Keep persists full bytes', async () => {
      mockImageDecoding();
      const file = new File(['source-photo-bytes'], 'source.jpg', { type: 'image/jpeg', lastModified: 42 });
      const [imported] = await PhotoRepository.importFiles([file, file]);
      expect(await db.photos.count()).toBe(4);
      expect(imported.missing).toBe(false);
      expect((await db.photos.get(imported.id))?.url).toBe('');
      expect((await db.photo_files.get(imported.id))?.blob).toBeUndefined();
      expect((await db.photo_files.get(imported.id))?.thumbnail?.size).toBeGreaterThan(0);
      await PhotoRepository.toggleLike(imported.id);
      PhotoRepository.releaseObjectUrls();
      const disconnected = await PhotoRepository.getById(imported.id);
      expect(disconnected?.missing).toBe(true);
      expect(disconnected?.url).toBe('');
      expect(disconnected?.thumbnail_url).toMatch(/^blob:/);
      await expect(PhotoRepository.keepPhoto(imported.id)).rejects.toThrow('Pilih ulang');
      const [relinked] = await PhotoRepository.importFiles([file]);
      expect(relinked.id).toBe(imported.id);
      expect(relinked.liked).toBe(true);
      const collection = await CollectionRepository.createCollection('Private set');
      const kept = await PhotoRepository.keepPhoto(imported.id, collection.id, 'collection_num');
      expect(kept.display_name).toBe('Private set_001');
      expect(kept.internal_name).toMatch(/^[0-9a-f-]+\.jpg$/);
      expect(await (await db.photo_files.get(imported.id))?.blob?.text()).toBe('source-photo-bytes');
      expect(await file.text()).toBe('source-photo-bytes');
      await PhotoRepository.keepPhoto(imported.id, collection.id, 'collection_num');
      expect((await CollectionRepository.getById(collection.id))?.photo_count).toBe(1);
      expect((await db.photos.get(imported.id))?.internal_name).toBe(kept.internal_name);
      PhotoRepository.releaseObjectUrls();
      expect((await PhotoRepository.getById(imported.id))?.missing).toBe(false);
      await expect(PhotoRepository.deletePhotoReference(imported.id)).rejects.toThrow('dikonfirmasi');
    });

    it('stores public Drive links as remote local metadata and removes only the app reference', async () => {
      const link = 'https://drive.google.com/file/d/drivePhotoId123456/view?resourcekey=resource_1';
      const imported = await PhotoRepository.importPublicDriveLinks(`${link}\n${link}`);
      expect(imported).toHaveLength(1);
      expect(imported[0].remote_url).toContain('resourcekey=resource_1');
      expect(imported[0].url).toBe(imported[0].remote_url);
      expect(imported[0].missing).toBe(false);
      expect(await db.photo_sources.get('source-public-drive')).toMatchObject({ source_type: 'cloud_storage', available: true });
      await PhotoRepository.deletePhotoReference(imported[0].id);
      expect(await db.photos.get(imported[0].id)).toBeUndefined();
      expect(await db.photo_sources.get('source-public-drive')).toBeDefined();
    });

    it('rejects corrupt or non-image input without partial imports', async () => {
      mockImageDecoding();
      await expect(PhotoRepository.importFiles([new File(['x'], 'unsafe.svg', { type: 'image/svg+xml' })])).rejects.toThrow('berformat');
      vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValueOnce({ width: 10, height: 20, close: vi.fn() }).mockRejectedValueOnce(new Error('Corrupt image')));
      await expect(PhotoRepository.importFiles([
        new File(['x'], 'one.png', { type: 'image/png' }), new File(['broken'], 'two.png', { type: 'image/png' }),
      ])).rejects.toThrow('Corrupt');
      expect(await db.photos.count()).toBe(3);
      expect(await db.photo_files.count()).toBe(0);
    });

    it('repairs collection counts/covers when deleting a reference and rejects dangling memberships', async () => {
      const collection = await CollectionRepository.createCollection('Set');
      await CollectionRepository.addPhotoToCollection('p-1', collection.id);
      await CollectionRepository.addPhotoToCollection('p-2', collection.id);
      await PhotoRepository.deletePhotoReference('p-1');
      expect((await CollectionRepository.getById(collection.id))?.photo_count).toBe(1);
      expect((await CollectionRepository.getById(collection.id))?.cover_photo_id).toBe('p-2');
      await expect(CollectionRepository.addPhotoToCollection('missing', collection.id)).rejects.toThrow();
      await expect(CollectionRepository.addPhotoToCollection('p-2', 'missing')).rejects.toThrow();
      expect(await db.photo_collections.count()).toBe(1);
      await Promise.all([PhotoRepository.toggleLike('p-2'), PhotoRepository.toggleLike('p-2')]);
      expect((await PhotoRepository.getById('p-2'))?.liked).toBe(false);
    });

    it('rolls back Keep if membership fails and never treats a boolean as a saved copy', async () => {
      mockImageDecoding();
      const [photo] = await PhotoRepository.importFiles([new File(['bytes'], 'one.png', { type: 'image/png' })]);
      await expect(PhotoRepository.keepPhoto(photo.id, 'missing-collection')).rejects.toThrow('Koleksi');
      expect((await db.photo_files.get(photo.id))?.blob).toBeUndefined();
      expect((await PhotoRepository.getById('p-1'))?.kept).toBe(false);
      const kept = await PhotoRepository.keepPhoto(photo.id, '', 'custom', 'My copy');
      expect(kept.display_name).toBe('My copy');
      expect(photo.original_filename).toBe('one.png');
    });

    it('atomically saves one calendar entry per session and deletes associated private history', async () => {
      const session = { id: 'session-atomic', status: 'ended' as const, mode: 'manual' as const,
        shuffle_mode: 'no_repeat' as const, layout_mode: 'fixed' as const, photo_count: 1, interval_seconds: 7,
        started_at: '2026-09-23T01:00:00Z', ended_at: '2026-09-23T01:01:00Z', duration_seconds: 60,
        photos_viewed: 1, likes_count: 0, favorites_count: 0, kept_count: 0 };
      const entry = { id: 'calendar-atomic', session_id: session.id, entry_date: '2026-09-23', manual: false, count_value: 1, duration_seconds: 60 };
      await SessionRepository.finishSession(session, entry);
      await SessionRepository.finishSession(session, { ...entry, id: 'retry-new-id' });
      expect(await db.sessions.count()).toBe(1);
      expect(await db.calendar_entries.count()).toBe(1);
      await expect(SessionRepository.finishSession({ ...session, id: 'bad' }, entry)).rejects.toThrow('tidak sesuai');
      expect(await db.sessions.count()).toBe(1);
      await CalendarRepository.deleteEntry(entry.id);
      expect(await db.sessions.count()).toBe(0);
      expect(await db.calendar_entries.count()).toBe(0);
    });

    it('persists and clears an active session recovery snapshot', async () => {
      const snapshot = {
        config: { sourceKind: 'all_photos' as const, photoCount: 1, mode: 'manual' as const, intervalSeconds: 7,
          layoutMode: 'dynamic' as const, shuffleMode: 'no_repeat' as const, fitMode: 'cover' as const },
        slots: [{ slotIndex: 0, photoId: 'p-1', pinned: true }], history: [], forwardHistory: [],
        shuffle: { pool: ['p-1'], queue: [], mode: 'no_repeat' as const, lastExhaustedTail: [], recentConsumed: [] },
        startedAt: 100, countdown: 7, isPlaying: false, photosViewed: 1, likes: 0, favorites: 0, kept: 0, updatedAt: 200,
      };
      await SessionRepository.saveActiveSnapshot(snapshot);
      expect(await SessionRepository.getActiveSnapshot()).toEqual(snapshot);
      await SessionRepository.clearActiveSnapshot();
      expect(await SessionRepository.getActiveSnapshot()).toBeUndefined();
    });

    it('upgrades v1 without losing user records while removing only known demos and stale URLs', async () => {
      const name = `migration-${crypto.randomUUID()}`;
      const legacy = new Dexie(name);
      legacy.version(1).stores({ photos: 'id, source_id, display_name, liked, favorite, hidden, kept, missing, view_count, created_at',
        photo_sources: 'id, source_type, display_name, available, created_at', collections: 'id, name, sort_order, created_at',
        photo_collections: '[photo_id+collection_id], photo_id, collection_id', sessions: 'id, status, mode, started_at, duration_seconds',
        calendar_entries: 'id, entry_date, manual, count_value, duration_seconds', saved_compositions: 'id, name, photo_count, created_at', settings: 'key' });
      await legacy.open();
      await legacy.table('photos').bulkPut([INITIAL_MOCK_PHOTOS[0], { ...INITIAL_MOCK_PHOTOS[1], id: 'user-photo', url: 'blob:old', original_filename: 'mine.jpg' }]);
      await legacy.table('collections').bulkPut([INITIAL_MOCK_COLLECTIONS[0], { ...INITIAL_MOCK_COLLECTIONS[1], name: 'User renamed this' }]);
      await legacy.table('photo_collections').bulkPut([
        { photo_id: 'photo-1', collection_id: 'col-1', added_at: '2026-09-01' },
        { photo_id: 'user-photo', collection_id: 'col-2', added_at: '2026-09-01' },
      ]);
      await legacy.table('calendar_entries').bulkPut([INITIAL_MOCK_CALENDAR_ENTRIES[0], { ...INITIAL_MOCK_CALENDAR_ENTRIES[1], id: 'user-calendar' }]);
      legacy.close();
      const upgraded = new PrivateBoardDB(name);
      await upgraded.open();
      expect(await upgraded.photos.get('photo-1')).toBeUndefined();
      expect((await upgraded.photos.get('user-photo'))?.url).toBe('');
      expect((await upgraded.photos.get('user-photo'))?.missing).toBe(true);
      expect(await upgraded.collections.get('col-1')).toBeUndefined();
      expect((await upgraded.collections.get('col-2'))?.name).toBe('User renamed this');
      expect((await upgraded.collections.get('col-2'))?.photo_count).toBe(1);
      expect(await upgraded.calendar_entries.get('cal-1')).toBeUndefined();
      expect(await upgraded.calendar_entries.get('user-calendar')).toBeDefined();
      upgraded.close();
      await Dexie.delete(name);
    });
  });

  describe('CollectionRepository & Non-Destructive Membership', () => {
    it('creates collection and associates photos', async () => {
      const col = await CollectionRepository.createCollection('Nature Mix', 'Forests and oceans');
      expect(col.name).toBe('Nature Mix');

      await CollectionRepository.addPhotoToCollection('p-1', col.id);
      await CollectionRepository.addPhotoToCollection('p-2', col.id);

      const photosInCol = await CollectionRepository.getPhotosForCollection(col.id);
      expect(photosInCol.length).toBe(2);

      const updatedCol = await CollectionRepository.getById(col.id);
      expect(updatedCol?.photo_count).toBe(2);
    });

    it('renaming a collection updates name and preserves all member photos', async () => {
      const col = await CollectionRepository.createCollection('Initial Name');
      await CollectionRepository.addPhotoToCollection('p-1', col.id);

      await CollectionRepository.updateCollection(col.id, { name: 'Renamed Name' });
      const updated = await CollectionRepository.getById(col.id);
      expect(updated?.name).toBe('Renamed Name');

      const photosInCol = await CollectionRepository.getPhotosForCollection(col.id);
      expect(photosInCol.length).toBe(1);
      expect(photosInCol[0].id).toBe('p-1');
    });

    it('deleting a collection removes relations but NEVER deletes photos', async () => {
      const col = await CollectionRepository.createCollection('Temporary Collection');
      await CollectionRepository.addPhotoToCollection('p-1', col.id);

      // Delete the collection
      await CollectionRepository.deleteCollection(col.id);

      // Collection is gone
      const checkCol = await CollectionRepository.getById(col.id);
      expect(checkCol).toBeUndefined();

      // Photo p-1 is STILL safe in the photos table!
      const p1 = await PhotoRepository.getById('p-1');
      expect(p1).toBeDefined();
      expect(p1?.id).toBe('p-1');
    });
  });

  describe('CalendarRepository', () => {
    it('logs entries and aggregates statistics correctly', async () => {
      await CalendarRepository.addEntry({
        id: 'cal-test-1',
        entry_date: '2026-09-23',
        manual: false,
        count_value: 1,
        duration_seconds: 1200,
        notes: 'Test Session',
      });

      const dayEntries = await CalendarRepository.getByDate('2026-09-23');
      expect(dayEntries.length).toBe(1);
      expect(dayEntries[0].duration_seconds).toBe(1200);

      const stats = await CalendarRepository.getStats('2026-09-23');
      expect(stats.today_sessions).toBe(1);
      expect(stats.today_duration_seconds).toBe(1200);
    });
  });

  describe('SessionRepository', () => {
    it('persists and retrieves saved compositions with slots and pin states', async () => {
      const comp = {
        id: 'comp-101',
        name: 'Dual Harmony',
        photo_count: 2,
        layout_key: 'split_2',
        background_key: 'near_black',
        slots: [
          { slot_index: 0, photo_id: 'p-1', photo_url: 'blob:sample-1', display_name: 'Sample 1', pinned: true },
          { slot_index: 1, photo_id: 'p-2', photo_url: 'blob:sample-2', display_name: 'Sample 2', pinned: false },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await SessionRepository.saveComposition(comp);
      const list = await SessionRepository.getAllCompositions();

      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Dual Harmony');
      expect(list[0].slots[0].pinned).toBe(true);
    });
  });

  describe('PhotoSourceRepository', () => {
    it('stores and retrieves photo sources', async () => {
      const source = {
        id: 'src-1',
        source_type: 'local_folder' as const,
        display_name: 'Summer Trips 2026',
        root_path: 'C:/Photos/Summer',
        permission_state: 'granted' as const,
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await PhotoSourceRepository.addSource(source);
      const sources = await PhotoSourceRepository.getAll();

      expect(sources.length).toBe(1);
      expect(sources[0].display_name).toBe('Summer Trips 2026');
      expect(sources[0].source_type).toBe('local_folder');

      await PhotoSourceRepository.deleteSource('src-1');
      const remaining = await PhotoSourceRepository.getAll();
      expect(remaining.length).toBe(0);
    });
  });

  describe('Section 7: Full Persistence & App Reload Simulation', () => {
    it('restores all modified states upon application reload', async () => {
      // 1. Like photo p-2
      await PhotoRepository.toggleLike('p-2');

      // 2. Favorite photo p-1
      await PhotoRepository.toggleFavorite('p-1');

      // 3. Hide photo p-1
      await PhotoRepository.toggleHide('p-1');

      // 4. Create collection
      const newCol = await CollectionRepository.createCollection('Custom Collection', 'User created');
      await CollectionRepository.addPhotoToCollection('p-2', newCol.id);

      // 5. Pin active session into saved composition
      const savedComp = {
        id: 'comp-reload-test',
        name: 'Pinned Session Preset',
        photo_count: 2,
        layout_key: 'layout_2',
        background_key: 'near_black',
        slots: [
          { slot_index: 0, photo_id: 'p-2', photo_url: 'blob:p-2', display_name: 'Sample 2', pinned: true },
          { slot_index: 1, photo_id: 'p-3', photo_url: 'blob:p-3', display_name: 'Sample 3', pinned: false },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await SessionRepository.saveComposition(savedComp);

      // 6. Calendar entry
      await CalendarRepository.addEntry({
        id: 'cal-reload-entry',
        entry_date: '2026-09-23',
        manual: false,
        count_value: 1,
        duration_seconds: 1800,
        notes: 'Session Before Reload',
      });

      // --- SIMULATE RELOAD ---
      // Query repositories as App.tsx does on mount

      const reloadedPhotos = await PhotoRepository.getAll();
      const p1Reloaded = reloadedPhotos.find((p) => p.id === 'p-1');
      const p2Reloaded = reloadedPhotos.find((p) => p.id === 'p-2');

      // Verify Like restored
      expect(p2Reloaded?.liked).toBe(true);
      // Verify Favorite restored
      expect(p1Reloaded?.favorite).toBe(true);
      // Verify Hide restored
      expect(p1Reloaded?.hidden).toBe(true);

      // Verify Collection restored
      const reloadedCols = await CollectionRepository.getAll();
      const foundCol = reloadedCols.find((c) => c.id === newCol.id);
      expect(foundCol).toBeDefined();
      expect(foundCol?.name).toBe('Custom Collection');
      expect(foundCol?.photo_count).toBe(1);

      // Verify Saved Composition and Pinned active session slot restored
      const reloadedComps = await SessionRepository.getAllCompositions();
      const foundComp = reloadedComps.find((c) => c.id === 'comp-reload-test');
      expect(foundComp).toBeDefined();
      expect(foundComp?.slots[0].pinned).toBe(true);
      expect(foundComp?.slots[0].photo_id).toBe('p-2');

      // Verify Calendar Entry restored
      const reloadedCal = await CalendarRepository.getAll();
      const foundCal = reloadedCal.find((e) => e.id === 'cal-reload-entry');
      expect(foundCal).toBeDefined();
      expect(foundCal?.duration_seconds).toBe(1800);
    });
  });
});
