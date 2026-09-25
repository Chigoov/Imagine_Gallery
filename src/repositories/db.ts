import Dexie, { Table } from 'dexie';
import { Photo, PhotoSource } from '../types/photo';
import { Collection, PhotoCollectionRelation } from '../types/collection';
import { SessionRecord, SavedComposition } from '../types/session';
import { CalendarEntry } from '../types/calendar';
import { INITIAL_MOCK_PHOTOS, INITIAL_MOCK_COLLECTIONS, INITIAL_MOCK_CALENDAR_ENTRIES, INITIAL_SAVED_COMPOSITIONS } from '../data/mockData';

export interface DBSetting {
  key: string;
  value: unknown;
}

export interface PhotoFile {
  photo_id: string;
  thumbnail?: Blob;
  blob?: Blob; // Only explicit Keep stores the full original file.
  internal_name?: string;
}

/** Local metadata and app-owned copies. No source filesystem write API is used. */
export class PrivateBoardDB extends Dexie {
  public photos!: Table<Photo, string>;
  public photo_files!: Table<PhotoFile, string>;
  public photo_sources!: Table<PhotoSource, string>;
  public collections!: Table<Collection, string>;
  public photo_collections!: Table<PhotoCollectionRelation, [string, string]>;
  public sessions!: Table<SessionRecord, string>;
  public calendar_entries!: Table<CalendarEntry, string>;
  public saved_compositions!: Table<SavedComposition, string>;
  public settings!: Table<DBSetting, string>;

  constructor(name = 'PrivatePhotoBoardDB') {
    super(name);
    this.version(1).stores({
      photos: 'id, source_id, display_name, liked, favorite, hidden, kept, missing, view_count, created_at',
      photo_sources: 'id, source_type, display_name, available, created_at',
      collections: 'id, name, sort_order, created_at',
      photo_collections: '[photo_id+collection_id], photo_id, collection_id',
      sessions: 'id, status, mode, started_at, duration_seconds',
      calendar_entries: 'id, entry_date, manual, count_value, duration_seconds',
      saved_compositions: 'id, name, photo_count, created_at',
      settings: 'key',
    });
    this.version(2).stores({
      photo_files: 'photo_id',
      calendar_entries: 'id, entry_date, session_id, manual, count_value, duration_seconds',
    }).upgrade(async (transaction) => {
      // Legacy v1 object URLs expire on reload. Preserve metadata and offer file re-selection.
      await transaction.table('photos').toCollection().modify((photo) => {
        photo.url = '';
        delete photo.thumbnail_url;
        photo.missing = true;
      });
      for (const collection of await transaction.table('collections').toArray()) {
        const count = await transaction.table('photo_collections').where('collection_id').equals(collection.id).count();
        await transaction.table('collections').update(collection.id, { photo_count: count, cover_photo_url: undefined });
      }
      await transaction.table('saved_compositions').toCollection().modify((composition) => {
        for (const slot of composition.slots) slot.photo_url = '';
      });
    });
    this.version(3).stores({
      photo_files: 'photo_id',
      calendar_entries: 'id, entry_date, session_id, manual, count_value, duration_seconds',
    }).upgrade(async (transaction) => {
      // Remove only rows carrying the seeded IDs plus their original mock fingerprints.
      for (const demo of INITIAL_MOCK_PHOTOS) {
        const stored = await transaction.table('photos').get(demo.id);
        if (stored?.original_filename === demo.original_filename) {
          await transaction.table('photos').delete(demo.id);
          await transaction.table('photo_files').delete(demo.id);
          await transaction.table('photo_collections').where('photo_id').equals(demo.id).delete();
        }
      }
      for (const demo of INITIAL_MOCK_COLLECTIONS) {
        const stored = await transaction.table('collections').get(demo.id);
        if (stored?.name === demo.name) {
          await transaction.table('photo_collections').where('collection_id').equals(demo.id).delete();
          await transaction.table('collections').delete(demo.id);
        }
      }
      for (const demo of INITIAL_MOCK_CALENDAR_ENTRIES) {
        const stored = await transaction.table('calendar_entries').get(demo.id);
        if (stored?.session_id === demo.session_id && stored?.entry_date === demo.entry_date) {
          await transaction.table('calendar_entries').delete(demo.id);
        }
      }
      for (const demo of INITIAL_SAVED_COMPOSITIONS) {
        const stored = await transaction.table('saved_compositions').get(demo.id);
        if (stored?.name === demo.name && (stored as { slots?: { photo_id: string }[] })?.slots?.every((slot: { photo_id: string }, index: number) => slot.photo_id === demo.slots[index]?.photo_id)) {
          await transaction.table('saved_compositions').delete(demo.id);
        }
      }
      for (const sessionId of ['sess-101', 'sess-102', 'sess-098', 'sess-095']) {
        const demoEntry = INITIAL_MOCK_CALENDAR_ENTRIES.find((entry) => entry.session_id === sessionId);
        const stored = await transaction.table('sessions').get(sessionId);
        if (demoEntry && stored?.started_at === demoEntry.started_at && stored?.duration_seconds === demoEntry.duration_seconds) {
          await transaction.table('sessions').delete(sessionId);
        }
      }
      const source = await transaction.table('photo_sources').get('source-default');
      if (source?.display_name === 'Local Demo Archive' && source.source_type === 'app_storage') {
        await transaction.table('photo_sources').delete('source-default');
      }
    });
    // New installations start empty: no network photos or fabricated activity.
  }
}

export const db = new PrivateBoardDB();
