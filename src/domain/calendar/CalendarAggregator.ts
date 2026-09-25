import { CalendarEntry, DaySummary, StatsSummary } from '../../types/calendar';

export class CalendarAggregator {
  public static localDateKey(date: Date = new Date()): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  public static isValidDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
      && this.localDateKey(new Date(`${value}T12:00:00`)) === value;
  }

  private static count(entry: CalendarEntry): number {
    return Number.isFinite(entry.count_value) ? Math.max(0, Math.floor(entry.count_value)) : 0;
  }

  private static duration(entry: CalendarEntry): number {
    return Number.isFinite(entry.duration_seconds) ? Math.max(0, entry.duration_seconds) : 0;
  }

  public static getDaySummary(entries: CalendarEntry[], targetDate: string): DaySummary {
    const dayEntries = entries.filter((entry) => entry.entry_date === targetDate && this.isValidDate(entry.entry_date));
    return {
      date: targetDate,
      session_count: dayEntries.reduce((sum, entry) => sum + this.count(entry), 0),
      total_duration_seconds: dayEntries.reduce((sum, entry) => sum + this.duration(entry), 0),
      entries: dayEntries,
    };
  }

  public static computeStats(entries: CalendarEntry[], todayDate: string = this.localDateKey()): StatsSummary {
    if (!this.isValidDate(todayDate)) throw new Error('Invalid calendar date');
    const todaySummary = this.getDaySummary(entries, todayDate);
    const weekStart = new Date(`${todayDate}T12:00:00`);
    // Match the Monday-first calendar and its "This Week" / "This Month" labels.
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
    const weekStartKey = this.localDateKey(weekStart);
    const monthStartKey = `${todayDate.slice(0, 7)}-01`;

    let week_sessions = 0;
    let week_duration_seconds = 0;
    let month_sessions = 0;
    let month_duration_seconds = 0;
    let knownDuration = 0;
    let knownCount = 0;
    const activeDates = new Set<string>();

    for (const entry of entries) {
      if (!this.isValidDate(entry.entry_date) || entry.entry_date > todayDate) continue;
      const count = this.count(entry);
      const duration = this.duration(entry);
      if (count === 0) continue;
      activeDates.add(entry.entry_date);
      // Legacy manual duration=0 represents an omitted duration; automatic zero is known.
      if (duration > 0 || (!entry.manual && entry.duration_seconds === 0)) {
        knownDuration += duration;
        knownCount += count;
      }
      if (entry.entry_date >= weekStartKey) {
        week_sessions += count;
        week_duration_seconds += duration;
      }
      if (entry.entry_date >= monthStartKey) {
        month_sessions += count;
        month_duration_seconds += duration;
      }
    }

    return {
      today_sessions: todaySummary.session_count,
      today_duration_seconds: todaySummary.total_duration_seconds,
      week_sessions,
      week_duration_seconds,
      month_sessions,
      month_duration_seconds,
      active_days: activeDates.size,
      average_session_seconds: knownCount > 0 ? Math.round(knownDuration / knownCount) : 0,
    };
  }
}
