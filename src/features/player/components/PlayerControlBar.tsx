import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  BookmarkPlus,
  Power,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';
import { SessionMode } from '../../../types/session';

interface PlayerControlBarProps {
  mode: SessionMode;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
  photoCount: number;
  onChangePhotoCount: (count: number) => void;
  countdown: number;
  totalSessionDuration: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onSaveComposition: () => void;
  onEndSession: () => void;
  isVisible: boolean;
}

export const PlayerControlBar: React.FC<PlayerControlBarProps> = ({
  mode,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  canGoPrevious,
  photoCount,
  onChangePhotoCount,
  countdown,
  totalSessionDuration,
  isFullscreen,
  onToggleFullscreen,
  onSaveComposition,
  onEndSession,
  isVisible,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={clsx(
        'player-controls fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 transition-all duration-control select-none pointer-events-none',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="pointer-events-auto soft-glass shadow-glass rounded-2xl p-2 sm:p-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 border border-white/10">
        {/* Left section: Previous / Play / Next */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous */}
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="p-2 sm:p-2.5 rounded-xl text-app-secondary hover:text-app-primary hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Tampilan sebelumnya (panah kiri)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            disabled={mode === 'manual'}
            className="p-2.5 sm:p-3 rounded-xl bg-accent text-player hover:bg-accent-hover active:scale-95 shadow-md font-bold transition-all disabled:opacity-40"
            title={mode === 'manual' ? 'Mode manual: gunakan tombol berikutnya' : isPlaying ? 'Jeda tayangan (spasi)' : 'Putar tayangan (spasi)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="p-2 sm:p-2.5 rounded-xl text-app-secondary hover:text-app-primary hover:bg-white/10 active:scale-95 transition-all"
            title="Tampilan berikutnya (panah kanan)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pilih jumlah foto */}
        <div className="hidden sm:flex items-center gap-1 bg-elevated/70 p-1 rounded-xl border border-subtle">
          {[1, 2, 3, 4, 5].map((cnt) => (
            <button
              key={cnt}
              onClick={() => onChangePhotoCount(cnt)}
              aria-pressed={photoCount === cnt}
              className={clsx(
                'w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-140 flex items-center justify-center',
                photoCount === cnt
                  ? 'bg-surface text-accent shadow-sm border border-white/10'
                  : 'text-app-muted hover:text-app-secondary'
              )}
              title={`Tata letak ${cnt} foto`}
            >
              {cnt}
            </button>
          ))}
        </div>

        {/* Right section: Countdown / Save / Fullscreen / End */}
        <div className="flex items-center justify-center flex-1 gap-1.5 sm:gap-2">
          {/* Interval Countdown Timer */}
          {mode === 'auto' && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-elevated/60 border border-subtle text-xs font-mono text-accent">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(countdown)}</span>
            </div>
          )}

          {/* Save Composition */}
          <button
            onClick={onSaveComposition}
            className="p-2 sm:p-2.5 rounded-xl text-app-secondary hover:text-app-primary hover:bg-white/10 transition-colors"
            title="Simpan susunan"
          >
            <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="inline-flex p-2 sm:p-2.5 rounded-xl text-app-secondary hover:text-app-primary hover:bg-white/10 transition-colors"
            title={isFullscreen ? 'Keluar dari layar penuh (F)' : 'Layar penuh (F)'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* End Session */}
          <button
            onClick={onEndSession}
            className="p-2 sm:p-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors ml-1"
            title="Akhiri sesi dan simpan ke kalender"
          >
            <Power className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
