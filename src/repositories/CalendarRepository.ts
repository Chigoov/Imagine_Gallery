import { db } from './db';
import { CalendarEntry, StatsSummary } from '../types/calendar';
import { CalendarAggregator } from '../domain/calendar/CalendarAggregator';

export class CalendarRepository {
  public static async getAll(): Promise<CalendarEntry[]> {
    return await db.calendar_entries.reverse().sortBy('entry_date');
  }

  public static async getByDate(dateStr: string): Promise<CalendarEntry[]> {
    return await db.calendar_entries.where('entry_date').equals(dateStr).toArray();
  }

  public static async addEntry(entry: CalendarEntry): Promise<string> {
    if (!CalendarAggregator.isValidDate(entry.entry_date) || !Number.isSafeInteger(entry.count_value) || entry.count_value < 1 ||
        (entry.duration_seconds !== null && (!Number.isFinite(entry.duration_seconds) || entry.duration_seconds < 0))) {
      throw new Error('Tanggal, jumlah, atau durasi kalender tidak valid.');
    }
    return await db.calendar_entries.add(entry);
  }

  public static async deleteEntry(id: string): Promise<void> {
    await db.transaction('rw', db.calendar_entries, db.sessions, async () => {
      const entry = await db.calendar_entries.get(id);
      await db.calendar_entries.delete(id);
      if (entry?.session_id) await db.sessions.delete(entry.session_id);
    });
  }

  public static async getStats(todayDate?: string): Promise<StatsSummary> {
    const entries = await db.calendar_entries.toArray();
    return CalendarAggregator.computeStats(entries, todayDate);
  }
}
