import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Star, Bookmark, Pin, ZoomIn, ZoomOut } from 'lucide-react';
import { clsx } from 'clsx';
import { Photo } from '../../../types/photo';
import { Modal } from '../../../components/ui/Modal';

interface FocusModeModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onKeepPhoto: (photo: Photo) => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({ photo, isOpen, onClose, isPinned, onTogglePin, onToggleLike, onToggleFavorite, onKeepPhoto }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  useEffect(() => { setZoomLevel(1); }, [photo?.id, isOpen]);
  const toggleZoom = () => setZoomLevel((value) => value === 1 ? 1.6 : value === 1.6 ? 2.2 : 1);
  return <Modal isOpen={isOpen && !!photo} onClose={onClose} variant="fullscreen">
    {photo && <div className="h-full flex flex-col bg-player" onKeyDown={(event) => {
      if (event.repeat || (event.target as HTMLElement).closest('input, textarea, select')) return;
      if (event.code === 'KeyL') onToggleLike(photo.id);
      if (event.code === 'KeyP') onTogglePin();
    }}>
      <div className="p-3 flex shrink-0 items-center gap-4 justify-between">
        <button type="button" onClick={onClose} className="p-3 rounded-xl soft-glass flex shrink-0 items-center gap-2"><ArrowLeft className="w-5 h-5" /><span className="text-sm">Kembali ke papan</span></button>
        <p className="text-sm truncate text-app-muted">{photo.display_name}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
        <div className="w-full h-full flex items-center justify-center" style={{ width: `${zoomLevel * 100}%`, height: `${zoomLevel * 100}%` }}>
        <img src={photo.url} alt={photo.display_name} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
        </div>
      </div>
      <div className="shrink-0 p-3 flex justify-center gap-2 soft-glass">
        <button type="button" onClick={() => onToggleLike(photo.id)} aria-label="Sukai" aria-pressed={photo.liked} className="p-3 rounded-xl"><Heart className={clsx('w-5 h-5 text-heart', photo.liked && 'fill-current')} /></button>
        <button type="button" onClick={() => onToggleFavorite(photo.id)} aria-label="Favorit" aria-pressed={photo.favorite} className="p-3 rounded-xl"><Star className={clsx('w-5 h-5 text-fav', photo.favorite && 'fill-current')} /></button>
        <button type="button" onClick={() => onKeepPhoto(photo)} aria-label="Simpan" className="p-3 rounded-xl"><Bookmark className={clsx('w-5 h-5', photo.kept && 'fill-current')} /></button>
        <button type="button" onClick={onTogglePin} aria-label="Sematkan foto" aria-pressed={isPinned} className="p-3 rounded-xl"><Pin className={clsx('w-5 h-5 text-pin', isPinned && 'fill-current')} /></button>
        <button type="button" onClick={toggleZoom} aria-label="Ubah pembesaran" className="p-3 rounded-xl">{zoomLevel > 1 ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}</button>
      </div>
    </div>}
  </Modal>;
};
