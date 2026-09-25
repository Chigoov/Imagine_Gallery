import React, { useState } from 'react';
import { Play, Sparkles, Sliders, Image as ImageIcon, Eye, Clock, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Collection } from '../../types/collection';
import { SessionConfig, SessionMode, ShuffleMode, ImageFitMode } from '../../types/session';
import { AppSettings } from '../../types/settings';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  totalPhotosCount: number;
  favoritesCount: number;
  likedCount: number;
  defaultSettings: AppSettings;
  initialSourceId?: string;
  onStartSession: (config: SessionConfig) => void;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  isOpen,
  onClose,
  collections,
  totalPhotosCount,
  favoritesCount,
  likedCount,
  defaultSettings,
  initialSourceId,
  onStartSession,
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

  React.useEffect(() => {
    if (!isOpen) return;
    setPhotoCount(defaultSettings.default_photo_count);
    setIntervalSeconds(defaultSettings.default_interval);
    setShuffleMode(defaultSettings.default_shuffle_mode);
    setFitMode(defaultSettings.default_fit_mode);
  }, [isOpen, defaultSettings]);

  if (!isOpen) return null;

  const handleStart = () => {
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
      photoCount,
      mode,
      intervalSeconds,
      layoutMode: 'dynamic',
      shuffleMode,
      fitMode,
    });
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Source Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Sumber foto
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSourceKind('all_photos')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'all_photos'
                    ? 'border-accent bg-accent/15 text-app-primary font-semibold'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium">Semua foto</p>
                <p className="text-[10px] text-app-muted mt-0.5">{totalPhotosCount} tersedia</p>
              </button>

              <button
                type="button"
                onClick={() => setSourceKind('favorites')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'favorites'
                    ? 'border-fav bg-fav/15 text-app-primary font-semibold'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium flex items-center gap-1">
                  <span className="text-fav">★</span> Favorit
                </p>
                <p className="text-[10px] text-app-muted mt-0.5">{favoritesCount} foto</p>
              </button>

              <button
                type="button"
                onClick={() => setSourceKind('liked')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'liked'
                    ? 'border-heart bg-heart/15 text-app-primary font-semibold'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium flex items-center gap-1">
                  <span className="text-heart">♥</span> Disukai
                </p>
                <p className="text-[10px] text-app-muted mt-0.5">{likedCount} foto</p>
              </button>

              <button
                type="button"
                onClick={() => setSourceKind('collection')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  sourceKind === 'collection'
                    ? 'border-accent bg-accent/15 text-app-primary font-semibold'
                    : 'border-subtle bg-elevated/40 text-app-secondary hover:border-strong'
                }`}
              >
                <p className="text-xs font-medium">Koleksi</p>
                <p className="text-[10px] text-app-muted mt-0.5">{collections.length} kelompok</p>
              </button>
            </div>

            {sourceKind === 'collection' && collections.length > 0 && (
              <div className="pt-2 animate-fade-in">
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full bg-elevated border border-subtle rounded-xl px-4 py-2.5 text-sm text-app-primary focus:outline-none focus:border-accent"
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.photo_count} foto)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Photo Count (1 to 5) with Layout Mini-Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                Foto di layar
              </label>
              <span className="text-xs text-accent font-semibold">{photoCount} sekaligus</span>
            </div>

            <SegmentedControl
              options={[
                { value: 1, label: '1 foto' },
                { value: 2, label: '2 foto' },
                { value: 3, label: '3 foto' },
                { value: 4, label: '4 foto' },
                { value: 5, label: '5 foto' },
              ]}
              value={photoCount}
              onChange={(val) => setPhotoCount(val as number)}
              className="w-full"
            />

            {/* Visual Miniature Layout Schema */}
            <div className="mt-2 p-3 bg-player/60 border border-subtle rounded-xl flex items-center justify-center">
              <div className="w-48 h-24 bg-surface/50 border border-white/5 rounded-lg p-1.5 flex gap-1 items-stretch">
                {photoCount === 1 && (
                  <div className="w-full bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent font-mono">
                    Satu foto
                  </div>
                )}
                {photoCount === 2 && (
                  <>
                    <div className="w-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent">1</div>
                    <div className="w-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent">2</div>
                  </>
                )}
                {photoCount === 3 && (
                  <>
                    <div className="w-3/5 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent">Utama 1</div>
                    <div className="w-2/5 flex flex-col gap-1">
                      <div className="h-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent">2</div>
                      <div className="h-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent">3</div>
                    </div>
                  </>
                )}
                {photoCount === 4 && (
                  <div className="w-full grid grid-cols-2 grid-rows-2 gap-1">
                    <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent">1</div>
                    <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent">2</div>
                    <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent">3</div>
                    <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[9px] text-accent">4</div>
                  </div>
                )}
                {photoCount === 5 && (
                  <div className="w-full flex gap-1">
                    <div className="w-1/2 bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[10px] text-accent">Utama</div>
                    <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-1">
                      <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent">2</div>
                      <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent">3</div>
                      <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent">4</div>
                      <div className="bg-accent/20 border border-accent/40 rounded flex items-center justify-center text-[8px] text-accent">5</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mode & Timing */}
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
                  <span className="text-xs text-accent font-semibold">{intervalSeconds}s</span>
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
                <p className="text-xs text-app-muted p-2 rounded-xl bg-elevated/40 border border-subtle">
                  Ganti foto dengan tombol Berikutnya, panah kanan, atau usap layar.
                </p>
              </div>
            )}
          </div>

          {/* Shuffle Rules & Fit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                Urutan acak
              </label>
              <select
                value={shuffleMode}
                onChange={(e) => setShuffleMode(e.target.value as ShuffleMode)}
                className="w-full bg-elevated border border-subtle rounded-xl px-3.5 py-2 text-sm text-app-primary focus:outline-none focus:border-accent"
              >
                <option value="no_repeat">Tanpa pengulangan</option>
                <option value="pure_shuffle">Acak sepenuhnya</option>
                <option value="favorites_only">Favorit saja</option>
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

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-subtle bg-surface/80 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-app-muted">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sematkan dan ganti foto kapan saja</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="w-1/3 sm:w-auto">
              Batal
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<Play className="w-5 h-5 fill-current" />}
              onClick={handleStart}
              className="flex-1 sm:flex-initial sm:px-8"
            >
              Mulai sesi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
