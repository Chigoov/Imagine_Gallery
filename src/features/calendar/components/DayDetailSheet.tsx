import React from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { CalendarEntry } from '../../../types/calendar';

interface DayDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  entries: CalendarEntry[];
  onOpenManualAdd: () => void;
  onDeleteEntry: (id: string) => void;
}

export const DayDetailSheet: React.FC<DayDetailSheetProps> = ({
  isOpen,
  onClose,
  dateStr,
  entries,
  onOpenManualAdd,
  onDeleteEntry,
}) => {
  if (!isOpen) return null;

  const totalSessions = entries.reduce((acc, e) => acc + (e.count_value ?? 1), 0);
  const totalDurationSeconds = entries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
    return `${hours} jam ${mins} mnt`;
    }
    return `${mins} mnt`;
  };

  const formatTimeOnly = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={dateStr}>
      <div className="space-y-5">
        {/* Day Header Summary */}
        <div className="p-4 rounded-xl bg-elevated/70 border border-subtle flex items-center justify-between">
          <div>
            <p className="text-xs text-app-muted font-medium">Aktivitas tercatat</p>
            <p className="text-xl font-bold text-app-primary mt-0.5">
              {totalSessions} sesi
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-app-muted font-medium">Total durasi</p>
            <p className="text-xl font-bold text-accent mt-0.5">
              {formatTotalTime(totalDurationSeconds)}
            </p>
          </div>
        </div>

        {/* Sessions list */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto">
          {entries.length > 0 ? (
            entries.map((entry) => {
              const startFormatted = formatTimeOnly(entry.started_at);
              const endFormatted = formatTimeOnly(entry.ended_at);
              const timeRange = startFormatted && endFormatted ? `${startFormatted} – ${endFormatted}` : 'Sesi';
              const durationMins = Math.round((entry.duration_seconds || 0) / 60);

              return (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-surface border border-subtle flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-app-primary">{timeRange}</span>
                      {entry.manual && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/15 text-accent font-medium">
                          Manual
                        </span>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-app-secondary line-clamp-1">{entry.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-accent">
                      {durationMins > 0 ? `${durationMins} mnt` : '—'}
                    </span>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1 rounded-lg text-app-muted hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-app-muted">
              Belum ada sesi yang tercatat pada tanggal ini.
            </div>
          )}
        </div>

        {/* Add Manual Entry Button */}
        <div className="pt-2 flex justify-between items-center">
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-4 h-4 text-accent" />}
            onClick={() => {
              onClose();
              onOpenManualAdd();
            }}
          >
            Tambah catatan manual
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
