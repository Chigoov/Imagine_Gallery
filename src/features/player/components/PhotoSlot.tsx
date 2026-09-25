import React, { useEffect, useState } from 'react';
import { Heart, Star, Bookmark, Pin, RotateCw, Maximize2, AlertCircle, MoreHorizontal, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { Photo } from '../../../types/photo';
import { ImageFitMode } from '../../../types/session';
import { BottomSheet } from '../../../components/ui/BottomSheet';

interface PhotoSlotProps {
  slotIndex: number;
  photo: Photo | null;
  pinned: boolean;
  fitMode: ImageFitMode;
  onTogglePin: (slotIndex: number) => void;
  onReplaceOne: (slotIndex: number) => void;
  onToggleLike: (photoId: string) => void;
  onToggleFavorite: (photoId: string) => void;
  onKeepPhoto: (photo: Photo) => void;
  onToggleHide: (photoId: string) => void;
  onFocusPhoto: (photo: Photo) => void;
  onActionsOpenChange?: (open: boolean) => void;
  isControlsVisible?: boolean;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({ slotIndex, photo, pinned, fitMode, onTogglePin, onReplaceOne, onToggleLike, onToggleFavorite, onKeepPhoto, onToggleHide, onFocusPhoto, onActionsOpenChange, isControlsVisible = true }) => {
  const [isActionsOpen, setActionsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  useEffect(() => { setImageError(false); }, [photo?.url]);
  useEffect(() => {
    onActionsOpenChange?.(isActionsOpen);
    return () => { if (isActionsOpen) onActionsOpenChange?.(false); };
  }, [isActionsOpen, onActionsOpenChange]);

  if (!photo) return <div className="w-full h-full min-h-0 bg-player flex items-center justify-center rounded-slot border border-subtle"><span className="text-xs text-app-muted">Tidak ada foto yang tersedia</span></div>;
  const unavailable = photo.missing || imageError;
  return (
    <div className={clsx('group relative w-full h-full min-h-0 min-w-0 overflow-hidden bg-player rounded-slot', pinned ? 'ring-2 ring-pin/70' : 'border border-white/5')}>
      {unavailable ? <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
        <AlertCircle className="w-6 h-6 text-red-400" /><span className="text-xs">{photo.remote_url ? 'Foto Drive tidak dapat dimuat. Periksa akses publiknya.' : 'Foto tidak tersedia.'}</span>
        <button type="button" onClick={() => onReplaceOne(slotIndex)} className="p-2 bg-surface rounded-lg text-xs">Ganti foto</button>
      </div> : <button type="button" className="w-full h-full block" onClick={() => onFocusPhoto(photo)} aria-label={`Fokuskan ${photo.display_name}`}>
        <img src={photo.url} alt={photo.display_name} referrerPolicy="no-referrer" className={clsx('w-full h-full', fitMode === 'cover' ? 'object-cover' : 'object-contain')} onError={() => setImageError(true)} loading="eager" decoding="async" />
      </button>}
      {pinned && <span className="absolute top-2 right-2 pointer-events-none flex gap-1 items-center px-2 py-1 rounded-full bg-pin/90 text-player text-[11px] font-bold"><Pin className="w-3 h-3 fill-current" />PIN</span>}
      <div className={clsx('absolute bottom-0 inset-x-0 flex justify-center gap-1 p-1 bg-gradient-to-t from-player/95 to-transparent transition-opacity duration-control group-hover:opacity-100 group-focus-within:opacity-100', isControlsVisible ? 'opacity-100' : 'opacity-0')}>
        <button type="button" onClick={() => onTogglePin(slotIndex)} aria-label={pinned ? 'Lepas sematan foto' : 'Sematkan foto'} aria-pressed={pinned} className={clsx('w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-black/60', pinned ? 'text-pin' : 'text-white')}><Pin className={clsx('w-4 h-4', pinned && 'fill-current')} /></button>
        <button type="button" onClick={() => onReplaceOne(slotIndex)} aria-label="Ganti foto" className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-black/60 text-white"><RotateCw className="w-4 h-4" /></button>
        <button type="button" onClick={() => setActionsOpen(true)} aria-label={`Aksi lainnya untuk ${photo.display_name}`} className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-black/60 text-white"><MoreHorizontal className="w-4 h-4" /></button>
      </div>
      <BottomSheet isOpen={isActionsOpen} onClose={() => setActionsOpen(false)} title={photo.display_name}>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={photo.liked} onClick={() => onToggleLike(photo.id)} className="flex items-center gap-2 p-3 rounded-xl bg-elevated"><Heart className={clsx('w-5 h-5 text-heart', photo.liked && 'fill-current')} />{photo.liked ? 'Batal suka' : 'Sukai'}</button>
          <button type="button" aria-pressed={photo.favorite} onClick={() => onToggleFavorite(photo.id)} className="flex items-center gap-2 p-3 rounded-xl bg-elevated"><Star className={clsx('w-5 h-5 text-fav', photo.favorite && 'fill-current')} />Favorit</button>
          <button type="button" onClick={() => { setActionsOpen(false); onKeepPhoto(photo); }} className="flex items-center gap-2 p-3 rounded-xl bg-elevated"><Bookmark className="w-5 h-5" />Simpan</button>
          <button type="button" onClick={() => { setActionsOpen(false); onFocusPhoto(photo); }} className="flex items-center gap-2 p-3 rounded-xl bg-elevated"><Maximize2 className="w-5 h-5" />Fokus</button>
          <button type="button" onClick={() => { setActionsOpen(false); onToggleHide(photo.id); }} className="flex items-center gap-2 p-3 rounded-xl bg-elevated text-red-400"><EyeOff className="w-5 h-5" />Sembunyikan</button>
        </div>
      </BottomSheet>
    </div>
  );
};
