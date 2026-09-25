import React from 'react';
import { CheckCircle2, Clock, Eye, Heart, Star, Bookmark, Calendar as CalendarIcon, Play, Home } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationSeconds: number;
  photosViewed: number;
  likesCount: number;
  favoritesCount: number;
  keptCount: number;
  onViewCalendar: () => void;
  onStartNewSession: () => void;
  onGoHome: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  durationSeconds,
  photosViewed,
  likesCount,
  favoritesCount,
  keptCount,
  onViewCalendar,
  onStartNewSession,
  onGoHome,
}) => {
  if (!isOpen) return null;

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const durationText = mins > 0 ? `${mins} mnt ${secs} dtk` : `${secs} dtk`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sesi tercatat" maxWidth="max-w-md">
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-app-primary">Sesi selesai</h3>
          <p className="text-xs text-app-muted mt-1">
            Aktivitas dan durasi sudah disimpan di kalender pribadi Anda.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-xl bg-elevated/60 border border-subtle">
            <span className="flex items-center gap-1.5 text-xs text-app-muted">
              <Clock className="w-3.5 h-3.5 text-accent" /> Durasi
            </span>
            <p className="text-lg font-bold text-accent mt-0.5">{durationText}</p>
          </div>

          <div className="p-3 rounded-xl bg-elevated/60 border border-subtle">
            <span className="flex items-center gap-1.5 text-xs text-app-muted">
              <Eye className="w-3.5 h-3.5 text-app-secondary" /> Foto dilihat
            </span>
            <p className="text-lg font-bold text-app-primary mt-0.5">{photosViewed}</p>
          </div>

          <div className="p-3 rounded-xl bg-elevated/60 border border-subtle">
            <span className="flex items-center gap-1.5 text-xs text-app-muted">
              <Heart className="w-3.5 h-3.5 text-heart" /> Foto disukai
            </span>
            <p className="text-lg font-bold text-app-primary mt-0.5">{likesCount}</p>
          </div>

          <div className="p-3 rounded-xl bg-elevated/60 border border-subtle">
            <span className="flex items-center gap-1.5 text-xs text-app-muted">
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" /> Tersimpan lokal
            </span>
            <p className="text-lg font-bold text-app-primary mt-0.5">{keptCount}</p>
          </div>
        </div>

        <p className="text-sm text-app-muted">Favorit: {favoritesCount}</p>
        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="primary"
            icon={<CalendarIcon className="w-4 h-4" />}
            onClick={() => {
              onViewCalendar();
            }}
          >
            Lihat kalender
          </Button>

          <Button
            variant="secondary"
            icon={<Play className="w-4 h-4" />}
            onClick={() => {
              onStartNewSession();
            }}
          >
            Mulai sesi lagi
          </Button>

          <Button
            variant="ghost"
            icon={<Home className="w-4 h-4" />}
            onClick={() => {
              onGoHome();
            }}
          >
            Kembali ke beranda
          </Button>
        </div>
      </div>
    </Modal>
  );
};
