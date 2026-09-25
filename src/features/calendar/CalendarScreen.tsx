import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, CheckCircle2, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import { CalendarEntry, StatsSummary } from '../../types/calendar';
import { Button } from '../../components/ui/Button';
import { CalendarAggregator } from '../../domain/calendar/CalendarAggregator';
import { DayDetailSheet } from './components/DayDetailSheet';
import { ManualEntryModal } from './components/ManualEntryModal';

interface CalendarScreenProps {
  entries: CalendarEntry[];
  stats: StatsSummary;
  onAddManualEntry: (entry: {
    entry_date: string;
    count_value: number;
    duration_seconds: number;
    notes?: string;
  }) => void;
  onDeleteEntry: (id: string) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  entries,
  stats,
  onAddManualEntry,
  onDeleteEntry,
}) => {
  const today = new Date();
  const todayStr = CalendarAggregator.localDateKey(today);
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Map entries by date for fast O(1) lookup
  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.entry_date) || [];
      list.push(entry);
      map.set(entry.entry_date, list);
    }
    return map;
  }, [entries]);

  // Generate month days matrix
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  // Shift to Monday = 0
  const startOffset = (firstDayOfWeek + 6) % 7;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
    setSelectedDateStr(fullDate);
    setIsDayDetailOpen(true);
  };

  const selectedDayEntries = entriesByDate.get(selectedDateStr) || [];

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return mins > 0 ? `${mins} mnt` : `${seconds} dtk`;
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app-primary">
            Kalender sesi
          </h1>
          <p className="text-sm text-app-muted mt-1">
            Catatan pribadi • Jumlah dan durasi sesi
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="w-4 h-4 text-accent" />}
          onClick={() => {
            setSelectedDateStr(todayStr);
            setIsManualModalOpen(true);
          }}
          className="self-start sm:self-auto"
        >
          Tambah catatan manual
        </Button>
      </div>

      {/* MONTH GRID & STATS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Calendar Box */}
        <div className="lg:col-span-2 bg-surface/90 border border-subtle rounded-2xl p-5 md:p-6 shadow-glass backdrop-blur-md space-y-4">
          {/* Month Header and Navigator */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-app-primary tracking-wide">
              {monthNames[currentMonth]} {currentYear}
            </h2>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-app-secondary hover:text-app-primary hover:bg-elevated transition-colors"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-app-secondary hover:text-app-primary hover:bg-elevated transition-colors"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nama hari */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-app-muted uppercase tracking-wider py-1 border-b border-subtle">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
            <span>Min</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots before first day of month */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-16 rounded-xl bg-transparent" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const monthStr = String(currentMonth + 1).padStart(2, '0');
              const dayStr = String(day).padStart(2, '0');
              const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
              const dayEntries = entriesByDate.get(fullDate) || [];
              const sessionCount = dayEntries.reduce((acc, e) => acc + (e.count_value ?? 1), 0);
              const totalDuration = dayEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
              const isToday = fullDate === todayStr;
              const isSelected = fullDate === selectedDateStr;

              return (
                <button
                  key={day}
                  type="button"
                  aria-label={`${fullDate}: ${sessionCount} sesi`}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => handleDayClick(day)}
                  className={clsx(
                    'h-12 sm:h-16 rounded-xl border p-1 sm:p-2 flex flex-col justify-between text-left transition-all duration-140 relative group',
                    isSelected
                      ? 'border-accent bg-accent/15 shadow-sm'
                      : dayEntries.length > 0
                      ? 'border-subtle bg-elevated/70 hover:border-strong hover:bg-elevated'
                      : 'border-transparent bg-transparent hover:bg-white/5 text-app-muted',
                    isToday && 'ring-1 ring-accent/60'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={clsx(
                        'text-xs font-medium',
                        isToday
                          ? 'text-accent font-bold'
                          : isSelected
                          ? 'text-app-primary font-semibold'
                          : 'text-app-secondary'
                      )}
                    >
                      {day}
                    </span>

                    {/* Today indicator label on desktop */}
                    {isToday && (
                      <span className="hidden sm:inline-block text-[9px] px-1 rounded bg-accent/20 text-accent font-mono">
                        Hari ini
                      </span>
                    )}
                  </div>

                  {/* Session marker */}
                  {sessionCount > 0 && (
                    <div className="flex items-center justify-between w-full mt-auto">
                      <span className="px-1.5 py-0.5 rounded-full bg-accent/25 text-accent text-[10px] sm:text-xs font-bold font-mono">
                        ×{sessionCount}
                      </span>
                      {totalDuration > 0 && (
                        <span className="hidden sm:inline-block text-[10px] text-app-muted font-mono">
                          {formatMinutes(totalDuration)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-4">
          {/* Today Spotlight */}
          <div className="p-5 rounded-2xl bg-surface/90 border border-subtle shadow-glass space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Aktivitas hari ini
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-app-primary">
                  {stats.today_sessions} sesi
                </p>
                <p className="text-xs text-app-muted mt-0.5">Tercatat hari ini</p>
              </div>
              <p className="text-2xl font-bold text-accent font-mono">
                {formatMinutes(stats.today_duration_seconds)}
              </p>
            </div>
          </div>

          {/* Aggregate Stat Cards */}
          <div className="p-5 rounded-2xl bg-surface/90 border border-subtle shadow-glass space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Ringkasan aktivitas
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-subtle text-xs">
                <span className="text-app-secondary">Minggu ini</span>
                <span className="font-semibold text-app-primary font-mono">
                  {stats.week_sessions} sesi • {formatMinutes(stats.week_duration_seconds)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-subtle text-xs">
                <span className="text-app-secondary">Bulan ini</span>
                <span className="font-semibold text-app-primary font-mono">
                  {stats.month_sessions} sesi • {formatMinutes(stats.month_duration_seconds)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-subtle text-xs">
                <span className="text-app-secondary">Hari aktif</span>
                <span className="font-semibold text-app-primary font-mono">
                  {stats.active_days} hari
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-app-secondary">Rata-rata sesi</span>
                <span className="font-semibold text-accent font-mono">
                  {formatMinutes(stats.average_session_seconds)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-app-muted/70 italic pt-1">
              Tanpa poin atau tekanan untuk menjaga rentetan. Ini hanya riwayat pribadi Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Day Detail Bottom Sheet */}
      <DayDetailSheet
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        dateStr={selectedDateStr}
        entries={selectedDayEntries}
        onOpenManualAdd={() => setIsManualModalOpen(true)}
        onDeleteEntry={onDeleteEntry}
      />

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        initialDate={selectedDateStr}
        onSaveEntry={onAddManualEntry}
      />
    </div>
  );
};
