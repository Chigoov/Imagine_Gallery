import React from 'react';
import { Play, RotateCcw, FolderHeart, Calendar as CalendarIcon, Sparkles, Plus, Image as ImageIcon, Star, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Collection } from '../../types/collection';
import { StatsSummary } from '../../types/calendar';
import { NavTab } from '../../components/layout/DesktopSidebar';

interface HomeScreenProps {
  stats: StatsSummary;
  recentCollections: Collection[];
  isSessionActive: boolean;
  activeSessionDuration?: number;
  onStartSessionClick: () => void;
  onResumeSessionClick: () => void;
  onSelectCollection: (col: Collection) => void;
  onNavigate: (tab: NavTab) => void;
  onAddPhotosClick: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  recentCollections,
  isSessionActive,
  activeSessionDuration = 0,
  onStartSessionClick,
  onResumeSessionClick,
  onSelectCollection,
  onNavigate,
  onAddPhotosClick,
}) => {
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return mins > 0 ? `${mins} mnt` : `${seconds} dtk`;
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24 md:pb-12">
      {/* Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app-primary">
            Selamat datang kembali
          </h1>
          <p className="text-sm text-app-muted mt-1">
            Ruang visual pribadi • Galeri yang tersimpan di perangkat
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="w-4 h-4 text-accent" />}
          onClick={onAddPhotosClick}
          className="self-start sm:self-auto"
        >
          Tambah foto
        </Button>
      </div>

      {/* TODAY SUMMARY CARD */}
      <section className="bg-surface/80 border border-subtle rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-glass">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Ringkasan hari ini
            </h2>
          </div>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
          >
            Lihat kalender →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-elevated/60 border border-subtle">
            <p className="text-xs text-app-muted">Sesi</p>
            <p className="text-2xl md:text-3xl font-bold text-app-primary mt-1">
              {stats.today_sessions}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated/60 border border-subtle">
            <p className="text-xs text-app-muted">Waktu berfantasi</p>
            <p className="text-2xl md:text-3xl font-bold text-accent mt-1">
              {formatMinutes(stats.today_duration_seconds)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated/60 border border-subtle">
            <p className="text-xs text-app-muted">Total mingguan</p>
            <p className="text-2xl md:text-3xl font-bold text-app-primary mt-1">
              {stats.week_sessions} <span className="text-xs text-app-muted font-normal">sesi</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-elevated/60 border border-subtle">
            <p className="text-xs text-app-muted">Waktu minggu ini</p>
            <p className="text-2xl md:text-3xl font-bold text-app-secondary mt-1">
              {formatMinutes(stats.week_duration_seconds)}
            </p>
          </div>
        </div>

        {/* PRIMARY CTAs */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            icon={<Play className="w-5 h-5 fill-current" />}
            onClick={onStartSessionClick}
            className="flex-1"
          >
            Mulai sesi baru
          </Button>

          {isSessionActive && (
            <Button
              variant="secondary"
              size="lg"
              icon={<RotateCcw className="w-5 h-5 text-accent" />}
              onClick={onResumeSessionClick}
              className="flex-1 border-accent/40 bg-accent/10 hover:bg-accent/20"
            >
              Lanjutkan sesi ({formatMinutes(activeSessionDuration)})
            </Button>
          )}
        </div>
      </section>

      {/* RECENT COLLECTIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-app-muted">
              Koleksi terbaru
            </h2>
          </div>
          <button
            onClick={() => onNavigate('collections')}
            className="text-xs text-app-muted hover:text-app-primary transition-colors"
          >
            Lihat semua ({recentCollections.length})
          </button>
        </div>

        {recentCollections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-subtle p-5 text-sm text-app-muted">Belum ada koleksi. Buat koleksi dari menu Koleksi untuk mengelompokkan foto.</p>
        ) : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recentCollections.slice(0, 6).map((col) => (
            <div
              key={col.id}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelectCollection(col); } }}
              onClick={() => onSelectCollection(col)}
              className="group relative h-44 rounded-2xl overflow-hidden border border-subtle hover:border-strong cursor-pointer transition-all duration-200 shadow-glass"
            >
              {/* Background cover image */}
              <img
                src={col.cover_photo_url || undefined}
                referrerPolicy="no-referrer"
              hidden={!col.cover_photo_url}
              loading="lazy"
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-player via-player/40 to-transparent" />

              {/* Collection info */}
              <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end">
                <span className="text-[11px] text-accent font-semibold tracking-wider uppercase">
                  {col.photo_count} foto
                </span>
                <h3 className="text-base font-semibold text-app-primary group-hover:text-accent transition-colors line-clamp-1">
                  {col.name}
                </h3>
                {col.description && (
                  <p className="text-xs text-app-secondary line-clamp-1 mt-0.5 opacity-80">
                    {col.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>}
      </section>

      {/* QUICK SYSTEM SHORTCUTS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('favorites')}
          className="p-4 rounded-xl bg-surface border border-subtle hover:border-fav/40 hover:bg-elevated transition-all text-left group"
        >
          <Star className="w-5 h-5 text-fav" />
          <p className="text-sm font-semibold text-app-primary mt-1 group-hover:text-fav transition-colors">Favorit</p>
          <p className="text-[11px] text-app-muted">Akses cepat</p>
        </button>

        <button
          onClick={() => onNavigate('liked')}
          className="p-4 rounded-xl bg-surface border border-subtle hover:border-heart/40 hover:bg-elevated transition-all text-left group"
        >
          <Heart className="w-5 h-5 text-heart" />
          <p className="text-sm font-semibold text-app-primary mt-1 group-hover:text-heart transition-colors">Disukai</p>
          <p className="text-[11px] text-app-muted">Foto yang disukai</p>
        </button>

        <button
          onClick={() => onNavigate('library')}
          className="p-4 rounded-xl bg-surface border border-subtle hover:border-accent/40 hover:bg-elevated transition-all text-left group"
        >
          <ImageIcon className="w-5 h-5 text-accent" />
          <p className="text-sm font-semibold text-app-primary mt-1 group-hover:text-accent transition-colors">Semua foto</p>
          <p className="text-[11px] text-app-muted">Jelajahi galeri</p>
        </button>

        <button
          onClick={() => onNavigate('calendar')}
          className="p-4 rounded-xl bg-surface border border-subtle hover:border-emerald-500/40 hover:bg-elevated transition-all text-left group"
        >
          <CalendarIcon className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-semibold text-app-primary mt-1 group-hover:text-emerald-400 transition-colors">Kalender</p>
          <p className="text-[11px] text-app-muted">Riwayat dan statistik</p>
        </button>
      </section>
    </div>
  );
};
