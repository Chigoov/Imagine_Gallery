export interface CalendarEntry {
  id: string;
  session_id?: string;
  entry_date: string; // YYYY-MM-DD
  manual: boolean;
  count_value: number;
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  notes?: string;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  session_count: number;
  total_duration_seconds: number;
  entries: CalendarEntry[];
}

export interface StatsSummary {
  today_sessions: number;
  today_duration_seconds: number;
  week_sessions: number;
  week_duration_seconds: number;
  month_sessions: number;
  month_duration_seconds: number;
  active_days: number;
  average_session_seconds: number;
}
