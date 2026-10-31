import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Eye,
  Clock,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings2,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Collection } from '../../types/collection';
import { SessionConfig, SessionMode, ShuffleMode, ImageFitMode } from '../../types/session';
import { AppSettings } from '../../types/settings';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  readyPhotosCount: number;
  totalPhotosCount: number;
  readyFavoritesCount: number;
  totalFavoritesCount: number;
  readyLikedCount: number;
  totalLikedCount: number;
  defaultSettings: AppSettings;
  initialSourceId?: string;
  onStartSession: (config: SessionConfig) => void;
  onNavigateToLibrary?: () => void;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  isOpen,
  onClose,
  collections,
  readyPhotosCount,
  totalPhotosCount,
  readyFavoritesCount,
  totalFavoritesCount,
  readyLikedCount,
  totalLikedCount,
  defaultSettings,
  initialSourceId,
  onStartSession,
  onNavigateToLibrary,
}) => {
  const [sourceKind, setSourceKind] = useState<'all_photos' | 'collection' | 'favorites' | 'liked'>(
    initialSourceId ? 'collection' : 'all_photos'
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    initialSourceId || (collections[0]?.id ?? '')
  );
  const [photoCount, setPhotoCount] = useState<number>(4);
  const [mode, setMode] = useState<SessionMode>('auto');
  const [intervalSeconds, setIntervalSeconds] = useState<number>(7);
  const [shuffleMode, setShuffleMode] = useState<ShuffleMode>('no_repeat');
  const [fitMode, setFitMode] = useState<ImageFitMode>('cover');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setPhotoCount(defaultSettings.default_photo_count);
    setIntervalSeconds(defaultSettings.default_interval);
    setShuffleMode(defaultSettings.default_shuffle_mode);
    setFitMode(defaultSettings.default_fit_mode);
  }, [isOpen, defaultSettings]);

  // Accurate active/ready vs total metadata count
  const { currentReadyCount, currentTotalCount } = useMemo(() => {
    if (sourceKind === 'all_photos') {
      return { currentReadyCount: readyPhotosCount, currentTotalCount: totalPhotosCount };
    }
    if (sourceKind === 'favorites') {
      return { currentReadyCount: readyFavoritesCount, currentTotalCount: totalFavoritesCount };
    }
    if (sourceKind === 'liked') {
      return { currentReadyCount: readyLikedCount, currentTotalCount: totalLikedCount };
    }
    if (sourceKind === 'collection') {
      const col = collections.find((c) => c.id === selectedCollectionId);
      const ready = col?.ready_count ?? 0;
      const total = col?.photo_count ?? 0;
      return { currentReadyCount: ready, currentTotalCount: total };
    }
    return { currentReadyCount: 0, currentTotalCount: 0 };
  }, [
    sourceKind,
    readyPhotosCount,
    totalPhotosCount,
    readyFavoritesCount,
    totalFavoritesCount,
    readyLikedCount,
    totalLikedCount,
    selectedCollectionId,
    collections,
  ]);

  // Adjust photoCount if source has fewer ready photos than current selection
  useEffect(() => {
    if (currentReadyCount > 0 && photoCount > currentReadyCount) {
      setPhotoCount(Math.min(5, Math.max(1, currentReadyCount)));
    }
  }, [currentReadyCount, photoCount]);

  if (!isOpen) return null;

  const handleStart = () => {
    if (currentReadyCount === 0) return;

    let sourceName = 'Semua foto';
    if (sourceKind === 'collection') {
      const col = collections.find((c) => c.id === selectedCollectionId);
      sourceName = col ? col.name : 'Koleksi khusus';
    } else if (sourceKind === 'favorites') {
      sourceName = 'Hanya favorit';
    } else if (sourceKind === 'liked') {
      sourceName = 'Foto yang disukai';
    }

    onStartSession({
      sourceKind,
      sourceId: sourceKind === 'collection' ? selectedCollectionId : undefined,
      sourceName,
      photoCount: Math.min(photoCount, currentReadyCount),
      mode,
      intervalSeconds,
      layoutMode: 'dynamic',
      shuffleMode,
      fitMode,
    });
  };

  const getShuffleLabel = (mode: ShuffleMode) => {
    switch (mode) {
      case 'no_repeat': return 'Tanpa pengulangan';
      case 'pure_shuffle': return 'Acak sepenuhnya';
      case 'favorites_only': return 'Favorit saja';
      case 'unseen_only': return 'Foto belum dilihat';
      default: return 'Acak';
    }
  };

  const getFitLabel = (fit: ImageFitMode) => {
    return fit === 'cover' ? 'Penuhi bingkai' : 'Muat seluruh foto';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-player/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-2xl bg-surface border border-subtle rounded-2xl shadow-glass overflow-hidden z-10 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent/20 text-accent">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <h2 className="text-lg font-bold text-app-primary">Atur sesi foto</h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-app-muted hover:text-app-primary transition-colors p-1"
          >
            Batal
          </button>
        </div>

        {/* Scrollable Setup Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto min-h-0 flex-1">
          {/* 1. Source Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                Pilih sumber foto
              </label>
              <span className="text-xs text-app-secondary">
                {currentReadyCount > 0 ? (
                  <span className="text-accent font-semibold">{currentReadyCount} siap diputar</span>
                ) : (
                  <span className="text-amber-400 font-medium">0 foto siap</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSourceKind('all_photos')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'all_photos'
                    ? 'border-accent bg-accent/15 text-app-primary font-semibold shadow-sm'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium">Semua foto</p>
                <p className="text-[11px] text-app-muted mt-0.5">
                  {readyPhotosCount} siap
                  {totalPhotosCount > readyPhotosCount && ` • ${totalPhotosCount - readyPhotosCount} perlu pilih`}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSourceKind('favorites')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'favorites'
                    ? 'border-fav bg-fav/15 text-app-primary font-semibold shadow-sm'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium flex items-center gap-1">
                  <span className="text-fav">★</span> Favorit
                </p>
                <p className="text-[11px] text-app-muted mt-0.5">
                  {readyFavoritesCount} siap
                  {totalFavoritesCount > readyFavoritesCount && ` • ${totalFavoritesCount - readyFavoritesCount} perlu pilih`}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSourceKind('liked')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'liked'
                    ? 'border-heart bg-heart/15 text-app-primary font-semibold shadow-sm'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium flex items-center gap-1">
                  <span className="text-heart">♥</span> Disukai
                </p>
                <p className="text-[11px] text-app-muted mt-0.5">
                  {readyLikedCount} siap
                  {totalLikedCount > readyLikedCount && ` • ${totalLikedCount - readyLikedCount} perlu pilih`}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSourceKind('collection')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'collection'
                    ? 'border-accent bg-accent/15 text-app-primary font-semibold shadow-sm'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium">Koleksi</p>
                <p className="text-[11px] text-app-muted mt-0.5">
                  {collections.length} kelompok
                </p>
              </button>
            </div>

            {sourceKind === 'collection' && collections.length > 0 && (
              <div className="pt-2 animate-fade-in">
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full bg-elevated border border-subtle rounded-xl px-4 py-2.5 text-xs sm:text-sm text-app-primary focus:outline-none focus:border-accent"
                >
                  {collections.map((col) => {
                    const ready = col.ready_count ?? 0;
                    return (
                      <option key={col.id} value={col.id}>
                        {col.name} ({ready} siap diputar • {col.photo_count} total)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* EMPTY OR UNREADY SOURCE ACTION CARD */}
          {currentReadyCount === 0 ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-app-primary">
                    {currentTotalCount > 0
                      ? 'Foto perlu dipilih ulang dari perangkat'
                      : 'Belum ada foto pada sumber ini'}
                  </h3>
                  <p className="text-xs text-app-secondary leading-relaxed">
                    {currentTotalCount > 0
                      ? `Terdapat ${currentTotalCount} foto dalam sumber ini, namun berkas aslinya perlu dipilih ulang dari perangkat sebelum dapat diputar.`
                      : sourceKind === 'all_photos'
                      ? 'Galeri Anda masih kosong. Tambahkan foto dari perangkat Anda terlebih dahulu untuk memulai sesi pemutar.'
                      : sourceKind === 'favorites'
                      ? 'Belum ada foto yang ditandai sebagai Favorit. Beri tanda bintang (★) pada foto di Galeri terlebih dahulu.'
                      : sourceKind === 'liked'
                      ? 'Belum ada foto yang ditandai Disukai. Beri tanda hati (♥) pada foto di Galeri terlebih dahulu.'
                      : 'Koleksi ini belum memiliki foto. Masukkan foto ke dalam koleksi ini dari Galeri.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                {sourceKind !== 'all_photos' && readyPhotosCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSourceKind('all_photos')}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-accent text-player hover:bg-accent-hover transition-colors shadow-sm"
                  >
                    Gunakan semua foto siap putar ({readyPhotosCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToLibrary?.();
                  }}
                  className="text-xs font-medium px-3.5 py-2 rounded-xl bg-surface border border-subtle text-app-primary hover:bg-elevated transition-colors flex items-center gap-1.5"
                >
                  {currentTotalCount > 0 ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-accent" />
                      <span>Pilih ulang berkas di Galeri →</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-accent" />
                      <span>Tambah foto di Galeri →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 2. Photo Count (1 to 5) with Layout Mini-Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                    Jumlah foto di layar
                  </label>
                  <span className="text-xs text-accent font-semibold">{photoCount} foto sekaligus</span>
                </div>

                <SegmentedControl
                  options={[
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                  ]}
                  value={photoCount}
                  onChange={(val) => setPhotoCount(val as number)}
                  className="w-full"
                />

                {/* Visual Miniature Layout Schema */}
                <div className="mt-2 p-2.5 bg-player/60 border border-subtle rounded-xl flex items-center justify-center">
                  <div className="w-48 h-20 bg-surface/50 border border-white/5 rounded-lg p-1.5 flex gap-1 items-stretch">
                    {photoCount === 1 && (
                      <div className="w-full bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-mono font-medium">
                        Satu foto penuh
                      </div>
                    )}
                    {photoCount === 2 && (
                      <>
                        <div className="w-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-semibold">1</div>
                        <div className="w-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-semibold">2</div>
                      </>
                    )}
                    {photoCount === 3 && (
                      <>
                        <div className="w-3/5 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-semibold">Utama 1</div>
                        <div className="w-2/5 flex flex-col gap-1">
                          <div className="h-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-semibold">2</div>
                          <div className="h-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-semibold">3</div>
                        </div>
                      </>
                    )}
                    {photoCount === 4 && (
                      <div className="w-full grid grid-cols-2 grid-rows-2 gap-1">
                        <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent font-semibold">1</div>
                        <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent font-semibold">2</div>
                        <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent font-semibold">3</div>
                        <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent font-semibold">4</div>
                      </div>
                    )}
                    {photoCount === 5 && (
                      <div className="w-full flex gap-1">
                        <div className="w-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-semibold">Utama</div>
                        <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-1">
                          <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent font-semibold">2</div>
                          <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent font-semibold">3</div>
                          <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent font-semibold">4</div>
                          <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent font-semibold">5</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

          {/* 3. Mode & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                Mode pemutaran
              </label>
              <SegmentedControl
                options={[
                  { value: 'auto', label: 'Otomatis' },
                  { value: 'manual', label: 'Ganti manual' },
                ]}
                value={mode}
                onChange={(val) => setMode(val as SessionMode)}
                className="w-full"
              />
            </div>

            {mode === 'auto' ? (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                    Jeda otomatis
                  </label>
                  <span className="text-xs text-accent font-semibold">{intervalSeconds} detik</span>
                </div>
                <SegmentedControl
                  options={[
                    { value: 5, label: '5s' },
                    { value: 7, label: '7s' },
                    { value: 10, label: '10s' },
                    { value: 15, label: '15s' },
                    { value: 30, label: '30s' },
                  ]}
                  value={intervalSeconds}
                  onChange={(val) => setIntervalSeconds(val as number)}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="space-y-2 flex flex-col justify-end">
                <p className="text-xs text-app-secondary p-3 rounded-xl bg-elevated/40 border border-subtle leading-relaxed">
                  Foto berganti saat tombol Berikutnya ditekan, panah keyboard, atau usap layar.
                </p>
              </div>
            )}
          </div>

          {/* 4. Advanced Settings (Collapsible Accordion for clarity) */}
          <div className="border border-subtle rounded-xl overflow-hidden bg-elevated/30">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-elevated/60 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-app-primary">Pengaturan lanjutan</span>
                <span className="text-[11px] text-app-muted hidden sm:inline">
                  • {getShuffleLabel(shuffleMode)} • {getFitLabel(fitMode)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-app-muted">
                <span>{isAdvancedOpen ? 'Tutup' : 'Sesuaikan'}</span>
                {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isAdvancedOpen && (
              <div className="p-4 border-t border-subtle space-y-4 bg-surface/50 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                      Urutan acak
                    </label>
                    <select
                      value={shuffleMode}
                      onChange={(e) => setShuffleMode(e.target.value as ShuffleMode)}
                      className="w-full bg-elevated border border-subtle rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-app-primary focus:outline-none focus:border-accent"
                    >
                      <option value="no_repeat">Tanpa pengulangan (semua foto rata)</option>
                      <option value="pure_shuffle">Acak sepenuhnya</option>
                      <option value="favorites_only">Hanya foto favorit</option>
                      <option value="unseen_only">Foto yang belum dilihat lebih dulu</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                      Penyesuaian foto
                    </label>
                    <SegmentedControl
                      options={[
                        { value: 'cover', label: 'Penuhi bingkai' },
                        { value: 'contain', label: 'Muat seluruh foto' },
                      ]}
                      value={fitMode}
                      onChange={(val) => setFitMode(val as ImageFitMode)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-subtle bg-surface/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-app-muted">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sematkan dan ganti foto kapan saja</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="w-1/3 sm:w-auto text-xs sm:text-sm">
              Batal
            </Button>
            {currentReadyCount > 0 && (
              <Button
                variant="primary"
                size="md"
                icon={<Play className="w-4 h-4 fill-current" />}
                onClick={handleStart}
                className="flex-1 sm:flex-initial sm:px-7 shadow-lg shadow-accent/20 text-xs sm:text-sm font-semibold"
              >
                Mulai sesi ({photoCount} foto)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
