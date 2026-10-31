import React, { useEffect, useState, useRef } from 'react';
import {
  Heart,
  Star,
  Bookmark,
  EyeOff,
  RotateCcw,
  Trash2,
  ImageOff,
  Tag,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Maximize2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Photo } from '../../../types/photo';
import { BottomSheet } from '../../../components/ui/BottomSheet';

interface PhotoCardProps {
  photo: Photo;
  onPhotoClick: (photo: Photo) => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEditTags: (photo: Photo) => void;
  onKeepPhoto: (photo: Photo) => void;
  onToggleHide: (id: string) => void;
  onRemoveDriveLink: (photo: Photo) => void;
  onAddFiles?: (files: FileList | File[]) => void;
  onReconnectPhoto?: (photoId: string, file: File) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onPhotoClick,
  onToggleLike,
  onToggleFavorite,
  onEditTags,
  onKeepPhoto,
  onToggleHide,
  onRemoveDriveLink,
  onAddFiles,
  onReconnectPhoto,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const reconnectInputRef = useRef<HTMLInputElement | null>(null);
  const mobileReconnectInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => setImageError(false), [photo.thumbnail_url, photo.url]);

  const photoStatus = photo.kept
    ? { label: 'Salinan tersimpan', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' }
    : photo.missing
    ? { label: 'Perlu dipilih ulang', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' }
    : { label: 'Tersedia', color: 'text-app-secondary bg-surface/80 border-subtle' };

  const handleReconnectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onReconnectPhoto) {
        onReconnectPhoto(photo.id, file);
      } else if (onAddFiles) {
        onAddFiles([file]);
      }
      setIsMenuOpen(false);
    }
    e.target.value = '';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Buka ${photo.display_name}`}
      onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onPhotoClick(photo); } }}
      onClick={() => { if (!imageError) onPhotoClick(photo); }}
      className="photo-card group relative aspect-square rounded-2xl overflow-hidden bg-elevated border border-subtle hover:border-strong cursor-pointer transition-all duration-200 shadow-glass"
    >
      <img
        src={photo.thumbnail_url || photo.url}
        alt={photo.display_name}
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className={clsx(
          'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
          photo.hidden && 'filter grayscale opacity-50',
          photo.missing && 'filter brightness-75'
        )}
        loading="lazy"
      />
      {imageError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center bg-elevated text-app-muted">
        <ImageOff className="w-6 h-6" />
        <span className="text-[11px]">{photo.remote_url ? 'Foto Drive tidak dapat dimuat. Periksa akses tautan publiknya.' : 'Foto tidak dapat dimuat.'}</span>
      </div>}

      {/* Badges on Top */}
      <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
        <div className="flex flex-wrap items-center gap-1">
          {photo.favorite && (
            <span className="p-1 rounded-md bg-fav/90 text-player shadow text-xs" title="Favorit">
              <Star className="w-3 h-3 fill-current" />
            </span>
          )}
          {photo.liked && (
            <span className="p-1 rounded-md bg-heart/90 text-white shadow text-xs" title="Disukai">
              <Heart className="w-3 h-3 fill-current" />
            </span>
          )}
          {photo.kept ? (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-player shadow text-[10px] font-semibold flex items-center gap-1" title="Salinan tersimpan di basis data aplikasi">
              <Bookmark className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Salinan tersimpan</span>
            </span>
          ) : photo.missing ? (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/95 text-player shadow text-[10px] font-bold flex items-center gap-1 animate-pulse-subtle" title="Perlu dipilih ulang dari perangkat">
              <RotateCcw className="w-3 h-3" />
              <span>Perlu dipilih ulang</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          {photo.hidden && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[10px] font-semibold">
              Disembunyikan
            </span>
          )}

          {/* Action Trigger Button: Always accessible on mobile touch & keyboard */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(true);
            }}
            aria-label={`Aksi untuk ${photo.display_name}`}
            className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 active:bg-accent/30 text-white/90 hover:text-white transition-colors flex items-center justify-center shadow backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hover action overlay */}
      <div
        className="photo-card-actions absolute inset-0 bg-gradient-to-t from-player via-player/40 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-140 flex flex-col justify-end p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold text-app-primary line-clamp-1 mb-1">
          {photo.display_name}
        </p>

        {/* Status Pill in Overlay */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-medium', photoStatus.color)}>
            {photoStatus.label}
          </span>
          {photo.missing && onAddFiles && (
            <label
              className="cursor-pointer text-[10px] px-2 py-0.5 rounded-full bg-accent text-player font-bold hover:bg-accent-hover transition-colors flex items-center gap-1 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Hubungkan</span>
              <input
                ref={reconnectInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onAddFiles(e.target.files);
                  }
                }}
              />
            </label>
          )}
        </div>

        {photo.tags?.length ? <p className="text-[10px] text-app-secondary line-clamp-1 mb-2">{photo.tags.join(' · ')}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => onToggleLike(photo.id)}
              className={clsx(
                'p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg transition-colors',
                photo.liked ? 'text-heart bg-heart/20' : 'text-white/80 hover:text-white bg-black/40'
              )}
              title="Sukai"
            >
              <Heart className={clsx('w-3.5 h-3.5', photo.liked && 'fill-current')} />
            </button>

            <button
              onClick={() => onToggleFavorite(photo.id)}
              className={clsx(
                'p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg transition-colors',
                photo.favorite ? 'text-fav bg-fav/20' : 'text-white/80 hover:text-white bg-black/40'
              )}
              title="Favorit"
            >
              <Star className={clsx('w-3.5 h-3.5', photo.favorite && 'fill-current')} />
            </button>

            <button
              onClick={() => onEditTags(photo)}
              className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-white/80 hover:text-accent bg-black/40"
              title="Ubah tag"
              aria-label={`Ubah tag ${photo.display_name}`}
            >
              <Tag className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onKeepPhoto(photo)}
              className={clsx(
                'p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg transition-colors',
                photo.kept ? 'text-emerald-400 bg-emerald-500/20' : 'text-white/80 hover:text-white bg-black/40'
              )}
              title="Simpan salinan"
            >
              <Bookmark className={clsx('w-3.5 h-3.5', photo.kept && 'fill-current')} />
            </button>
          </div>

          <button
            onClick={() => onToggleHide(photo.id)}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-white/80 hover:text-red-400 bg-black/40 hover:bg-black/60 transition-colors"
            title={photo.hidden ? 'Pulihkan foto' : 'Sembunyikan dari acak'}
          >
            {photo.hidden ? <RotateCcw className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          {photo.remote_url && <button
            onClick={(event) => { event.stopPropagation(); onRemoveDriveLink(photo); }}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-red-300 hover:text-red-200 bg-black/40 hover:bg-black/60 transition-colors"
            title="Hapus tautan Drive dari galeri ini"
            aria-label={`Hapus tautan ${photo.display_name} dari galeri`}
          ><Trash2 className="w-3.5 h-3.5" /></button>}
        </div>
      </div>

      {/* Mobile Action Bottom Sheet */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title={photo.display_name}>
        <div className="space-y-4">
          {/* Status & info strip */}
          <div className="p-3 rounded-xl bg-elevated border border-subtle flex items-center justify-between">
            <div>
              <span className={clsx('text-xs px-2.5 py-0.5 rounded-full border font-semibold', photoStatus.color)}>
                {photoStatus.label}
              </span>
              <p className="text-[11px] text-app-muted mt-1.5">
                {photo.original_filename} {photo.file_size ? `• ${(photo.file_size / 1024).toFixed(0)} KB` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onPhotoClick(photo);
              }}
              className="p-2 rounded-lg bg-surface border border-subtle text-app-primary text-xs flex items-center gap-1.5 hover:bg-elevated"
            >
              <Maximize2 className="w-3.5 h-3.5 text-accent" />
              <span>Buka</span>
            </button>
          </div>

          {/* Reconnect button inside bottom sheet if photo is missing */}
          {photo.missing && (
            <label className="cursor-pointer w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-accent text-player font-bold shadow-md hover:bg-accent-hover transition-colors text-xs">
              <RotateCcw className="w-4 h-4" />
              <span>Pilih berkas untuk menghubungkan foto ini</span>
              <input
                ref={mobileReconnectInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReconnectFile}
              />
            </label>
          )}

          {/* Action grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onToggleLike(photo.id);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-elevated hover:bg-surface border border-subtle text-app-primary"
            >
              <Heart className={clsx('w-4 h-4 text-heart', photo.liked && 'fill-current')} />
              <span>{photo.liked ? 'Batal suka' : 'Sukai'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleFavorite(photo.id);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-elevated hover:bg-surface border border-subtle text-app-primary"
            >
              <Star className={clsx('w-4 h-4 text-fav', photo.favorite && 'fill-current')} />
              <span>{photo.favorite ? 'Batal favorit' : 'Favorit'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onKeepPhoto(photo);
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-elevated hover:bg-surface border border-subtle text-app-primary"
            >
              <Bookmark className={clsx('w-4 h-4 text-emerald-400', photo.kept && 'fill-current')} />
              <span>{photo.kept ? 'Koleksi lain' : 'Simpan salinan'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onEditTags(photo);
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-elevated hover:bg-surface border border-subtle text-app-primary"
            >
              <Tag className="w-4 h-4 text-accent" />
              <span>Ubah tag</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleHide(photo.id);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-elevated hover:bg-surface border border-subtle text-app-secondary"
            >
              {photo.hidden ? <RotateCcw className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
              <span>{photo.hidden ? 'Pulihkan foto' : 'Sembunyikan'}</span>
            </button>

            {photo.remote_url && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onRemoveDriveLink(photo);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-elevated hover:bg-surface border border-subtle text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus tautan</span>
              </button>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
