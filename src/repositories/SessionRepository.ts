import { db } from './db';
import { SessionRecord, SavedComposition, ActiveSessionSnapshot } from '../types/session';
import { CalendarEntry } from '../types/calendar';
import { PhotoRepository } from './PhotoRepository';

export class SessionRepository {
  public static async saveActiveSnapshot(snapshot: ActiveSessionSnapshot): Promise<void> {
    await db.settings.put({ key: 'active_session_snapshot', value: snapshot });
  }

  public static async getActiveSnapshot(): Promise<ActiveSessionSnapshot | undefined> {
    const value = (await db.settings.get('active_session_snapshot'))?.value as Partial<ActiveSessionSnapshot> | undefined;
    if (!value) return undefined;
    const validSlots = (slots: unknown): boolean => Array.isArray(slots) && slots.length <= 5 && slots.every((slot) =>
      slot && Number.isInteger(slot.slotIndex) && typeof slot.photoId === 'string' && typeof slot.pinned === 'boolean');
    if (!value.config || !Array.isArray(value.slots) || !validSlots(value.slots) ||
        !Array.isArray(value.history) || value.history.length > 50 || !value.history.every(validSlots) ||
        !Array.isArray(value.forwardHistory) || value.forwardHistory.length > 50 || !value.forwardHistory.every(validSlots) ||
        !value.shuffle || !Array.isArray(value.shuffle.pool) || !Array.isArray(value.shuffle.queue) ||
        !Number.isFinite(value.startedAt) || !Number.isFinite(value.updatedAt) ||
        !Number.isFinite(value.countdown) || value.countdown! < 0 ||
        !['all_photos', 'collection', 'favorites', 'liked'].includes(value.config.sourceKind) ||
        !['no_repeat', 'pure_shuffle', 'favorites_only', 'unseen_only'].includes(value.config.shuffleMode)) {
      await this.clearActiveSnapshot();
      return undefined;
    }
    return value as ActiveSessionSnapshot;
  }

  public static async clearActiveSnapshot(): Promise<void> {
    await db.settings.delete('active_session_snapshot');
  }

  public static async saveSession(session: SessionRecord): Promise<string> {
    return await db.sessions.put(session);
  }

  public static async getAllSessions(): Promise<SessionRecord[]> {
    return await db.sessions.reverse().sortBy('started_at');
  }

  public static async getLatestSession(): Promise<SessionRecord | undefined> {
    return db.sessions.orderBy('started_at').reverse().first();
  }

  public static async finishSession(session: SessionRecord, entry: CalendarEntry): Promise<void> {
    if (session.status !== 'ended' || entry.manual || entry.session_id !== session.id || entry.duration_seconds !== session.duration_seconds) {
      throw new Error('Data sesi dan kalender tidak sesuai.');
    }
    await db.transaction('rw', db.sessions, db.calendar_entries, db.settings, async () => {
      await db.sessions.put(session);
      // Retrying a failed save must never create a second calendar count.
      const existing = await db.calendar_entries.where('session_id').equals(session.id).first();
      await db.calendar_entries.put({ ...entry, id: existing?.id || entry.id });
      await db.settings.delete('active_session_snapshot');
    });
  }

  public static async saveComposition(composition: SavedComposition): Promise<string> {
    if (!composition.name.trim() || composition.slots.length < 1 || composition.slots.length > 5 ||
        new Set(composition.slots.map((slot) => slot.photo_id)).size !== composition.slots.length) throw new Error('Susunan foto tidak valid.');
    return db.saved_compositions.put({ ...composition, name: composition.name.trim(),
      slots: composition.slots.map((slot) => ({ ...slot, photo_url: '' })) });
  }

  public static async getAllCompositions(): Promise<SavedComposition[]> {
    const compositions = await db.saved_compositions.orderBy('created_at').reverse().toArray();
    const ids = [...new Set(compositions.flatMap((composition) => composition.slots.map((slot) => slot.photo_id)))];
    const records = await db.photos.bulkGet(ids);
    const photos = await PhotoRepository.hydrate(records.filter((photo): photo is NonNullable<typeof photo> => !!photo && !photo.hidden));
    const byId = new Map(photos.map((photo) => [photo.id, photo]));
    return compositions.map((composition) => ({ ...composition, slots: composition.slots.map((slot) => ({ ...slot,
      photo_url: byId.get(slot.photo_id)?.thumbnail_url || byId.get(slot.photo_id)?.url || '' })) }));
  }

  public static async deleteComposition(id: string): Promise<void> {
    await db.saved_compositions.delete(id);
  }
}
